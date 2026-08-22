import os
from google import genai
from pgvector.django import CosineDistance
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import DocumentChunk
from groq import Groq
# from sentence_transformers import SentenceTransformer
from .serializers import DocumentSerializer
from .services import process_and_store_pdf
from dotenv import load_dotenv

# Ye command .env file se API key nikalegi
load_dotenv()

class DocumentUploadView(APIView):
    def post(self, request, *args, **kwargs):
        # 1. React se aane wale data ko Serializer me daalo
        serializer = DocumentSerializer(data=request.data)
        
        # 2. Check karo ki data valid hai ya nahi (e.g., PDF hi hai na?)
        if serializer.is_valid():
            # 3. Database me save karo
            document = serializer.save()
            
            # 4. Background me PDF ko process karne bhej do (Chunking & Embedding)
            # (Asli production me hum isko Celery me bhejte, par abhi prototype ke liye direct call kar rahe hain)
            process_and_store_pdf(document.id)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      
      
      
gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

class ChatbotView(APIView):
    def post(self, request, *args, **kwargs):
        user_query = request.data.get('query', '')
        if not user_query:
            return Response({"error": "Query is required"}, status=400)

        try:
            # 2. NAYA EMBEDDING SYNTAX FOR QUERY
            response = gemini_client.models.embed_content(
                model="text-embedding-004",
                contents=user_query
            )
            query_vector = response.embeddings[0].values

            # ... niche ka pura RAG aur Groq wala code ekdum SAME rahega ...
            similar_chunks = DocumentChunk.objects.annotate(
                distance=CosineDistance('embedding', query_vector)
            ).order_by('distance')[:3]

            context_text = "\n\n".join([f"Page {chunk.page_number}: {chunk.text_content}" for chunk in similar_chunks])

            groq_api_key = os.environ.get("GROQ_API_KEY") 
            client = Groq(api_key=groq_api_key)

            system_prompt = f"Answer STRICTLY based on the provided Official Context.\nContext:\n{context_text}"

            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                model="llama3-8b-8192", 
                temperature=0.2
            )
            ai_answer = chat_completion.choices[0].message.content
            
            pdf_url = None
            if similar_chunks:
                pdf_url = f"{request.build_absolute_uri(similar_chunks[0].document.file.url)}#page={similar_chunks[0].page_number}"

            return Response({"status": "success", "answer": ai_answer, "source_pdf_url": pdf_url}, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"CRITICAL ERROR:\n{error_details}")
            return Response({"error": str(e), "traceback": error_details}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)