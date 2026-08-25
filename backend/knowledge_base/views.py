import os
from sentence_transformers import SentenceTransformer
from pgvector.django import CosineDistance
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import DocumentChunk, Document
from .serializers import DocumentSerializer
from .tasks import process_document_task
from groq import Groq

# Wahi chhota model yahan load karo
embedding_model = SentenceTransformer('paraphrase-MiniLM-L3-v2')

class DocumentUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            document = serializer.save()
            process_document_task.delay(document.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChatbotView(APIView):
    def post(self, request, *args, **kwargs):
        user_query = request.data.get('query', '')
        document_ids = request.data.get('document_ids', [])
        if not user_query:
            return Response({"error": "Query is required"}, status=400)

        try:
            # Query ko locally vectorize karo
            query_vector = embedding_model.encode(user_query).tolist()

            chunks_qs = DocumentChunk.objects.all()
            if document_ids:
                chunks_qs = chunks_qs.filter(document_id__in=document_ids)

            similar_chunks = chunks_qs.annotate(
                distance=CosineDistance('embedding', query_vector)
            ).order_by('distance')[:5]

            RELEVANCE_THRESHOLD = 0.8
            relevant_chunks = [c for c in similar_chunks if c.distance < RELEVANCE_THRESHOLD]

            if not relevant_chunks:
                return Response({
                    "status": "success",
                    "answer": "I couldn't find relevant information in the uploaded document(s) to answer that. Try rephrasing, or upload a document that covers this topic.",
                    "source_pdf_url": None
                }, status=status.HTTP_200_OK)

            context_text = "\n\n".join([f"Page {chunk.page_number}: {chunk.text_content}" for chunk in relevant_chunks])

            groq_api_key = os.environ.get("GROQ_API_KEY") 
            client = Groq(api_key=groq_api_key)

            system_prompt = f"Answer STRICTLY based on the provided Official Context.\nContext:\n{context_text}"

            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                model="openai/gpt-oss-20b", 
                temperature=0.2
            )
            ai_answer = chat_completion.choices[0].message.content
            
            pdf_url = None
            if relevant_chunks:
                pdf_url = f"{request.build_absolute_uri(relevant_chunks[0].document.file.url)}#page={relevant_chunks[0].page_number}"

            return Response({"status": "success", "answer": ai_answer, "source_pdf_url": pdf_url}, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"CRITICAL ERROR in ChatbotView:\n{error_details}")
            return Response({"error": str(e), "traceback": error_details}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class DocumentStatusView(APIView):
    def get(self, request, pk, *args, **kwargs):
        try:
            doc = Document.objects.get(id=pk)
            return Response({"id": doc.id, "status": doc.status})
        except Document.DoesNotExist:
            return Response({"error": "Not found"}, status=404)