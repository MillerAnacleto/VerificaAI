from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
from database import Database, Report
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

class Tweet(BaseModel):
    text: str
    tweet_url: str

class ReportSummary(BaseModel):
    id: Optional[int] = None
    title: str
    summary: str

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
        self.app.get("/reports", response_model=List[ReportSummary])(self.get_reports)
        self.app.get("/reports/{id}", response_model=Report)(self.get_report_by_id)

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
        summary = "Este tweet contém alegações que não são suportadas por evidências e foram desmentidas por várias fontes."
        sources = ["https://www.reuters.com/article/factcheck-coronavirus-vaccine-idUSL1N2S61Y4", "https://www.bbc.com/news/56929642"]


        report = Report(
            title=title,
            tweet_text=tweet.text,
            report_text=explanation,
            report_type=classification,
            tweet_url=tweet.tweet_url,
            summary=summary,
            sources=sources
        )

        report.id = self.db.save_report(report)
        self.reports.append(report)
        self.reports.append(report)
        self.reports.append(report)
        self.reports.append(report)
        return report

    async def get_reports(self) -> List[ReportSummary]:
        """
        Returns all the generated reports.
        """
        return [ReportSummary(id=r.id, title=r.title, summary=r.summary) for r in self.reports]

    async def get_report_by_id(self, id: int) -> Report:
        """
        Returns a single report by its ID.
        """
        for report in self.reports:
            if report.id == id:
                return report
        raise HTTPException(status_code=404, detail="Report not found")

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

server = APIServer()
app = server.app
