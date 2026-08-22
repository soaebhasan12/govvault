import os
import fitz
import requests
from .models import Document, DocumentChunk

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

def process_and_store_pdf(document_id):
    try:
        document = Document.objects.get(id=document_id)
        pdf_document = fitz.open(document.file.path)
        
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text_content = page.get_text("text").strip()
            
            if not text_content:
                continue
                
            # REST API se Vector mangwao
            vector_embedding = get_gemini_embedding(text_content)

            DocumentChunk.objects.create(
                document=document,
                text_content=text_content,
                page_number=page_num + 1,
                embedding=vector_embedding
            )
            
        print(f"Document {document.title} vectorized using Raw REST API!")
            
    except Exception as e:
        print(f"Error processing document: {e}")