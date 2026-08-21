import pdfplumber
from sentence_transformers import SentenceTransformer
from .models import Document, DocumentChunk

# Ye humara local open-source AI model hai jo 384-dimension ke sticky notes (vectors) banayega
encoder = SentenceTransformer('all-MiniLM-L6-v2')

def process_and_store_pdf(document_id):
    # Database se document nikalo
    doc = Document.objects.get(id=document_id)
    pdf_path = doc.file.path

    print(f"Bhai, {doc.title} ki processing shuru ho gayi hai...")

    # PDFPlumber ka use karke file kholo
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            
            if text:
                # Basic Chunking: Page ke text ko paragraphs me split kar rahe hain
                chunks = text.split('\n\n') 
                
                for chunk_text in chunks:
                    # Faltu empty spaces hatane ke liye
                    cleaned_chunk = chunk_text.strip()
                    if len(cleaned_chunk) > 50:  # Sirf un chunks ko lo jisme thoda meaningful data ho
                        
                        # AI Model se vector (sticky note) generate karwao
                        vector = encoder.encode(cleaned_chunk).tolist()
                        
                        # Database me save kar do!
                        DocumentChunk.objects.create(
                            document=doc,
                            page_number=page_num,
                            text_content=cleaned_chunk,
                            embedding=vector
                        )
    
    print(f"Success! {doc.title} ke vectors database me save ho gaye.")