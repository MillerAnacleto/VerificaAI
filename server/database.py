import sqlite3
import json
from typing import List, Optional
from pydantic import BaseModel

class Report(BaseModel):
    id: Optional[int] = None
    title: str
    tweet_text: str
    report_text: str
    report_type: str
    tweet_url: str
    summary: str
    sources: List[str]

class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance.conn = sqlite3.connect('reports.db')
            cls._instance.create_table()
        return cls._instance

    def create_table(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                tweet_text TEXT NOT NULL,
                report_text TEXT NOT NULL,
                report_type TEXT NOT NULL,
                tweet_url TEXT NOT NULL,
                summary TEXT NOT NULL,
                sources TEXT NOT NULL
            )
        """)
        self.conn.commit()

    def load_reports(self) -> List[Report]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, title, tweet_text, report_text, report_type, tweet_url, summary, sources FROM reports")
        reports = []
        for row in cursor.fetchall():
            sources = json.loads(row[7]) if row[7] else []
            reports.append(Report(id=row[0], title=row[1], tweet_text=row[2], report_text=row[3], report_type=row[4], tweet_url=row[5], summary=row[6], sources=sources))
        return reports

    def save_report(self, report: Report) -> int:
        cursor = self.conn.cursor()
        sources_str = json.dumps(report.sources)
        cursor.execute("INSERT INTO reports (title, tweet_text, report_text, report_type, tweet_url, summary, sources) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (report.title, report.tweet_text, report.report_text, report.report_type, report.tweet_url, report.summary, sources_str))
        self.conn.commit()
        return cursor.lastrowid

    def find_similar_report(self, tweet_text: str) -> Optional[Report]:
        # This is a simple similarity check. A more sophisticated check might be needed.
        # For now, we'll just check if the tweet text is already in the database.
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, title, tweet_text, report_text, report_type, tweet_url, summary, sources FROM reports WHERE tweet_text = ?", (tweet_text,))
        row = cursor.fetchone()
        if row:
            sources = json.loads(row[7]) if row[7] else []
            return Report(id=row[0], title=row[1], tweet_text=row[2], report_text=row[3], report_type=row[4], tweet_url=row[5], summary=row[6], sources=sources)
        return None
