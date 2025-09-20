require("dotenv").config();
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


async function checkAndReplyToMentions() {
  try {
    const processedTweets = await loadProcessedTweets();

    console.log("Buscando novas menções...");

    const mentions = await twitterUserClient.v2.userMentionTimeline(BOT_USER_ID, {
      "tweet.fields": ["author_id", "in_reply_to_user_id"],
      expansions: ["author_id", "referenced_tweets.id"],
      max_results: 10,
    });
    
    // Filtra apenas os tweets que são respostas a outros tweets,
    // e que ainda não foram processados
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

        // AQUI ESTÁ A SEGUNDA MUDANÇA: encontre o tweet de referência
        const referencedTweet = mentions.data.includes.tweets.find(
          (tweet) => tweet.id === mention.referenced_tweets[0].id
        );

        if (referencedTweet) {
          console.log(`\n--- Menção de @${userName} encontrada ---`);
          console.log(`ID do Tweet de menção: ${mention.id}`);
          console.log(`Texto do Tweet de menção: "${mention.text}"`);
          console.log(`\n--- Informações do Tweet Original ---`);
          console.log(`ID do Tweet original: ${referencedTweet.id}`);
          console.log(`Texto do Tweet original: "${referencedTweet.text}"`);
          console.log(`----------------------------------\n`);
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

// Configura o bot para rodar a cada 30 segundos
setInterval(checkAndReplyToMentions, 1 * 30 * 1000);

// Executa a função na inicialização
checkAndReplyToMentions();