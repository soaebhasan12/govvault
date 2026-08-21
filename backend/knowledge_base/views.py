from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import DocumentSerializer
from .services import process_and_store_pdf

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