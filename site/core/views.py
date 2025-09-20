from django.shortcuts import render, get_object_or_404
from .models import NoticiaVerificada
import requests

API_URL = "http://172.16.21.154:8000/reports"

def sobre(request):
    return render(request, "core/sobre.html")

def index(request):
    try:
        response = requests.get(API_URL, timeout=5)
        response.raise_for_status()
        noticias = response.json()
    except requests.exceptions.RequestException:
        noticias = []  # se a API estiver fora, não quebra o site

    return render(request, "core/index.html", {"noticias": noticias})

def noticia_detalhe(request, id):
    try:
        response = requests.get(f"{API_URL}/{id}", timeout=5)
        response.raise_for_status()
        noticia = response.json()
    except requests.exceptions.RequestException:
        noticia = None

    return render(request, "core/noticia_detalhe.html", {"noticia": noticia})


