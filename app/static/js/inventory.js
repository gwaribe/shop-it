/**
 * Shop-It Inventory Module
 * Handles fetching and displaying inventory items
 */

/**
 * Fetches item details from the server
 * @param {string} barcode - The barcode to look up
 */
function fetchItemDetails(barcode) {
    fetch(`/inventory/get-item/${barcode}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showItemError(data.error);
                return;
            }
            showItemDisplay(data);
        })
        .catch(err => {
            showItemError("Failed to fetch item details.");
        });
}

/**
 * Displays item information on the page
 * @param {Object} item - The item details to display
 */
function showItemDisplay(item) {
    document.getElementById("item-name").textContent = item.name;
    document.getElementById("item-price").textContent = "Ksh " + item.price;
    document.getElementById("item-total").textContent = "Ksh " + item.price;
    document.getElementById("item-display").style.display = "block";
    document.getElementById("proceed-btn").disabled = false;
    document.getElementById("item-error").classList.add("d-none");
    document.getElementById("clear-btn").style.display = "inline-block"; // Show clear button
}

/**
 * Displays an error message
 * @param {string} message - The error message to display
 */
function showItemError(message) {
    const errorDiv = document.getElementById("item-error");
    errorDiv.textContent = message;
    errorDiv.classList.remove("d-none");
    document.getElementById("item-display").style.display = "none";
    document.getElementById("clear-btn").style.display = "none"; // Hide clear button on error
}
