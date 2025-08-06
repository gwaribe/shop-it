# Description

Enable customers to quickly pay for a product without queueing on the counter.

## System Features

### 1. Barcode Scanning

App should be able to:

- Use phone camera to scan product barcode (MVP)
- Validate barcode format
- Handle scan errors

**Implementantion**
Use opensauce barcode reader library - [Html5-QRCode](https://github.com/mebjas/html5-qrcode)

### 2. Inventory Lookup

Should:

- Connect & sync with shop inventory (MVP)
- Fetch item details: name & price (MVP)
- Handle missing or outdated inventory entries

**Implementation**
create db in mongodb\
find physical items/products at home that have visible QRcode\
use the playstore app (QR & Barcode scanner) to get the decode barcode number from the item\
create a custom api to upload the found item name, "price", "stock", category, decoded barcode to Inventory collection.\
repeat the process for 5 different items.\
That is now the Inventory mockup data.\
build an api to fetch the item name, price and barcode number from inventory.\
test

### 3. Item Display (MVP)

Should:

- Show item name and price
- Allow buyer to confirm before proceeding to payment

**Implementation**
on successful scan & fetching of items show this popup

### 4. Phone Number Entry

Should:

- Show phone number entry field (MVP)
- Validate phone number format

### 5. Mpesa Payment Integration

Should:

- Send STK push request to Mpesa API (MVP)
- Use my Mpesa phone number as recipient for C2C STK push (MVP)
- Handle API errors

**Implementation**
Setup [Mpesa daraja api account](https://developer.safaricom.co.ke/)\
[watch tutorial](https://youtu.be/NgkDK7eul3s)\
build an api-route for the callback url\
deploy app on render.com\
add the callback url to Mpesa api setup\
test STK push

### 6. Pin Prompt & Confirmation

Should:

- Wait for customer to enter pin on Mpesa prompt (MVP)
- Receive confirmation from Mpesa API (MVP)
- Handle failed or cancelled transactions gracefully

### 7. Payment Confirmation (MVP)

Should:

- Show success message with Mpesa confirmation code

### 8. Receipt Display

Should

- Show receipt on screen with: (item & shop name, datetime, amount & customer phone) (MVP)
- Show option to save receipt locally

---

**For development, I'll need quick visual view of the database**\
install `mongodb for vscode` extension and connect to mongodb.

## Layout overview

![layouts](layouts.png)