# Description

Enable customers to quickly pay for a product without queueing on the counter.

## System Features

### 1. Barcode Scanning

App should be able to:

- Use phone camera to scan product barcode (MVP)
- Validate barcode format
- Handle scan errors

### 2. Inventory Lookup

Should:

- Connect & sync with shop inventory (MVP)
- Fetch item details: name & price (MVP)
- Handle missing or outdated inventory entries

### 3. Item Display (MVP)

Should:

- Show item name and price
- Allow buyer to confirm before proceeding to payment

### 4. Phone Number Entry

Should:

- Show phone number entry field (MVP)
- Validate phone number format

### 5. Mpesa Payment Integration

Should:

- Send STK push request to Mpesa API (MVP)
- Include paybill, acc number, amount and phone number (MVP)
- Handle API errors

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
so:

- build a route to fetch records from db at specified range
- display the records on the frontend
