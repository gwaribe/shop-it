/**
 * Shop-It Main Application Script
 * Sets up event listeners and initializes the application
 */

document.addEventListener("DOMContentLoaded", function () {
    // Clear button event listener
    document.getElementById("clear-btn").addEventListener("click", function () {
        document.getElementById("item-display").style.display = "none";
        document.getElementById("scan-result").classList.add("d-none");
        document.getElementById("clear-btn").style.display = "none";
        document.getElementById("item-error").classList.add("d-none");
        document.getElementById("manual-entry-container").style.display = "none";
    });

    // Show phone entry card, hide item display
    document.getElementById("proceed-btn").addEventListener("click", function () {
        document.getElementById("item-display").style.display = "none";
        document.getElementById("phone-entry-card").style.display = "block";
    });

    // Back button: show item display, hide phone entry
    document.getElementById("back-btn").addEventListener("click", function () {
        document.getElementById("phone-entry-card").style.display = "none";
        document.getElementById("item-display").style.display = "block";
    });

    // Handle OK button click for payment
    document.getElementById("ok-btn").addEventListener("click", function () {
        const phoneNumber = document.getElementById("phone-number").value;
        const priceText = document.getElementById("item-price").textContent;
        const amount = parseInt(priceText.replace("Ksh", "").trim());

        console.log("Initiating payment with phone:", phoneNumber, "amount:", amount);

        fetch("/mpesa/pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber, amount })
        })
            .then(res => {
                console.log("Payment response status:", res.status);
                return res.json();
            })
            .then(data => {
                console.log("Payment response data:", data);
                window.lastCheckoutId = data.CheckoutRequestID;
                console.log("Starting polling with checkout ID:", window.lastCheckoutId);
                window.pollPaymentStatus(window.lastCheckoutId); // Start polling immediately
            })
            .catch(err => {
                console.error("Payment error:", err);
                window.showFailedCard();
            });
    });

    // Manual barcode entry handling
    document.getElementById("submit-barcode").addEventListener("click", function () {
        submitManualBarcode();
    });

    // Submit barcode on Enter key
    document.getElementById("manual-barcode").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            submitManualBarcode();
        }
    });

    /**
     * Process manually entered barcode
     */
    function submitManualBarcode() {
        const barcode = document.getElementById("manual-barcode").value.trim();
        if (barcode) {
            showScanResult(barcode);
            fetchItemDetails(barcode);
            hideManualEntry();
        } else {
            showItemError("Please enter a valid barcode number.");
        }
    }
});
