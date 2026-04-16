// ==========================
// Au chargement de la page
// ==========================
document.addEventListener("DOMContentLoaded", function () {
    fetchTransactions();
});

// ==========================
// Récupérer et afficher les transactions (étudiants)
// ==========================
async function fetchTransactions() {
    try {
        const res = await fetch("api/ListEtudiant.aspx");
        if (!res.ok) throw new Error("Erreur HTTP : " + res.status);

        const transactions = await res.json();

        // Sélecteur tbody de la table (table id="SaisieForm")
        const tbody = document.querySelector("#SaisieForm tbody");
        if (!tbody) throw new Error("Table body introuvable");

        tbody.innerHTML = "";

        transactions.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.Matricule || ""}</td>
                <td>${u.Nom || ""}</td>
                <td>${u.Prenom || ""}</td>
                <td>${u.Sexe || ""}</td>
                <td>${u.Classe || ""}</td>
                <td>${u.Contact || ""}</td>
                <td>${u.Adresse || ""}</td>
                <td class="text-center align-middle">
                    <a class="btn btn-warning btn-sm me-1" href="#" onclick="if(typeof modifierContact==='function'){modifierContact('${u.IDELEVES}');} return false;">
                        <i class="fas fa-pencil-alt"></i>
                    </a>
                    <a class="btn btn-danger btn-sm btn-supprimer" href="#" data-id="${u.IDELEVES}">
                        <i class="fas fa-trash"></i>
                    </a>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Délégué d'événement pour les boutons supprimer (meilleur que d'attacher plusieurs écouteurs)
        // Permet de gérer les suppressions même si les lignes sont rechargées dynamiquement
        document.querySelector("#SaisieForm tbody").addEventListener("click", function(e) {
            if (e.target.closest('.btn-supprimer')) {
                e.preventDefault();
                const btn = e.target.closest('.btn-supprimer');
                const id = btn.getAttribute("data-id");
                if (id && typeof supprimerContact === 'function') {
                    supprimerContact(id);
                } else {
                    console.error("ID manquant pour la suppression !");
                }
            }
        });

        // Initialisation ou réinitialisation de DataTable
        if ($.fn.DataTable.isDataTable("#SaisieForm")) {
            $("#SaisieForm").DataTable().destroy();
        }

        const table = $("#SaisieForm").DataTable({
            dom: `
                <'d-flex justify-content-between align-items-center mb-2'
                    <'table-title'>
                >
             rt
             <"bottom d-flex justify-content-between align-items-center"l i p>
             <"clear">`,
            language: {
                zeroRecords: "Aucun enregistrement trouvé",
                search: " ",
                searchPlaceholder: "Tapez pour rechercher...",
                lengthMenu: "Afficher _MENU_ lignes",
                info: "Affichage de _START_ à _END_ sur _TOTAL_ contacts",
                infoEmpty: "Affichage de 0 à 0 sur 0 enregistrements",
                infoFiltered: "(filtrés depuis _MAX_ contacts)"
            },
            columnDefs: [
                { width: "10%", targets: [0, 3, 4, 5, 6] },
                { width: "20%", className: "text-left", targets: [1] },
                { width: "10%", className: "text-left", targets: [2] },
                { width: "10%", className: "text-center", targets: [7] },
                { orderable: false, targets: 7 }, // désactive tri sur colonne boutons
            ],
            autoWidth: false,
            responsive: true,
            ordering: false,
        });

        // Filtrage par défaut si défini
        if (typeof defaultLotId !== "undefined" && defaultLotId) {
            table.column(0).search('^' + defaultLotId + '$', true, false).draw();
        }

        // Filtrage par input dans l'entête sauf dernière colonne (boutons)
        $('#SaisieForm thead tr:eq(1) th').each(function (i) {
            if (i === 7) return; // dernière colonne = boutons, ignorer

            $('input', this).on('keyup change clear', function () {
                if (table.column(i).search() !== this.value) {
                    table
                        .column(i)
                        .search(this.value)
                        .draw();
                }
            });
        });

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Erreur",
            text: err.message
        });
    }
}

// ==========================
// Fonction globale pour recharger la liste
// ==========================
window.reloadTransactions = function () {
    fetchTransactions();
};
