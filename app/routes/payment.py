import requests
from flask import Blueprint, request, jsonify
from datetime import datetime
import base64
import os
from dotenv import load_dotenv

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
    phone_number = data["phone_number"]
    amount = data["amount"]

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
    return jsonify(response.json()), response.status_code

# create callback endpoint
@payment_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    # Here you would typically process the callback data
    # For now, we just log it
    print("MPESA Callback Data:", data)
    return jsonify({"status": "success"}), 200
