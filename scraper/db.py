"""Shared Supabase client and upsert helper for all scrapers."""
import os
from supabase import create_client, Client

SUPABASE_URL = "https://javumfqccehiivkclpja.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdnVtZnFjY2VoaWl2a2NscGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTQ2NjcsImV4cCI6MjEwNjQ3MDY2N30.WFMMyvZnAy4YSm4ocTjGHUlZKgyk37z3PJKpCro6CW0"

_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def upsert_products(products: list[dict]) -> int:
    """Upsert products into Supabase. Returns count of upserted rows."""
    if not products:
        return 0
    db = get_client()
    # Remove uid if present (let DB generate it)
    rows = [{k: v for k, v in p.items() if k != "uid"} for p in products]
    result = db.table("products").upsert(rows, on_conflict="store,id").execute()
    return len(result.data)
