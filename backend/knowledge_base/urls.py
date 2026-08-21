from django.urls import path
from .views import DocumentUploadView, ChatbotView # ChatbotView import kiya

urlpatterns = [
    path('documents/upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('chat/', ChatbotView.as_view(), name='chat-api'), # Naya rasta
]