# Shop-It API Reference

This document describes all custom-built API endpoints for the Shop-It application. All endpoints return JSON responses and use RESTful conventions.

---

## Inventory APIs

### Add Inventory Item

- **Endpoint:** `POST /inventory/add-item`
- **Description:** Add a new item to the inventory.
- **Request Body (JSON):**

  ```json
  {
    "name": "Item Name",
    "barcode": "1234567890123",
    "price": 100,
    "stock": 10,
    "category": "Category Name" // optional
  }
  ```

- **Responses:**
  - `201 Created`: `{ "message": "Item added", "item_id": "..." }`
  - `400 Bad Request`: `{ "error": "Missing required fields" }`
  - `401 Unauthorized`: `{ "error": "Barcode already exists" }`

---

### Get Inventory Item by Barcode

- **Endpoint:** `GET /inventory/get-item/<barcode>`
- **Description:** Fetch item details by barcode.
- **Response:**
  - `200 OK`: Item object (see dbschema)
  - `404 Not Found`: `{ "error": "Item not found" }`

---

## Payment APIs

### Initiate Mpesa Payment

- **Endpoint:** `POST /mpesa/pay`
- **Description:** Initiate an Mpesa STK push payment.
- **Request Body (JSON):**

  ```json
  {
    "phoneNumber": "2547XXXXXXXX",
    "amount": 100
  }
  ```

- **Responses:**
  - `200 OK`: `{ "CheckoutRequestID": "...", ... }`
  - `400 Bad Request`: `{ "error": "Invalid phone number format. Must be 254 followed by 9 digits." }`

---

### Mpesa Payment Callback

- **Endpoint:** `POST /mpesa/callback`
- **Description:** Receives payment status from Mpesa.
- **Request Body:** Mpesa callback JSON (see Daraja docs)
- **Response:**
  - `200 OK`: `{ "status": "success", "confirmation": { ... } }` or `{ "status": "failed" }`

---

### Poll Payment Status

- **Endpoint:** `GET /mpesa/last-status?checkout_id=<id>`
- **Description:** Polls for the status of a payment using the CheckoutRequestID.
- **Response:**
  - `200 OK`: `{ "status": "success", "confirmation": { ... } }` or `{ "status": "failed" }`
  - `400 Bad Request`: `{ "status": "failed", "message": "CheckoutRequestID is required" }`

---

## Notes

- All endpoints return JSON.
- All errors are returned as `{ "error": "..." }` or `{ "status": "failed" }`.
- See [DB design](/docs/dbschema.md) for data structure details.
