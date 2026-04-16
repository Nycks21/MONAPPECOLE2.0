let table;

// ============================
// Activer/Désactiver champs et boutons
// ============================
function setFormEnabled(disabled) {
    $("#btnAjouter").prop("disabled", active);
    $("#btnValider, #btnAnnuler").prop("disabled", !active);
    $("#classe").prop("readonly", !active);
}

// ============================
// JSON sécurisé
// ============================
async function safeJson(res) {
    try {
        return await res.json();
    } catch (e) {
        console.error("Erreur parsing JSON", e);
        return [];
    }
}

// ============================
// Charger la liste des classes
// ============================
function loadClasse() {
    fetch("api/ClasseList.aspx")
        .then(safeJson)
        .then(data => {
            if (!Array.isArray(data)) {
                // console.error("Réponse invalide :", data);
                return;
            }

            const filteredData = data; // Tu peux filtrer ici si besoin

            if (!table) {
                table = $('#ListTable').DataTable({
                    data: filteredData,
                    responsive: true,
                    lengthChange: true,
                    autoWidth: false,
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    pageLength: 10,
                    order: [[0, 'asc']],
                    columns: [
                        { data: 'LABEL', title: 'Classe', className: 'text-left' },
                        {
                            data: null,
                            title: 'Actions',
                            className: 'text-center',
                            orderable: false,
                            render: function (data, type, row) {
                                const id = row.IDCLASSE || "";
                                return `
                                    <a class="btn btn-danger btn-sm" href="#" onclick="if(typeof supprimerContact === 'function'){ supprimerContact('${id}'); } return false;">
                                        <i class="fas fa-trash"></i> Supprimer
                                    </a>
                                `;
                            }
                        }
                    ],
                    columnDefs: [
                        { width: '20%', targets: [1] }
                    ],
                    dom: `
                        <'d-flex justify-content-between align-items-center mb-2'
                            <'table-title'><'table-search'f>>
                        rt
                        <'bottom d-flex justify-content-between align-items-center'l i p>
                        <'clear'>
                    `,
                    language: {
                        zeroRecords: "Aucune classe trouvée",
                        search: " ",
                        searchPlaceholder: "Taper pour rechercher...",
                        lengthMenu: "Afficher _MENU_ classes",
                        info: "Affichage de _START_ à _END_ sur _TOTAL_ classes",
                        infoEmpty: "Aucune classe à afficher",
                        infoFiltered: "(filtrées depuis _MAX_ au total)"
                    }
                });
            } else {
                table.clear().rows.add(filteredData).draw();
            }
        })
        .catch(err => {
            console.error(err);
            alert("Erreur chargement des classes : " + err.message);
        });
}

// ============================
// Rendre les fonctions globales
// ============================
window.loadClasse = loadClasse;
window.supprimerContact = window.supprimerContact || function(id) {
    console.warn("Fonction supprimerContact non définie pour ID:", id);
};
