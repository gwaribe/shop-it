# Database Design

## Db name

shop-it

## Collections

### Inventory

Stores all items available for sale. Barcodes are unique.

```json
{
  "_id": ObjectId,           // MongoDB unique ID
  "name": String,            // Item name
  "barcode": String,         // Barcode (unique)
  "price": Number,           // Price in Ksh
  "stock": Number,           // Current stock count
  "category": String|null    // Category (optional)
}
```

### Transactions

Logs every completed sale and payment attempt. Each transaction is linked to a payment and optionally to an item.

```json
{
  "_id": ObjectId,                // MongoDB unique ID
  "checkout_id": String,          // Mpesa CheckoutRequestID (for tracking)
  "item"?: {
    "name": String,               // Item name
    "barcode": String,            // Barcode
    "price": Number               // Price at time of sale
  },
  "payment": {
    "amount_paid": Number,        // Amount paid
    "mpesa_code": String,         // Mpesa receipt code
    "phone_number": String,       // Customer phone number
    "datetime": ISODate           // Payment date/time (from Mpesa)
  }
}
```

#### Notes

- `checkout_id` is used to poll payment status and link frontend to backend.
- `item` may be omitted for failed/canceled payments.
- `payment.datetime` is the timestamp from Mpesa (format: YYYYMMDDHHMMSS as integer, e.g., 20240819123456).
- All amounts are in Kenyan Shillings (Ksh).
