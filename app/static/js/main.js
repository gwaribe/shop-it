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

    // Validate phone number as user types
    document.getElementById("phone-number").addEventListener("input", validatePhoneNumber);

    // Validate phone number format
    function validatePhoneNumber() {
        const phoneInput = document.getElementById("phone-number");
        const phoneError = document.getElementById("phone-error");
        const okButton = document.getElementById("ok-btn");
        const phoneNumber = phoneInput.value.trim();

        // Check if phone number matches required format: 254 followed by 9 digits
        const isValid = /^254\d{9}$/.test(phoneNumber);

        if (!isValid) {
            phoneInput.classList.add("is-invalid");
            phoneError.classList.remove("d-none");
            okButton.disabled = true;
        } else {
            phoneInput.classList.remove("is-invalid");
            phoneInput.classList.add("is-valid");
            phoneError.classList.add("d-none");
            okButton.disabled = false;
        }

        return isValid;
    }

    // Handle OK button click for payment
    document.getElementById("ok-btn").addEventListener("click", function () {
        // Validate phone number before proceeding
        if (!validatePhoneNumber()) {
            return; // Stop execution if phone number is invalid
        }

        const phoneNumber = document.getElementById("phone-number").value.trim();
        const priceText = document.getElementById("item-price").textContent;
        const amount = parseInt(priceText.replace("Ksh", "").trim());

        console.log("Initiating payment with phone:", phoneNumber, "amount:", amount);

        // Show a waiting indicator
        document.getElementById("ok-btn").disabled = true;
        document.getElementById("ok-btn").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

        fetch("/mpesa/pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber, amount })
        })
            .then(res => {
                console.log("Payment response status:", res.status);
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Payment response data:", data);
                if (data.error) {
                    // Handle server-side validation error
                    throw new Error(data.error);
                }
                window.lastCheckoutId = data.CheckoutRequestID;
                console.log("Starting polling with checkout ID:", window.lastCheckoutId);
                window.pollPaymentStatus(window.lastCheckoutId); // Start polling immediately
            })
            .catch(err => {
                console.error("Payment error:", err);
                // Reset button state on error
                document.getElementById("ok-btn").disabled = false;
                document.getElementById("ok-btn").textContent = "OK";

                // Show error message
                const phoneError = document.getElementById("phone-error");
                phoneError.textContent = err.message || "Payment failed. Please try again.";
                phoneError.classList.remove("d-none");
                document.getElementById("phone-number").classList.add("is-invalid");

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
