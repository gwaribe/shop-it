# manipulate the inventory

from flask import Blueprint, request, jsonify
from app.db import inventory_collection
from app.models.inventory import create_inventory
from pymongo.errors import DuplicateKeyError

# create blueprint
inventory_bp = Blueprint("inventory", __name__)

@inventory_bp.route("/add-item", methods=["POST"])
def add_inventory_item():
    data = request.get_json()

    required_fields = ["name", "barcode", "price", "stock"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    item = create_inventory(
        name=data["name"],
        barcode=data["barcode"],
        price=data["price"],
        stock=data["stock"],
        category=data["category"]
    )

    try:
        result = inventory_collection.insert_one(item)
        return jsonify({"message": "Item added", "item_id": str(result.inserted_id)}), 201
    except DuplicateKeyError:
        return jsonify({"error": "Barcode already exists"}), 401

# get item from inventory using barcode
@inventory_bp.route("/get-item/<string:barcode>", methods=["GET"])
def get_item_from_inventory(barcode):
    item = inventory_collection.find_one({"barcode": barcode})
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    # update ObjectId to string for JSON serialization
    item["_id"] = str(item["_id"])
    return jsonify(item), 200

