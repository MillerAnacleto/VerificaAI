from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("sobre/", views.sobre, name="sobre"),
    path("noticia/<int:noticia_id>/", views.noticia_detalhe, name="noticia_detalhe"),
]
