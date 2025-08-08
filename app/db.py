from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.getenv("mongodb_url")
client = MongoClient(mongo_url)

db = client["shop-it"]

inventory_collection = db["inventory"]
transactions_collection = db["transactions"]