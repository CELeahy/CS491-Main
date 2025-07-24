// ====== TokenState Library (Client-side) ======
const TokenState = (function () {
    function getBrowserName() {
        const a = navigator.userAgent;
        let agent = "Firefox"; // default
        if (a.indexOf("Safari") > 0) agent = "Safari";
        if (a.indexOf("Chrome") > 0) agent = "Chrome";
        if (a.indexOf("OPR") > 0) agent = "Opera";
        return agent;
    }

    function setToken(name) {
        return {
            user: name,
            browser: getBrowserName(),
            timestamp: Date.now()
        };
    }

    async function putToken(token) {
        const res = await fetch('/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(token)
        });
        return res.ok;
    }

    async function getToken() {
        const res = await fetch('/token');
        return await res.json();
    }

    return {
        setToken,
        putToken,
        getToken
    };
})();

// ====== Ping Logic ======
const pingBtn = document.getElementById('pingBtn');
let myToken = null;

async function init() {
    const username = prompt("Enter your name:");
    myToken = TokenState.setToken(username);
    await TokenState.putToken(myToken);
    startPolling();
}

pingBtn.addEventListener('click', async () => {
    pingBtn.disabled = true;
    await TokenState.putToken(myToken);
});

function isDifferentToken(t1, t2) {
    return !t2 || t1.user !== t2.user || t1.browser !== t2.browser;
}

function startPolling() {
    setInterval(async () => {
        const serverToken = await TokenState.getToken();
        if (isDifferentToken(myToken, serverToken)) {
            pingBtn.disabled = false;
        }
    }, 1000);
}

init();
