// ==========================
// Activer/Désactiver les champs et boutons
// ==========================
function setFormEnabled(active) {
    $("#btnAjouter").prop("disabled", active);
    $("#btnValider, #btnAnnuler").prop("disabled", !active);
    $("#classe").prop("readonly", !active);
}

// ==========================
// Initialisation
// ==========================
$(document).ready(function () {

    setFormEnabled(false);

    // Charger la liste des classes au démarrage
    loadClasse(); // 🔹 nom exact

    // ==========================
    // Bouton AJOUTER
    // ==========================
    $("#btnAjouter").on("click", function (e) {
        e.preventDefault();
        $("#Form1")[0].reset();
        setFormEnabled(true);
        $("#classe").focus();
    });

    // ==========================
    // Bouton ANNULER
    // ==========================
    $("#btnAnnuler").on("click", function () {
        $("#Form1")[0].reset();
        setFormEnabled(false);
    });

    // ==========================
    // Soumission (AJOUT uniquement)
    // ==========================
    $("#Form1").on("submit", async function (e) {
        e.preventDefault();

        const champClasse = $("#classe");

        // Vérifier que le champ existe
        if (champClasse.length === 0) {
            Swal.fire("Erreur", "Champ classe introuvable", "error");
            return;
        }

        const valeur = champClasse.val();

        // Vérifier que la valeur est valide
        if (!valeur || valeur.trim() === "") {
            Swal.fire("Attention", "Veuillez saisir une classe", "warning");
            champClasse.focus();
            return;
        }

        const body = { LABEL: valeur.trim() };

        try {
            const res = await fetch("api/Classe.aspx", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                throw new Error(`Erreur HTTP ${res.status} - ${res.statusText}`);
            }

            const data = await res.json();

            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: data.message || "Classe ajoutée !",
                    timer: 1500,
                    showConfirmButton: false
                });

                // 🔄 Recharger la table après succès
                setTimeout(() => {
                    setFormEnabled(false);
                    loadClasse(); // 🔹 charger à nouveau la table
                    $("#Form1")[0].reset();
                }, 1500);

            } else {
                Swal.fire(
                    "Erreur",
                    data.message || "Erreur lors de l'ajout",
                    "error"
                );
            }

        } catch (err) {
            Swal.fire(
                "Erreur de communication",
                err.message,
                "error"
            );
            console.error(err);
        }
    });
});

// 🔹 Alias pour compatibilité avec l’ancien code
window.fetchClasse = loadClasse;
