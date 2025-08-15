/**
 * Shop-It Payment Module
 * Handles Mpesa payment processing and status monitoring
 */

console.log("Payment module loaded successfully");

// Export lastCheckoutId as a global variable so it can be accessed from main.js
window.lastCheckoutId = null;

/**
 * Shows the waiting for payment card with payment details
 * @param {string} phoneNumber - The phone number used for payment
 * @param {number} amount - The payment amount
 */
window.showWaitingPaymentCard = function (phoneNumber, amount) {
    // Hide other cards
    document.getElementById("phone-entry-card").style.display = "none";
    document.getElementById("confirmation-card").style.display = "none";
    document.getElementById("failed-card").style.display = "none";

    // Set waiting card details
    document.getElementById("wait-phone").textContent = phoneNumber;
    document.getElementById("wait-amount").textContent = "Ksh " + amount;

    // Show waiting card
    document.getElementById("waiting-payment-card").style.display = "block";

    // Start the elapsed time counter
    window.elapsedTimeInterval = setInterval(function () {
        const secondsElement = document.getElementById("wait-seconds");
        const currentSeconds = parseInt(secondsElement.textContent);
        secondsElement.textContent = currentSeconds + 1;
    }, 1000);
}

/**
 * Polls the server for payment status updates
 * @param {string} checkoutId - The checkout ID to monitor
 * @param {number} maxAttempts - Maximum number of polling attempts
 * @param {number} interval - Polling interval in milliseconds
 */
window.pollPaymentStatus = function (checkoutId, maxAttempts = 15, interval = 2000) {
    let attempts = 0;
    let statusMessageInterval;

    // Start updating status messages to improve user experience
    statusMessageInterval = setInterval(function () {
        const secondsElement = document.getElementById("wait-seconds");
        const currentSeconds = parseInt(secondsElement.textContent);

        // After 10 seconds, update message to be more informative
        if (currentSeconds > 10) {
            document.getElementById("waiting-status-message").innerHTML =
                "If you already completed or canceled the payment on your phone, " +
                "click the button below to go back to scanning.";
            document.getElementById("cancel-waiting-btn").style.display = "block";
        }
    }, 2000);

    function poll() {
        fetch("/mpesa/last-status?checkout_id=" + checkoutId)
            .then(res => res.json())
            .then(status => {
                if (status.status === "success") {
                    // Payment successful
                    clearInterval(window.elapsedTimeInterval);
                    clearInterval(statusMessageInterval);
                    showConfirmationCard(status.confirmation.payment);
                } else if (attempts < maxAttempts) {
                    // Still waiting, continue polling
                    attempts++;
                    setTimeout(poll, interval);
                } else {
                    // Timed out after maximum attempts
                    clearInterval(window.elapsedTimeInterval);
                    clearInterval(statusMessageInterval);
                    showFailedCard("Payment timed out. You may have canceled or have insufficient balance.");
                }
            })
            .catch((error) => {
                console.error("Polling error:", error);
                if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, interval);
                } else {
                    clearInterval(window.elapsedTimeInterval);
                    clearInterval(statusMessageInterval);
                    showFailedCard("Connection error. Please try again.");
                }
            });
    }

    poll();
}

/**
 * Displays the payment confirmation card
 * @param {Object} payment - Payment details to display
 */
window.showConfirmationCard = function (payment) {
    document.getElementById("phone-entry-card").style.display = "none";
    document.getElementById("waiting-payment-card").style.display = "none";
    document.getElementById("confirmation-card").style.display = "block";
    document.getElementById("failed-card").style.display = "none";
    document.getElementById("conf-tcode").textContent = payment.mpesa_code;
    document.getElementById("conf-amount").textContent = "Ksh " + payment.amount_paid;
    document.getElementById("conf-phone").textContent = payment.phone_number;
}

/**
 * Displays the payment failure card
 * @param {string} errorMessage - Optional error message to display
 */
window.showFailedCard = function (errorMessage) {
    document.getElementById("phone-entry-card").style.display = "none";
    document.getElementById("waiting-payment-card").style.display = "none";
    document.getElementById("confirmation-card").style.display = "none";
    document.getElementById("failed-card").style.display = "block";

    // Set error message if provided
    if (errorMessage) {
        document.getElementById("failed-message").textContent = errorMessage;
    }
}
