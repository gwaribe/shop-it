"""Inventory collection"""

def create_inventory(name, barcode, price, stock, category=None):
    """Create a new inventory item."""
    return {
        "name": name,
        "barcode": barcode,
        "price": price,
        "stock": stock,
        "category": category
    }

