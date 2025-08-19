/**
 * Shop-It Barcode Scanner Module
 * Handles camera initialization, scanning, and barcode processing
 */

let html5QrCode;

/**
 * Initializes and starts the barcode scanner
 */
function startScanner() {
    document.getElementById("scanner-container").style.display = "block";
    document.getElementById("scan-result").classList.add("d-none");
    document.getElementById("item-display").style.display = "none";
    document.getElementById("item-error").classList.add("d-none");
    document.getElementById("manual-entry-container").style.display = "none";

    // Get the screen width to determine optimal settings
    const isSmallScreen = window.innerWidth < 768;
    const qrboxSize = isSmallScreen ? Math.min(window.innerWidth - 60, 250) : 250;

    // Configure scanner with responsive settings
    const config = {
        fps: 10,
        qrbox: {
            width: qrboxSize,
            height: qrboxSize
        },
        aspectRatio: 1.0,
        formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E
        ]
    };

    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            showScanResult(decodedText);
            showItemLoading();
            fetchItemDetails(decodedText);
            stopScanner();
        },
        (errorMessage) => {
            console.warn("QR Code scan error: ", errorMessage);
        }
    ).catch(err => {
        console.error("Scan failed", err);
        showItemError("Failed to start camera. Please check your camera permissions.");
    });
}

// Show loading spinner
window.showItemLoading = function () {
    const loadingDiv = document.getElementById("item-loading");
    if (loadingDiv) loadingDiv.classList.remove("d-none");
}
// Hide loading spinner
window.hideItemLoading = function () {
    const loadingDiv = document.getElementById("item-loading");
    if (loadingDiv) loadingDiv.classList.add("d-none");
}

/**
 * Stops the barcode scanner
 */
function stopScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            document.getElementById("scanner-container").style.display = "none";
        }).catch(error => {
            console.error("Error stopping scanner:", error);
            // Force hide even if there's an error
            document.getElementById("scanner-container").style.display = "none";
        });
    } else {
        document.getElementById("scanner-container").style.display = "none";
    }
}

/**
 * Displays the manual entry form
 */
function showManualEntry() {
    // Hide scanner if visible
    document.getElementById("scanner-container").style.display = "none";
    if (html5QrCode) {
        html5QrCode.stop().then(() => html5QrCode.clear());
    }

    // Show manual entry form
    document.getElementById("manual-entry-container").style.display = "block";
    document.getElementById("manual-barcode").focus();

    // Hide any previous error messages
    document.getElementById("item-error").classList.add("d-none");
}

/**
 * Hides the manual entry form
 */
function hideManualEntry() {
    document.getElementById("manual-entry-container").style.display = "none";
    document.getElementById("manual-barcode").value = "";
}

/**
 * Displays the scan result
 * @param {string} text - The scanned barcode text
 */
function showScanResult(text) {
    const resultDiv = document.getElementById("scan-result");
    resultDiv.textContent = "Scan result: " + text;
    resultDiv.classList.remove("d-none");
}

/**
 * Displays the scan result
 */
function showScanResult(text) {
    const resultDiv = document.getElementById("scan-result");
    resultDiv.textContent = "Scan result: " + text;
    resultDiv.classList.remove("d-none");
}
