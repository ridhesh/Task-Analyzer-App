from django.shortcuts import render

def index(request):
    """Serve the main frontend application"""
    return render(request, 'index.html')