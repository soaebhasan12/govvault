import fitz
from sentence_transformers import SentenceTransformer
from .models import Document, DocumentChunk

# Chhota model load karo jo RAM crash na kare
embedding_model = SentenceTransformer('paraphrase-MiniLM-L3-v2')

def process_and_store_pdf(document_id):
    try:
        document = Document.objects.get(id=document_id)
        pdf_document = fitz.open(document.file.path)
        
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text_content = page.get_text("text").strip()
            
            if not text_content:
                continue
                
            # Local model se vector generate karo
            vector_embedding = embedding_model.encode(text_content).tolist()

            DocumentChunk.objects.create(
                document=document,
                text_content=text_content,
                page_number=page_num + 1,
                embedding=vector_embedding
            )
            
        print(f"Document {document.title} vectorized using Local SentenceTransformers!")
            
    except Exception as e:
        print(f"CRITICAL ERROR in process_and_store_pdf: {e}")