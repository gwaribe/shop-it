from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.getenv("MONGODB_URL")
if not mongo_url:
	raise EnvironmentError("Environment variable 'MONGODB_URL' is not set.")
client = MongoClient(mongo_url)

db = client["shop_it"]

inventory_collection = db["inventory"]
# no duplicate barcode allowed
inventory_collection.create_index("barcode", unique=True)

transactions_collection = db["transactions"]