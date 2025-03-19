chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCookies") {
        chrome.cookies.getAll({ domain: "exam.sanand.workers.dev" }, (cookies) => {
            let cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
            sendResponse({ cookieHeader });
        });

        return true;  // Required for async response
    }
});