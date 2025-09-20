from fastapi import FastAPI
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
from database import Database, Report
from typing import List
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

class Tweet(BaseModel):
    text: str

class APIServer:
    def __init__(self):
        self.app = FastAPI()
        self.db = Database()
        self.reports: List[Report] = self.db.load_reports()
        self.configure_cors()
        self.register_routes()

    def configure_cors(self):
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Allows all origins
            allow_credentials=True,
            allow_methods=["*"],  # Allows all methods
            allow_headers=["*"],  # Allows all headers
        )

    def register_routes(self):
        self.app.post("/analyze", response_model=Report)(self.analyze_tweet)
        self.app.get("/reports", response_model=List[Report])(self.get_reports)

    async def analyze_tweet(self, tweet: Tweet):
        """
        Receives a tweet text, analyzes it using a generative model,
        and returns a report.
        """
        similar_report = self.db.find_similar_report(tweet.text)
        if similar_report:
            return similar_report

        prompt = f"""
        Analise o tweet a seguir, gere um título que resuma o conteúdo, e classifique-o como "Informativo", "Fake News" ou "Sem Provas".
        Forneça uma breve explicação para a sua classificação.

        Tweet: "{tweet.text}"

        Título:
        Classificação:
        Explicação:
        """

        # This is a placeholder for the actual OpenAI API call
        # In a real scenario, you would make a call like:
        # response = openai.Completion.create(
        #     engine="text-davinci-003",
        #     prompt=prompt,
        #     max_tokens=150
        # )
        # title = "Título de Exemplo" # Parsed from response
        # classification = "Fake News" # Parsed from response
        # explanation = "This is a placeholder explanation." # Parsed from response

        # MOCKED RESPONSE FOR NOW
        title = "Alegações Falsas em Tweet"
        classification = "Fake News"
        explanation = "Este tweet contém alegações que não são suportadas por evidências e foram desmentidas por várias fontes."


        report = Report(
            tweet_text=tweet.text,
            report_text=explanation,
            report_type=classification
        )

        self.db.save_report(report)
        self.reports.append(report)
        return report

    async def get_reports(self):
        """
        Returns all the generated reports.
        """
        return self.reports

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

server = APIServer()
app = server.app
