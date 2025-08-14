/**
 * Shop-It Payment Module
 * Handles Mpesa payment processing and status monitoring
 */

console.log("Payment module loaded successfully");

// Export lastCheckoutId as a global variable so it can be accessed from main.js
window.lastCheckoutId = null;

/**
 * Polls the server for payment status updates
 * @param {string} checkoutId - The checkout ID to monitor
 * @param {number} maxAttempts - Maximum number of polling attempts
 * @param {number} interval - Polling interval in milliseconds
 */
window.pollPaymentStatus = function (checkoutId, maxAttempts = 30, interval = 2000) {
    let attempts = 0;
    function poll() {
        fetch("/mpesa/last-status?checkout_id=" + checkoutId)
            .then(res => res.json())
            .then(status => {
                if (status.status === "success") {
                    showConfirmationCard(status.confirmation.payment);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, interval);
                } else {
                    showFailedCard();
                }
            })
            .catch(() => {
                if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, interval);
                } else {
                    showFailedCard();
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
    document.getElementById("confirmation-card").style.display = "block";
    document.getElementById("failed-card").style.display = "none";
    document.getElementById("conf-tcode").textContent = payment.mpesa_code;
    document.getElementById("conf-amount").textContent = "Ksh " + payment.amount_paid;
    document.getElementById("conf-phone").textContent = payment.phone_number;
}

/**
 * Displays the payment failure card
 */
window.showFailedCard = function () {
    document.getElementById("phone-entry-card").style.display = "none";
    document.getElementById("confirmation-card").style.display = "none";
    document.getElementById("failed-card").style.display = "block";
}
