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

async function extractDataFromContent() {
    let questionCards = document.querySelectorAll("div.card.my-5[data-question]");
    let extractedData = {};

    questionCards.forEach(card => {
        let questionId = card.getAttribute("data-question");
        let cardBodies = card.querySelectorAll(".card-body");
        let cardBody = cardBodies[cardBodies.length - 1];

        if (cardBody) {
            extractedData[questionId] = {
                "question": extractTextRecursively(cardBody),
                "answer": ""
            };
        }
    });

    try {
        let answers = await getAnswers();
        let qa = answers["data"][0]["result"]["answers"];
        console.log("Received Answers:", qa);

        Object.keys(qa).forEach(key => {
            if (extractedData[key]) {
                extractedData[key]["answer"] = qa[key];
            }
        });

    } catch (error) {
        console.error("Error fetching answers:", error);
    }

    return extractedData;
}
