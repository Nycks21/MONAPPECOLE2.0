// ===============================
// Charger les types d'opération
// ===============================
function chargerTypesOperation() {
    fetch("/pages/application/api/ClasseListGet.aspx")
        .then(res => {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(data => {
            const ddl = document.getElementById("ddlTypeOperation");
            if (!ddl) return;

            ddl.innerHTML = '<option value=""></option>';

            data.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item.IDCLASSE;
                opt.textContent = item.LABEL;
                ddl.appendChild(opt);
            });
        })
        .catch(err => {
            console.error("Erreur lors du chargement des types d'opération", err);
        });
}

// ===============================
// Charger les types de classe (ou status?)
// ===============================
function chargerTypeClasse() {
    fetch("/pages/application/api/ClasseListGet.aspx") // Même url, même source, ça ne semble pas logique
        .then(res => {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(data => {
            const ddl = document.getElementById("ddlTypeClasse");
            if (!ddl) return;

            ddl.innerHTML = '<option value=""></option>';

            // Vérifie bien les propriétés reçues, exemple :
            data.forEach(item => {
                // Si ton objet ne contient pas StatusId ou StatusLabel, adapte ici !
                const opt = document.createElement("option");
                opt.value = item.StatusId || item.IDCLASSE || "";  // Ajuste selon données
                opt.textContent = item.StatusLabel || item.LABEL || "";
                ddl.appendChild(opt);
            });
        })
        .catch(err => {
            console.error("Erreur lors du chargement des types de classe", err);
        });
}

// ===============================
// Démarrage de la page
// ===============================
document.addEventListener("DOMContentLoaded", function () {
    chargerTypesOperation();
    chargerTypeClasse();
});
