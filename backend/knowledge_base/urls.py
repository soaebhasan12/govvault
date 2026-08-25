from django.urls import path
from .views import DocumentUploadView, ChatbotView, DocumentStatusView

urlpatterns = [
    path('documents/upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('documents/<int:pk>/status/', DocumentStatusView.as_view(), name='document-status'),
    path('chat/', ChatbotView.as_view(), name='chat-api'),
]