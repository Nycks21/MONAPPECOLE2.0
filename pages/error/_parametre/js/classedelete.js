// ==========================
// Fonction Supprimer Classe avec SweetAlert2
// ==========================
async function supprimerContact(id) {
    if (!id) return;

    const result = await Swal.fire({
        title: 'Confirmer la suppression',
        text: "Voulez-vous vraiment supprimer cette classe ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch("api/ClasseDelete.aspx", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${encodeURIComponent(id)}`
            });
            const data = await res.json();

            if (data.status === "success") {
                Swal.fire({
                    icon: 'success',
                    title: data.message,
                    showConfirmButton: false,
                    timer: 3000
                });

                // 🔄 Recharger le tableau après suppression
                setTimeout(() => {
                    // Si DataTable existe, la vider et la détruire
                    if ($.fn.DataTable.isDataTable("#ListTable")) {
                        $("#ListTable").DataTable().clear().destroy();
                    }

                    // Recharger les classes
                    loadClasse(); // 🔹 nom exact de la fonction

                    console.log("Tableau rechargé après suppression");
                }, 500); // délai court pour laisser le message SweetAlert s'afficher



            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: data.message || "Réponse inattendue"
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: "Erreur de communication",
                text: err.message
            });
            console.error(err);
        }
    }
}

// 🔹 Assurer que la fonction est globale
window.supprimerContact = supprimerContact;