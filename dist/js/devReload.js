// ==========================
// 🔥 DEV RELOAD + TOGGLE
// ==========================
(function () {

    const isLocal =
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";

    if (!isLocal) return;

    const KEY = "devReloadEnabled";
    const INTERVAL = 3000;

    // Initialisation état
    if (localStorage.getItem(KEY) === null) {
        localStorage.setItem(KEY, "false");
    }

    let intervalId = null;

    function startReload() {
        if (intervalId) return;

        intervalId = setInterval(() => {
            if (localStorage.getItem(KEY) === "true") {
                location.reload();
            }
        }, INTERVAL);

        console.log("[DEV] Reload actif");
    }

    function stopReload() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        console.log("[DEV] Reload stoppé");
    }

    function updateButton() {
        const btn = document.getElementById("btnDevReload");
        if (!btn) return;

        const enabled = localStorage.getItem(KEY) === "true";

        btn.textContent = enabled
            ? "⏸ Stop Live Reload"
            : "▶ Start Live Reload";

        btn.className = enabled
            ? "btn btn-warning btn-sm"
            : "btn btn-success btn-sm";
    }

    function initButton() {
        const btn = document.getElementById("btnDevReload");
        if (!btn) return;

        btn.addEventListener("click", function () {
            const enabled = localStorage.getItem(KEY) === "true";
            localStorage.setItem(KEY, enabled ? "false" : "true");

            if (enabled) {
                stopReload();
            } else {
                startReload();
            }

            updateButton();
        });

        updateButton();
    }

    // Lancement initial
    if (localStorage.getItem(KEY) === "true") {
        startReload();
    }

    initButton();

})();
