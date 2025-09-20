# VerificAI

> Combatendo a desinformação com inteligência artificial e transparência.

## Sobre o Projeto

O **VerificAI** é um projeto desenvolvido para a hackathon do **RAIA** em parceria com a **.monks**, com o objetivo de combater a desinformação na internet.

Consiste em um **bot para o X** que pode ser chamado via **@Verif1cAI**. Ao ser ativado, ele:

* **Verifica o Tweet:** Analisa o conteúdo do tweet original para determinar se é uma notícia falsa.
* **Gera Relatório:** Caso seja uma fake news, ele cria um relatório detalhado explicando os pontos suspeitos e o motivo da decisão.
* **Espalha o Alerta:** O bot comenta no tweet original com o relatório e um alerta, e também busca por outros posts e reposts semelhantes para espalhar o aviso, ampliando o alcance do combate à desinformação.

## Funcionalidades

- **Geração Automática de Relatórios:** Cria relatórios transparentes e detalhados sobre as fake news.
- **Atuação em Rede:** Encontra e alerta sobre reposts do mesmo conteúdo, agindo em escala.
- **Integração com Twitter:** Funciona diretamente na plataforma, sendo fácil de usar e acessível a qualquer usuário.


## Estrutura do Projeto

-   `bot/`: Contém o código do bot que interage diretamente com a API do Twitter, responsável por chamar o servidor e fazer os posts.
-   `server/`: O backend do projeto, onde a mágica acontece. Ele avalia se um tweet é uma fake news, encontra outros tweets relacionados e gera o relatório.
-   `site/`: O frontend, onde os relatórios detalhados são exibidos.

## Autores

- **Artur De Vlieger Lima/Deflyer** - [GitHub](https://github.com/Deflyer)
- **Cairo Henrique Vaz Cotrim/Cairo-Henrique** - [GitHub](https://github.com/Cairo-Henrique)
- **Miller Matheus Anacleto Rocha/MillerAnacleto** - [GitHub](https://github.com/MillerAnacleto)
- **Vitor Amorim Fróis/vitorfrois** - [GitHub](https://github.com/vitorfrois)
