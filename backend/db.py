import sqlite3

DB_PATH = "../data/classes_fa25_updated.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
