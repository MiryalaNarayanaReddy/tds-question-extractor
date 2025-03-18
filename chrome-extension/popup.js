document.getElementById("extractBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractDataFromContent
        }, (results) => {
            if (results && results[0] && results[0].result) {
                let extractedText = JSON.stringify(results[0].result, null, 2);
                document.getElementById("output").value = extractedText;
            }
        });
    });
});

document.getElementById("copyBtn").addEventListener("click", () => {
    let output = document.getElementById("output");
    output.select();
    document.execCommand("copy");
    alert("✅ Copied to clipboard!");
});

document.getElementById("downloadBtn").addEventListener("click", () => {
    let dataStr = document.getElementById("output").value;
    let blob = new Blob([dataStr], { type: "application/json" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "extracted_questions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Function to extract text content recursively (No HTML tags)
function getTextRecursively(element) {
    let text = "";
    element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent.trim() + " "; // Extract text
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            text += getTextRecursively(node) + " "; // Recursive extraction
        }
    });
    return text.replace(/\s+/g, " ").trim(); // Clean extra spaces
}

// Extract questions from the webpage
function extractDataFromContent() {
    let questionCards = document.querySelectorAll("div.card.my-5[data-question]");
    let extractedData = {};

    questionCards.forEach(card => {
        let questionId = card.getAttribute("data-question");
        let cardBodies = card.querySelectorAll(".card-body");

        let fullText = [];
        for (let body of cardBodies) {
            let textContent = extractTextRecursively(body); // Extract clean text
            fullText.push(textContent);
        }
        extractedData[questionId] = fullText.join("\n\n");
    });

    return extractedData;
}
