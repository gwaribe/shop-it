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

                // Show waiting for payment card and start polling
                window.showWaitingPaymentCard(phoneNumber, amount);
                window.pollPaymentStatus(window.lastCheckoutId);
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

    // Retry payment button click handler
    document.getElementById("retry-payment-btn").addEventListener("click", function () {
        // Hide failed card and show phone entry card again
        document.getElementById("failed-card").style.display = "none";
        document.getElementById("phone-entry-card").style.display = "block";
        // Reset phone input validation state
        const phoneInput = document.getElementById("phone-number");
        phoneInput.classList.remove("is-invalid");
        phoneInput.classList.remove("is-valid");
        document.getElementById("phone-error").classList.add("d-none");
        // Reset OK button
        document.getElementById("ok-btn").disabled = false;
        document.getElementById("ok-btn").textContent = "OK";
        // Clear any previous payment polling/failed notification state
        if (window.paymentStatusInterval) {
            clearInterval(window.paymentStatusInterval);
            window.paymentStatusInterval = null;
        }
        if (window.paymentStatusTimeout) {
            clearTimeout(window.paymentStatusTimeout);
            window.paymentStatusTimeout = null;
        }
        // Optionally, clear any global state related to last payment
        window.lastCheckoutId = null;
        window.lastPaymentReceipt = null;
    });

    // Back to scan button click handler
    document.getElementById("back-to-scan-btn").addEventListener("click", function () {
        // Hide all cards
        document.getElementById("failed-card").style.display = "none";
        document.getElementById("phone-entry-card").style.display = "none";
        document.getElementById("waiting-payment-card").style.display = "none";
        document.getElementById("confirmation-card").style.display = "none";
        document.getElementById("receipt-card").style.display = "none";
        document.getElementById("item-display").style.display = "none";
        // Reset phone input
        const phoneInput = document.getElementById("phone-number");
        phoneInput.value = "";
        phoneInput.classList.remove("is-invalid");
        phoneInput.classList.remove("is-valid");
        document.getElementById("phone-error").classList.add("d-none");
        // Reset OK button
        document.getElementById("ok-btn").disabled = false;
        document.getElementById("ok-btn").textContent = "OK";
        // Show scanner
        startScanner();
    });

    // Show receipt button handler
    document.getElementById("show-receipt-btn").addEventListener("click", function () {
        // Hide confirmation card, show receipt card
        document.getElementById("confirmation-card").style.display = "none";
        document.getElementById("receipt-card").style.display = "block";
        // Fill in receipt details
        const payment = window.lastPaymentReceipt;
        document.getElementById("receipt-tcode").textContent = payment.mpesa_code;
        document.getElementById("receipt-price").textContent = "Ksh " + payment.amount_paid;
        document.getElementById("receipt-phone").textContent = payment.phone_number;
        // Format timestamp to Kenyan time (Africa/Nairobi) as 'dd/MM HH:mm'
        let dt = payment.datetime;
        let formatted = "-";
        if (dt && dt.length === 14) {
            const year = parseInt(dt.slice(0, 4));
            const month = parseInt(dt.slice(4, 6)) - 1;
            const day = parseInt(dt.slice(6, 8));
            const hour = parseInt(dt.slice(8, 10));
            const min = parseInt(dt.slice(10, 12));
            const sec = parseInt(dt.slice(12, 14));
            // Treat as UTC, convert to Africa/Nairobi
            const dateObj = new Date(Date.UTC(year, month, day, hour, min, sec));
            try {
                // Use options for day/month hour:min (24h)
                formatted = new Intl.DateTimeFormat('en-KE', {
                    day: '2-digit', month: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                    hour12: false,
                    timeZone: 'Africa/Nairobi'
                }).format(dateObj);
                // Remove year if present, and remove seconds
                // Format is usually 'dd/MM/yyyy, HH:mm' or 'dd/MM, HH:mm'
                // We'll extract dd/MM and HH:mm
                let parts = formatted.match(/(\d{2})\/(\d{2})(?:\/\d{4})?, (\d{2}):(\d{2})/);
                if (parts) {
                    formatted = `${parts[1]}/${parts[2]} ${parts[3]}:${parts[4]}`;
                } else {
                    // fallback: try to extract with a different pattern or use manual
                    const nairobiDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
                    const d = nairobiDate.getDate().toString().padStart(2, '0');
                    const m = (nairobiDate.getMonth() + 1).toString().padStart(2, '0');
                    const h = nairobiDate.getHours().toString().padStart(2, '0');
                    const mi = nairobiDate.getMinutes().toString().padStart(2, '0');
                    formatted = `${d}/${m} ${h}:${mi}`;
                }
            } catch (e) {
                // fallback if Intl fails
                const nairobiDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
                const d = nairobiDate.getDate().toString().padStart(2, '0');
                const m = (nairobiDate.getMonth() + 1).toString().padStart(2, '0');
                const h = nairobiDate.getHours().toString().padStart(2, '0');
                const mi = nairobiDate.getMinutes().toString().padStart(2, '0');
                formatted = `${d}/${m} ${h}:${mi}`;
            }
        }
        document.getElementById("receipt-timestamp").textContent = formatted;
        // Item name (from last scanned item)
        document.getElementById("receipt-item").textContent = window.lastScannedItemName || payment.item_name || "-";
    });

    // Back to start from receipt
    document.getElementById("receipt-back-btn").addEventListener("click", function () {
        document.getElementById("receipt-card").style.display = "none";
        // Reset everything and show scanner
        document.getElementById("item-display").style.display = "none";
        document.getElementById("phone-entry-card").style.display = "none";
        document.getElementById("waiting-payment-card").style.display = "none";
        document.getElementById("confirmation-card").style.display = "none";
        document.getElementById("failed-card").style.display = "none";
        startScanner();
    });

    // Save/share receipt button
    document.getElementById("save-receipt-btn").addEventListener("click", function () {
        // Generate a text version of the receipt
        const lines = [
            "Shop-It Receipt",
            "--------------------------",
            "Time: " + document.getElementById("receipt-timestamp").textContent,
            "Item: " + document.getElementById("receipt-item").textContent,
            "Price: " + document.getElementById("receipt-price").textContent,
            "Phone: " + document.getElementById("receipt-phone").textContent,
            "Mpesa Code: " + document.getElementById("receipt-tcode").textContent,
            "Status: Confirmed"
        ];
        const receiptText = lines.join("\n");
        // Try to use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: "Shop-It Receipt",
                text: receiptText
            });
        } else {
            // Fallback: download as .txt file
            const blob = new Blob([receiptText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "shopit-receipt.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // Manual barcode entry handling
    document.getElementById("submit-barcode").addEventListener("click", function () {
        // Ensure scanner is stopped and manual entry UI is visible
        if (typeof stopScanner === 'function') {
            stopScanner();
        }
        document.getElementById("manual-entry-container").style.display = "block";
        submitManualBarcode();
    });

    // Cancel waiting button handler
    document.getElementById("cancel-waiting-btn").addEventListener("click", function () {
        // Clear intervals
        clearInterval(window.elapsedTimeInterval);

        // Show failed card with specific message
        window.showFailedCard("Payment process was canceled by user.");
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

    // Capture last scanned item name for receipt
    window.lastScannedItemName = null;
    // Patch showItemDisplay to store item name
    if (typeof window.showItemDisplay === 'function') {
        const origShowItemDisplay = window.showItemDisplay;
        window.showItemDisplay = function (item) {
            window.lastScannedItemName = item.name;
            origShowItemDisplay(item);
        };
    }
});
