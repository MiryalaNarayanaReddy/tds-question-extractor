function getAnswers() {
    return new Promise((resolve, reject) => {
        // Extract email from the page
        let emailElement = document.querySelector("#logged-in-email strong");
        if (!emailElement) {
            reject("Email element not found.");
            return;
        }
        let email = emailElement.textContent.trim();

        // Extract quiz ID from URL
        let pathParts = window.location.pathname.split('/');
        let quiz = pathParts[pathParts.length - 1]; // Get last part of the path

        // Request cookies from the background script
        chrome.runtime.sendMessage({ action: "getCookies" }, (response) => {
            if (chrome.runtime.lastError) {
                reject("Error fetching cookies: " + chrome.runtime.lastError.message);
                return;
            }

            let cookieHeader = response.cookieHeader;
            
            // Fetch answers using cookies
            fetch(`https://exam.sanand.workers.dev/filter?quiz=${quiz}&email=${email}&history=1&limit=1`, {
                method: "GET",
                headers: { "Cookie": cookieHeader }
            })
            .then(response => response.json())
            .then(data => resolve(data))  // Return answers
            .catch(error => reject(error));
        });
    });
}
