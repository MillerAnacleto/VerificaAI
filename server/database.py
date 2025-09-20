import sqlite3
from typing import List, Optional
from pydantic import BaseModel

class Report(BaseModel):
    tweet_text: str
    report_text: str
    report_type: str

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
                tweet_text TEXT NOT NULL,
                report_text TEXT NOT NULL,
                report_type TEXT NOT NULL
            )
        """)
        self.conn.commit()

    def load_reports(self) -> List[Report]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT tweet_text, report_text, report_type FROM reports")
        reports = []
        for row in cursor.fetchall():
            reports.append(Report(tweet_text=row[0], report_text=row[1], report_type=row[2]))
        return reports

    def save_report(self, report: Report):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO reports (tweet_text, report_text, report_type) VALUES (?, ?, ?)",
                       (report.tweet_text, report.report_text, report.report_type))
        self.conn.commit()

    def find_similar_report(self, tweet_text: str) -> Optional[Report]:
        # This is a simple similarity check. A more sophisticated check might be needed.
        # For now, we'll just check if the tweet text is already in the database.
        cursor = self.conn.cursor()
        cursor.execute("SELECT tweet_text, report_text, report_type FROM reports WHERE tweet_text = ?", (tweet_text,))
        row = cursor.fetchone()
        if row:
            return Report(tweet_text=row[0], report_text=row[1], report_type=row[2])
        return None
