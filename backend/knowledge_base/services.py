import os
import fitz  # PyMuPDF
from google import genai
from .models import Document, DocumentChunk

gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def process_and_store_pdf(document_id):
    try:
        document = Document.objects.get(id=document_id)
        file_path = document.file.path
        
        pdf_document = fitz.open(file_path)
        
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text_content = page.get_text("text").strip()
            
            if not text_content:
                continue

            # 2. NAYA EMBEDDING SYNTAX
            response = gemini_client.models.embed_content(
                model="text-embedding-004",
                contents=text_content
            )
            # Nayi library me data list of lists me aata hai, isliye [0] lagaya
            vector_embedding = response.embeddings[0].values 

            DocumentChunk.objects.create(
                document=document,
                text_content=text_content,
                page_number=page_num + 1,
                embedding=vector_embedding
            )
            
        print(f"Document {document.title} successfully vectorized using NEW Gemini SDK!")
            
    except Exception as e:
        print(f"Error processing document: {e}")