from django.db import models

class NoticiaVerificada(models.Model):
    titulo = models.CharField(max_length=200)
    resumo = models.TextField()
    conteudo = models.TextField()
    fonte_desinformacao = models.CharField(max_length=300, blank=True, null=True)
    explicacao = models.TextField(blank=True, null=True)
    fontes_confiaveis = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo
