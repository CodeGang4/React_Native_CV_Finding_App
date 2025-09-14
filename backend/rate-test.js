// rate-test.js
// Usage: node rate-test.js <url> <totalRequests> <concurrency>
// Example: node rate-test.js http://localhost:3000/login 50 5

const axios = require("axios");

if (process.argv.length < 5) {
    console.error("Usage: node rate-test.js <url> <totalRequests> <concurrency>");
    process.exit(1);
}

const url = process.argv[2];
const totalRequests = Number(process.argv[3]);
const concurrency = Number(process.argv[4]);
const VERBOSE = process.env.VERBOSE === "1"; // set VERVOSE=1 for per-request logs

let counter = 0;
const stats = {
    total: totalRequests,
    completed: 0,
    statusCounts: {},
    errors: 0,
    latencies: [],
    rateLimitHeaders: {}, // store sample headers
    first429At: null,
};

function recordRateLimitHeaders(headers) {
    // copy X-RateLimit-* if present (only keep first seen)
    ["x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset"].forEach(
        (h) => {
            if (!stats.rateLimitHeaders[h] && headers[h]) {
                stats.rateLimitHeaders[h] = headers[h];
            }
        }
    );
}

async function doRequest(id) {
    const start = Date.now();
    try {
        const res = await axios({
            method: "GET", // change to POST + body if needed
            url,
            validateStatus: () => true, // we handle statuses ourselves
            timeout: 15000,
        });
        const latency = Date.now() - start;
        stats.latencies.push(latency);

        const status = res.status;
        stats.statusCounts[status] = (stats.statusCounts[status] || 0) + 1;

        // record headers sample
        recordRateLimitHeaders(
            Object.fromEntries(
                Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), v])
            )
        );

        if (status === 429 && stats.first429At === null) {
            stats.first429At = { time: new Date().toISOString(), id, latency };
        }

        if (VERBOSE) {
            console.log(
                `#${id} -> ${status} ${latency}ms` +
                (res.headers["x-ratelimit-remaining"]
                    ? ` | X-RateLimit-Remaining: ${res.headers["x-ratelimit-remaining"]}`
                    : "")
            );
        }
    } catch (err) {
        stats.errors++;
        if (VERBOSE) console.log(`#${id} -> ERR ${err.message}`);
    } finally {
        stats.completed++;
    }
}

async function worker(workerId) {
    while (true) {
        const id = ++counter;
        if (id > totalRequests) break;
        await doRequest(id);
    }
}

(async () => {
    console.log(`Testing ${totalRequests} requests -> ${url} with concurrency ${concurrency}`);
    const workers = [];
    const startAll = Date.now();
    for (let i = 0; i < concurrency; i++) workers.push(worker(i + 1));
    await Promise.all(workers);
    const totalTime = Date.now() - startAll;

    // compute latency stats
    const lat = stats.latencies.slice().sort((a, b) => a - b);
    const sum = lat.reduce((s, v) => s + v, 0);
    const avg = lat.length ? sum / lat.length : 0;
    const p50 = lat.length ? lat[Math.floor(lat.length * 0.5)] : 0;
    const p95 = lat.length ? lat[Math.floor(lat.length * 0.95)] : 0;
    const p99 = lat.length ? lat[Math.floor(lat.length * 0.99)] : 0;

    console.log("\n===== RESULT =====");
    console.log(`Total requests sent: ${totalRequests}`);
    console.log(`Completed: ${stats.completed}`);
    console.log(`Errors: ${stats.errors}`);
    console.log("Status counts:", stats.statusCounts);
    if (stats.first429At) {
        console.log("First 429 seen at:", stats.first429At);
    } else {
        console.log("No 429 observed.");
    }
    console.log("\nLatency (ms):");
    console.log(`  Avg: ${avg.toFixed(2)}`);
    console.log(`  p50: ${p50}`);
    console.log(`  p95: ${p95}`);
    console.log(`  p99: ${p99}`);
    console.log(`Total test time: ${totalTime} ms`);
    console.log("\nSample rate-limit headers (first seen):", stats.rateLimitHeaders);
    console.log("==================\n");
})();
