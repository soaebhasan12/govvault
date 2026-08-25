from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        # Ye wo fields hain jo JSON box me pack hoke React ke paas jayengi
        fields = ['id', 'title', 'file', 'uploaded_at', 'status']