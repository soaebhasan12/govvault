from django.db import models
from pgvector.django import VectorField

class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='government_orders/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class DocumentChunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    page_number = models.IntegerField()
    text_content = models.TextField()
    # 384 dimensions kyunki hum all-MiniLM-L6-v2 open-source model use karenge
    embedding = VectorField(dimensions=384) 

    def __str__(self):
        return f"Chunk of {self.document.title} - Page {self.page_number}"