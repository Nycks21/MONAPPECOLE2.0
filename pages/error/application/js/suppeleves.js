async function supprimerContact(id) {
    if (!id) return;

    const escapeHtml = text => text
        ? text.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;")
        : '';

    // 1. Récupérer les détails de l'élève avant suppression
    let eleveDetails = { libelle: "N/A", montant: "N/A" };
    try {
        const response = await fetch(`api/GetEleveDetails.aspx?id=${encodeURIComponent(id)}`);
        if (response.ok) eleveDetails = await response.json();
    } catch {
        // On ignore l'erreur, on garde les valeurs par défaut
    }

    // 2. Demander confirmation à l'utilisateur
    const confirmation = await Swal.fire({
        title: 'Confirmer la suppression',
        html: `Voulez-vous vraiment supprimer cet élève ?<br><br>
               <strong>Prénom et Nom :</strong> ${escapeHtml(eleveDetails.libelle)}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });

    if (!confirmation.isConfirmed) return;

    // 3. Effectuer la suppression via POST
    try {
        const deleteResponse = await fetch("api/DeleteEleves.aspx", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${encodeURIComponent(id)}`
        });

        if (!deleteResponse.ok) throw new Error(`Erreur HTTP ${deleteResponse.status}`);

        const data = await deleteResponse.json();

        if (data.status === "success") {
            await Swal.fire({
                icon: 'success',
                title: data.message,
                showConfirmButton: false,
                timer: 1500
            });
            location.reload();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: data.message || "Réponse inattendue du serveur"
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: "Erreur de communication",
            text: error.message
        });
    }
}
