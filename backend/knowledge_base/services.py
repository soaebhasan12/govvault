import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
from .models import Document, DocumentChunk

# Chota aur halka model jo 512MB RAM me aaram se fit ho jaye
embedding_model = SentenceTransformer('paraphrase-MiniLM-L3-v2')

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
                
            # Local Embedding
            vector_embedding = embedding_model.encode(text_content).tolist()

            DocumentChunk.objects.create(
                document=document,
                text_content=text_content,
                page_number=page_num + 1,
                embedding=vector_embedding
            )
            
        print(f"Document {document.title} successfully vectorized using Local MiniLM!")
            
    except Exception as e:
        print(f"Error processing document: {e}")