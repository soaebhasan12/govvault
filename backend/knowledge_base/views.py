import os
import requests
from pgvector.django import CosineDistance
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import DocumentChunk
from .serializers import DocumentSerializer
from .services import process_and_store_pdf
from groq import Groq

# 1. UPLOAD VIEW (Jo miss ho gaya tha)
class DocumentUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = DocumentSerializer(data=request.data)
        
        if serializer.is_valid():
            document = serializer.save()
            process_and_store_pdf(document.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_request)

# 2. RAW REST API FOR GEMINI
def get_gemini_embedding(text):
    api_key = os.environ.get("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={api_key}"
    payload = {
        "model": "models/text-embedding-004",
        "content": {"parts": [{"text": text}]}
    }
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
    if response.status_code == 200:
        return response.json()['embedding']['values']
    else:
        raise Exception(f"API Error: {response.text}")

# 3. CHAT VIEW
class ChatbotView(APIView):
    def post(self, request, *args, **kwargs):
        user_query = request.data.get('query', '')
        if not user_query:
            return Response({"error": "Query is required"}, status=400)

        try:
            # Question ko vector mein badlo directly API se
            query_vector = get_gemini_embedding(user_query)

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