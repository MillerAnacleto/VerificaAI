const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const { TwitterApi } = require("twitter-api-v2");

const TWITTER_CONFIG = {
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

console.log(
  TWITTER_CONFIG.appKey,
  TWITTER_CONFIG.appSecret,
  TWITTER_CONFIG.accessToken,
  TWITTER_CONFIG.accessSecret
);

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

// Cria uma nova instância do cliente do Twitter
const twitterClient = new TwitterApi(TWITTER_CONFIG);
const twitterUserClient = twitterClient.readWrite;

async function postarOi() {
  const tweetText = "Olá, mundo! Este é um tweet de teste. 😊";
  console.log(`Tentando postar o tweet: "${tweetText}"`);

  try {
    // Posta o tweet usando a API v2
    const { data: createdTweet } = await twitterUserClient.v2.tweet(tweetText);
    console.log(`Tweet postado com sucesso! 🎉 ID: ${createdTweet.id}`);
    console.log(`URL do Tweet: https://twitter.com/user/status/${createdTweet.id}`);
  } catch (error) {
    console.error("Erro ao postar o tweet:", error.message || error);
    if (error.data) {
      console.error("Detalhes do erro da API do Twitter:", error.data);
    }
  }
}

// Executa a função
postarOi();
