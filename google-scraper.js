const axios = require("axios");
const fs = require("fs");

const SEARCH_QUERY = "lol"; 
const MAX_REQUESTS = 1000; 
const DELAY_BETWEEN_REQUESTS = 2000; 

let stats = {
    totalRequests: 0,
    statusCodes: {},
    logs: [],
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function makeRequest(requestNumber) {
    const url = `https://www.google.com.au/search?q=${encodeURIComponent(SEARCH_QUERY)}`;

    try {
        console.log(`[${requestNumber}] Sending request to Google...`);
        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",            },
        });

        const statusCode = response.status;
        stats.totalRequests++;
        stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
        stats.logs.push({ requestNumber, status: statusCode });

        console.log(`[${requestNumber}] Status: ${statusCode}`);

        return statusCode;
    } catch (error) {
        const statusCode = error.response ? error.response.status : "No Response";
        stats.totalRequests++;
        stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
        stats.logs.push({ requestNumber, status: statusCode, error: error.message });

        console.log(`[${requestNumber}] Error - Status: ${statusCode}`);

        return statusCode;
    }
}

async function runTest() {
    for (let i = 1; i <= MAX_REQUESTS; i++) {
        await makeRequest(i);
        if (i < MAX_REQUESTS) await delay(DELAY_BETWEEN_REQUESTS);
    }

    // Save logs
    fs.writeFileSync("request_logs.json", JSON.stringify(stats, null, 2));
    console.log("Logs saved to request_logs.json");

    console.log("Test Completed!");
}

runTest().then(r => console.log(r)).catch(e => console.error(e));
