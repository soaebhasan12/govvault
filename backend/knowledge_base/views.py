from pgvector.django import CosineDistance
from .models import DocumentChunk
from sentence_transformers import SentenceTransformer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import DocumentSerializer
from .services import process_and_store_pdf
import os
from groq import Groq
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
      
      
      
# Ye humara AI encoder hai jo user ke text ka vector banayega
encoder = SentenceTransformer('all-MiniLM-L6-v2')

class ChatbotView(APIView):
    def post(self, request, *args, **kwargs):
        user_query = request.data.get('query', '')
        
        if not user_query:
            return Response({"error": "Bhai, kuch text toh bhej!"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Vector Conversion
        query_vector = encoder.encode(user_query).tolist()

        # 3. Database Search (Cosine Similarity)
        similar_chunks = DocumentChunk.objects.annotate(
            distance=CosineDistance('embedding', query_vector)
        ).order_by('distance')[:3]

        # 4. Context Preparation
        context_text = "\n\n".join([f"Page {chunk.page_number}: {chunk.text_content}" for chunk in similar_chunks])

        # ---------------------------------------------------------
        # YAHAN SE NAYA CODE SHURU HOTA HAI (LLM Integration)
        # ---------------------------------------------------------

        # Asli API key ko environment variables me rakhna chahiye
        groq_api_key = os.environ.get("GROQ_API_KEY", "tumhari_free_groq_api_key_yahan_aayegi") 
        
        client = Groq(api_key=groq_api_key)

        # AI ko strict instruction diya gaya hai (Judge wala answer yaad hai?)
        system_prompt = f"""
        You are a highly helpful assistant for Government of Uttarakhand.
        Answer the user's question STRICTLY based on the provided Official Context below.
        If the answer is not in the context, say "I cannot find the answer in the official documents."
        
        Official Context:
        {context_text}
        """

        try:
            # Llama-3 (8B) model ko call kar rahe hain
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                model="llama3-8b-8192", 
                temperature=0.2 # Temperature kam rakha hai taaki hallucinate na kare
            )
            
            ai_answer = chat_completion.choices[0].message.content

            # Frontend ko Final Answer bhej rahe hain
            return Response({
                "status": "success",
                "answer": ai_answer,
                # YAHAN MAGIC HUA HAI: Humne URL ke end me #page= page_number jod diya hai
                "source_pdf_url": f"{request.build_absolute_uri(similar_chunks[0].document.file.url)}#page={similar_chunks[0].page_number}" if similar_chunks else None
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)