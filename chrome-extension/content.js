console.log("⏳ Extracting questions...");

function extractTextRecursively(element) {
    let text = "";
    let skipNextInputs = false; // Flag to ignore inputs/textareas after a label

    function processNode(node) {
        if (!node) return;

        // Ignore feedback messages
        if (node.classList?.contains("valid-feedback") || node.classList?.contains("invalid-feedback")) {
            return;
        }

        // Ignore muted text
        if (node.classList?.contains("text-muted")) {
            return;
        }

        // Detect label to start ignoring inputs
        if (node.tagName === "LABEL") {
            skipNextInputs = true;
        }

        // Ignore inputs & textareas after a label
        if (skipNextInputs && (node.tagName === "INPUT" || node.tagName === "TEXTAREA")) {
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent.trim() + " ";
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            node.childNodes.forEach(processNode);
        }
    }

    processNode(element);
    return text.replace(/\s+/g, " ").trim(); // Remove extra spaces
}

function extractQuestions() {
    let questionCards = document.querySelectorAll("div.card.my-5[data-question]");
    let extractedData = {};

    questionCards.forEach(card => {
        let questionId = card.getAttribute("data-question");
        let cardBody = card.querySelector(".card-body");

        if (cardBody) {
            extractedData[questionId] = extractTextRecursively(cardBody);
        }
    });

    return extractedData;
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract_questions") {
        let data = extractQuestions();
        sendResponse({ success: true, data: data });
    }
});
