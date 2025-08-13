# Documentation

## Problem

When customers go to supermarkets, they have to queue at the counter to pay
for their picked items. These is currently solved by having more counters.

But how might we enable the customer to shop good quickly with less hustle?

## Point of View

Since most items have barcodes, we can design an application where customers
pick an item, scan the QRcode, the app displays the item details and price,
customer clicks proceed to payment, the app prompts the customer to enter
Mpesa phone number making the payment, customer enters the number, customer receives a prompt from Mpesa for the payment of the item, customer enters pin and clicks ok, the app receives an Mpesa confirmation message of the
paid item, a receipt is generated and displayed in a downloadable form on
the screens, customer shows the receipt walks out of supermarket.

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
- Fetch item details: name & price using the scanned barcode number (MVP)
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

### 3. Item Display

Should:

- Show item name and price (MVP)
- Allow buyer to confirm before proceeding to payment (MVP)
- customer is able to scan multiple items and each is added to busket.
- customer can see all items added in the busket.
- customer can remove an item from the busket
- customer can checkout/pay for all items -together.

### 4. Phone Number Entry

Should:

- Show phone number entry field (MVP)
- Validate phone number format - only numbers and should be like code(254) then (712345678) -> (254712345678)

### 5. Mpesa Payment Integration

Should:

- Send STK push request using Mpesa API to the entered phone number (MVP)
- Use my Mpesa phone number as recipient for C2C STK push (MVP)
- Handle API errors and show clear feedback to user.

**Implementation**
Setup [Mpesa daraja api account](https://developer.safaricom.co.ke/)\
[watch tutorial](https://youtu.be/NgkDK7eul3s)\
build an api-route for the callback url\
deploy app on render.com\
add the callback url to Mpesa api setup\
test STK push

### 6. Pin Prompt & Confirmation

Should:

- notify customers wheter the mpesa prompt was sent
- show Waiting for customer to complete payment(MVP)
- Receive confirmation from Mpesa API (MVP)
- Handle failed or cancelled transactions gracefully

### 7. Payment Confirmation (MVP)

Should:

- Show success/failure status of the transaction

### 8. Receipt Display

Should

- Show receipt on screen with: (item & shop name, datetime, amount & customer phone and transaction code) (MVP)
- Show option to save receipt locally

---

**For development, I'll need quick visual view of the database**\
install `mongodb for vscode` extension and connect to mongodb.

## Development Tools & Languages

| Category     | Tools / Platforms                          |
|--------------|--------------------------------------------|
| **Platform** | Web-based                                  |
| **Deployment** | [Render](https://www.render.com)         |
| **Code Hosting** | GitHub                                 |
| **AI Assistant** | GPT 4.1                      |
| **IDE**      | VS Code                     |
| **Database** | MongoDB                                    |
| **Languages & Frameworks** | Python, Flask, Jinja, HTML, CSS, JS, Bootstrap |
| **API**      | Mpesa Daraja, HTTPie                       |
| **Browser**  | Google Chrome                              |

## Layout overview

![layouts](layouts.png)
