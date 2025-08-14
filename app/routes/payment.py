import requests
from flask import Blueprint, request, jsonify
from datetime import datetime
import base64
import os
from dotenv import load_dotenv
from app.db import transactions_collection, inventory_collection

# Load environment variables
load_dotenv()

payment_bp = Blueprint('payment', __name__)

CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
BUSINESS_NUMBER = os.getenv("BUSINESS_NUMBER")
# running in sandbox mode use default shortcode
BUSINESS_SHORTCODE = os.getenv("MPESA_SHORTCODE", "174379")
PASSKEY = os.getenv("MPESA_PASSKEY")
CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")

def get_access_token():
    if not CONSUMER_KEY or not CONSUMER_SECRET:
        raise ValueError("MPESA Consumer Key and Secret must be set in environment variables.")
    
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(url, auth=(CONSUMER_KEY, CONSUMER_SECRET))
    return response.json().get("access_token")

@payment_bp.route('/pay', methods=['POST'])
def initiate_payment():
    data = request.get_json()
    phone_number = data["phoneNumber"]
    amount = data["amount"]
    
    # Validate phone number format
    import re
    if not re.match(r'^254\d{9}$', phone_number):
        return jsonify({"error": "Invalid phone number format. Must be 254 followed by 9 digits."}), 400

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{BUSINESS_SHORTCODE}{PASSKEY}{timestamp}".encode()).decode()

    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": BUSINESS_NUMBER,
        "PartyB": BUSINESS_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": "Shop-It",
        "TransactionDesc": "Payment for goods"
    }

    headers = {
        "Authorization": f"Bearer {get_access_token()}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers=headers
    )
    resp_json = response.json()
    checkout_id = resp_json.get("CheckoutRequestID")
    # Return this to the frontend
    return jsonify({"CheckoutRequestID": checkout_id, **resp_json}), response.status_code

# create callback endpoint
@payment_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    print("MPESA Callback Data:", data)

    # Safaricom returns ResultCode == 0 for success
    result_code = data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
    if result_code == 0:
        callback = data["Body"]["stkCallback"]
        meta = {item["Name"]: item["Value"] for item in callback["CallbackMetadata"]["Item"]}
        transaction = {
            "checkout_id": callback.get("CheckoutRequestID"),
            "payment": {
                "amount_paid": meta.get("Amount"),
                "mpesa_code": meta.get("MpesaReceiptNumber"),
                "phone_number": meta.get("PhoneNumber"),
                "datetime": meta.get("TransactionDate")
            }
        }
        transactions_collection.insert_one(transaction)
        # serialize the transaction for response
        transaction["_id"] = str(transaction["_id"]) # pyright: ignore[reportArgumentType]

        return jsonify({"status": "success", "confirmation": transaction}), 200
    else:
        # Failed transaction, do not store
        return jsonify({"status": "failed"}), 200

@payment_bp.route('/last-status', methods=['GET'])
def last_status():
    checkout_id = request.args.get("checkout_id")
    if not checkout_id:
        return jsonify({"status": "failed", "message": "CheckoutRequestID is required"}), 400

    tx = transactions_collection.find_one({"checkout_id": checkout_id})
    if tx:
        tx["_id"] = str(tx["_id"])
        return jsonify({"status": "success", "confirmation": tx})
    else:
        return jsonify({"status": "failed"})

