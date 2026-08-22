import os
import fitz  # PyMuPDF
import google.generativeai as genai
from .models import Document, DocumentChunk

# 1. Gemini ko API key dekar configure karo
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

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

            # (Optional) Agar text bohot bada hai toh usko chhote chunks (500-1000 words) me todne ka logic yahan aata hai. 
            # Abhi prototype ke liye hum per-page ek chunk maan rahe hain.
            
            # 2. YAHAN CHANGE HUA HAI: SentenceTransformer ki jagah Gemini use kar rahe hain
            # Note: Database me store karte waqt 'retrieval_document' use hota hai
            embedding_result = genai.embed_content(
                model="models/embedding-001",
                content=text_content,
                task_type="retrieval_document" 
            )
            
            vector_embedding = embedding_result['embedding']

            # 3. Database mein chunk aur vector save karo
            DocumentChunk.objects.create(
                document=document,
                text_content=text_content,
                page_number=page_num + 1,
                embedding=vector_embedding
            )
            
        print(f"Document {document.title} successfully vectorized using Gemini!")
            
    except Exception as e:
        print(f"Error processing document: {e}")