const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const { TwitterApi } = require("twitter-api-v2");
const fs = require("fs").promises;

const TWITTER_CONFIG = {
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

// Verifica se as credenciais do Twitter estão no arquivo .env
if (
  !TWITTER_CONFIG.appKey ||
  !TWITTER_CONFIG.appSecret ||
  !TWITTER_CONFIG.accessToken ||
  !TWITTER_CONFIG.accessSecret
) {
  console.error(
    "Erro: Uma ou mais credenciais da API do Twitter estão faltando no seu arquivo .env."
  );
  process.exit(1);
}

const twitterClient = new TwitterApi(TWITTER_CONFIG);
const twitterUserClient = twitterClient.readWrite;

// ID da sua conta de bot. Você pode encontrar este ID no painel de desenvolvedor.
// É um número longo, por exemplo: '1234567890123456789'
const BOT_USER_ID = "1969400609096024064"; 

const PROCESSED_TWEETS_FILE = "./processed_tweets.json";

// Função para carregar os tweets processados do arquivo
async function loadProcessedTweets() {
  try {
    const data = await fs.readFile(PROCESSED_TWEETS_FILE, "utf8");
    return new Set(JSON.parse(data));
  } catch (error) {
    console.log("Arquivo de tweets processados não encontrado. Criando um novo...");
    return new Set();
  }
}

// Função para salvar os tweets processados no arquivo
async function saveProcessedTweets(processedTweets) {
  try {
    const data = JSON.stringify(Array.from(processedTweets), null, 2);
    await fs.writeFile(PROCESSED_TWEETS_FILE, data, "utf8");
  } catch (error) {
    console.error("Erro ao salvar o arquivo de tweets processados:", error);
  }
}


async function sendTweetToAPI(tweetText, tweetUrl) {
  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: tweetText,
        tweet_url: tweetUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro de HTTP! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Resposta do servidor Python:", data);
  } catch (error) {
    console.error("Erro ao enviar tweet para a API:", error);
  }
}

async function checkAndReplyToMentions() {
  try {
    const processedTweets = await loadProcessedTweets();

    console.log("Buscando novas menções...");

    // AQUI ESTÁ A MUDANÇA: Adicionamos "public_metrics" nos campos do tweet
    const mentions = await twitterUserClient.v2.userMentionTimeline(BOT_USER_ID, {
      "tweet.fields": ["author_id", "in_reply_to_user_id", "referenced_tweets", "public_metrics"],
      expansions: ["author_id", "referenced_tweets.id", "referenced_tweets.id.author_id"],
      "user.fields": ["username"],
      max_results: 10,
    });
    
    const newMentions = mentions.data.data.filter(
      (tweet) => !processedTweets.has(tweet.id) && tweet.in_reply_to_user_id
    );

    if (newMentions.length > 0) {
      console.log(`Encontradas ${newMentions.length} novas menções.`);
    } else {
      console.log("Nenhuma nova menção encontrada. Esperando pela próxima verificação...");
    }

    for (const mention of newMentions) {
      try {
        const userId = mention.author_id;
        
        const author = mentions.data.includes.users.find(
          (user) => user.id === userId
        );
        
        const userName = author ? author.username : "usuário";

        const referencedTweet = mentions.data.includes.tweets.find(
          (tweet) => tweet.id === mention.referenced_tweets[0].id
        );

        if (referencedTweet) {
          const originalTweetAuthor = mentions.data.includes.users.find(
            (user) => user.id === referencedTweet.author_id
          );
          
          const originalUsername = originalTweetAuthor ? originalTweetAuthor.username : "usuário-original";
          const originalTweetUrl = `https://twitter.com/${originalUsername}/status/${referencedTweet.id}`;

          // AQUI ESTÁ A SEGUNDA MUDANÇA: Acessando as métricas públicas
          const likesCount = referencedTweet.public_metrics.like_count;
          const repliesCount = referencedTweet.public_metrics.reply_count;
          
          console.log(`\n--- Menção de @${userName} encontrada ---`);
          console.log(`ID do Tweet de menção: ${mention.id}`);
          console.log(`Texto do Tweet de menção: "${mention.text}"`);
          console.log(`\n--- Informações do Tweet Original ---`);
          console.log(`ID do Tweet original: ${referencedTweet.id}`);
          console.log(`Texto do Tweet original: "${referencedTweet.text}"`);
          console.log(`Likes: ${likesCount}`);
          console.log(`Comentários: ${repliesCount}`);
          console.log(`Link do Tweet original: ${originalTweetUrl}`);
          console.log(`----------------------------------\n`);
          const replyText = `Olá, @${originalUsername}! 👋`;

          console.log(`\nTentando comentar no post original de @${originalUsername}...`);
          try {
            const { data: createdReply } = await twitterUserClient.v2.tweet(replyText, {
            reply: { in_reply_to_tweet_id: referencedTweet.id },
            });
            console.log(`Comentário postado com sucesso! 🎉 ID: ${createdReply.id}`);
            console.log(`URL do Comentário: https://twitter.com/user/status/${createdReply.id}`);
          } catch (error) {
            console.error("Erro ao postar o comentário:", error.message || error);
          }
          await sendTweetToAPI(referencedTweet.text, originalTweetUrl);
        } else {
        console.log(`Não foi possível encontrar o tweet de referência para a menção ${mention.id}`);
        }
    
        processedTweets.add(mention.id);
        
        await new Promise((resolve) => setTimeout(resolve, 5000));

      } catch (error) {
        console.error(`Erro ao processar o tweet ${mention.id}:`, error.message);
        processedTweets.add(mention.id);
      }
    }

    await saveProcessedTweets(processedTweets);

  } catch (error) {
    console.error("Erro na busca ou processamento de menções:", error.message || error);
    if (error.data) {
      console.error("Detalhes do erro da API do Twitter:", error.data);
    }
  }
}

// Configura o bot para rodar a cada 5 minutos
setInterval(checkAndReplyToMentions, 5 * 60 * 1000);

// Executa a função na inicialização
checkAndReplyToMentions();
