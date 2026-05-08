document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("toggleDarkMode");

    // Charger le thème sauvegardé
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        if (toggle) toggle.checked = true;
    }

    // Mode sombre ON/OFF
    if (toggle) {
        toggle.addEventListener("change", function () {
            if (this.checked) {
                document.body.classList.add("dark-mode");
                localStorage.setItem("theme", "dark");
            } else {
                document.body.classList.remove("dark-mode");
                localStorage.setItem("theme", "light");
            }
        });
    }

    // Afficher la date d'expiration de la licence dans la sidebar
    var controlSidebar = document.querySelector('.control-sidebar');
    var licenceDiv = document.getElementById('licenceExpirationInfo');

    if (controlSidebar && licenceDiv) {
        var expiration = controlSidebar.getAttribute('data-expiration');
        if (expiration) {
            licenceDiv.textContent = "Licence valide jusqu'au " + expiration;
        }
    }
});
