// ==========================
// Activer/Désactiver les champs et boutons
// ==========================
function setFormEnabled(active) {
    $("#btnAjouter").prop("disabled", active);
    $("#btnValider, #btnAnnuler").prop("disabled", !active);
    $("#matiere").prop("readonly", !active);
}

// ==========================
// Initialisation
// ==========================
$(document).ready(function () {

    setFormEnabled(false);

    // Charger la liste des matieres au démarrage
    loadMatiere(); // 🔹 nom exact

    // ==========================
    // Bouton AJOUTER
    // ==========================
    $("#btnAjouter").on("click", function (e) {
        e.preventDefault();
        $("#Form1")[0].reset();
        setFormEnabled(true);
        $("#matiere").focus();
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

        const champMatiere = $("#matiere");

        // Vérifier que le champ existe
        if (champMatiere.length === 0) {
            Swal.fire("Erreur", "Champ matiere introuvable", "error");
            return;
        }

        const valeur = champMatiere.val();

        // Vérifier que la valeur est valide
        if (!valeur || valeur.trim() === "") {
            Swal.fire("Attention", "Veuillez saisir une matiere", "warning");
            champMatiere.focus();
            return;
        }

        const body = { LABEL: valeur.trim() };

        try {
            const res = await fetch("api/Matiere.aspx", {
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
                    title: data.message || "Matière ajoutée !",
                    timer: 1500,
                    showConfirmButton: false
                });

                // 🔄 Recharger la table après succès
                setTimeout(() => {
                    setFormEnabled(false);
                    loadMatiere(); // 🔹 charger à nouveau la table
                    $("#Form1")[0].reset();
                }, 1500);

            } else {
                Swal.fire(
                    "Erreur",
                    data.message || "Erreur lors de l'ajout",
                    "error"
                );
            }

        } 
        
        catch (err) {
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
window.fetchMatiere = loadMatiere;
