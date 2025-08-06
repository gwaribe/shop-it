# Database Design

## Db name

shop-it

## Collections

### Inventory

Stores all items available for sale.

```json
{
  "_id": ObjectId,
  "name": String,
  "barcode": String,
  "price": Number,
  "stock": Number,
  "category": String,
}
```

### Transactions

Logs every completed sale.

```json
{
  "_id": ObjectId,
  "item": {
    "name": String,
    "barcode": String,
    "price": Number
  },
  "payment": {
    "amount_paid": Number,
    "mpesa_code": String,
    "phone_number": String,
    "datetime": ISODate
  }
}
```
