let table;

async function safeJson(res) {
    try {
        return await res.json();
    } catch (e) {
        console.error("Erreur lors du parsing JSON :", e);
        return [];
    }
}

function chargerContacts() {
    fetch("api/Contacts.aspx")
        .then(async res => {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return await safeJson(res);
        })
        .then(data => {
            if (!Array.isArray(data)) data = [];
            if (table) {
                table.clear().rows.add(data).draw();
            } else {
                table = $('#contactsTable').DataTable({
                    data: data,
                    responsive: true,
                    lengthChange: true,
                    autoWidth: false,
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    pageLength: 10,
                    lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "Tous"]],
                    columns: [
                        { data: 'IdContacts', className: 'text-left' },
                        { data: 'Civilite', className: 'text-left' },
                        { data: 'Nom', className: 'text-left' },
                        { data: 'Prenom', className: 'text-left' },
                        { data: 'Marie', className: 'text-left' },
                        { data: 'Telephone', className: 'text-left' },
                        { data: 'Facebook', className: 'text-left' },
                        { data: 'Adresse', className: 'text-left' }
                    ],
                    dom: '<"top"fB>rt<"bottom d-flex justify-content-between align-items-center"l i p><"clear">',
                    buttons: ["copy", "csv", "excel", "pdf", "print"],
                    language: {
                        zeroRecords: "Aucun enregistrement trouvé",
                        search: " ",
                        searchPlaceholder: "Tapez pour rechercher...",
                        lengthMenu: "Afficher _MENU_ lignes",
                        info: "Affichage de _START_ à _END_ sur _TOTAL_ contacts",
                        infoEmpty: "Affichage de 0 à 0 sur 0 enregistrements",
                        infoFiltered: "(filtrés depuis un total de _MAX_ contacts)"
                    }
                });
            }
        })
        .catch(err => console.error("Erreur lors du chargement des contacts :", err));
}

document.addEventListener('DOMContentLoaded', chargerContacts);
