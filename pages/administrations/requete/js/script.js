/**
 * script.js — Console SQL interactive
 * Gère l'envoi et l'affichage des requêtes vers ExecuteSQL.ashx
 */

function executeCustomSQL() {
    const queryArea = document.getElementById('sqlConsole');
    const resultDiv = document.getElementById('sqlExecutionResult');
    
    if (!queryArea || !queryArea.value.trim()) {
        Swal.fire({
            icon: 'error',
            title: 'Champ vide',
            text: 'Veuillez saisir une requête SQL avant de valider.'
        });
        return;
    }

    const queryText = queryArea.value.trim();

    // 1. Demande de confirmation de sécurité
    Swal.fire({
        title: 'Confirmer l\'exécution ?',
        text: "Cette commande va interagir directement avec la base de données scolaire.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, exécuter',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            
            // Affichage du chargement
            Swal.fire({
                title: 'Exécution en cours...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            // Préparation des données pour le handler
            const formData = new URLSearchParams();
            formData.append('query', queryText);

            // 2. Appel au Handler
            fetch('handlers/ExecuteSQL.ashx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            })
            .then(response => {
                if (!response.ok) throw new Error('Erreur réseau ou fichier introuvable (404)');
                return response.json();
            })
            .then(res => {
                Swal.close(); // Ferme le loader

                if (res.success) {
                    if (res.type === "SELECT") {
                        // AFFICHAGE DANS L'INTERFACE (TABLEAU)
                        renderSqlTable(res.data, resultDiv);
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Lecture réussie',
                            text: res.data.length + ' ligne(s) récupérée(s).',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else {
                        // MESSAGE DE SUCCÈS POUR UPDATE/DELETE/INSERT
                        resultDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${res.message}</div>`;
                        Swal.fire('Réussi !', res.message, 'success');
                    }
                } else {
                    // Erreur SQL renvoyée par le C#
                    Swal.fire('Erreur SQL', res.message, 'error');
                    resultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> ${res.message}</div>`;
                }
            })
            .catch(err => {
                console.error(err);
                Swal.fire('Erreur fatale', "Impossible de joindre le serveur : " + err.message, 'error');
            });
        }
    });
}

/**
 * Construit un tableau HTML dynamique à partir des données JSON
 */
function renderSqlTable(data, container) {
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Requête réussie, mais aucun résultat trouvé.</div>';
        return;
    }

    // Récupérer les noms des colonnes à partir du premier objet
    const columns = Object.keys(data[0]);

    let html = `
        <div class="table-responsive mt-3" style="max-height: 450px; overflow-y: auto; border: 1px solid #dee2e6;">
            <table class="table table-bordered table-striped table-hover bg-white mb-0">
                <thead class="thead-dark" style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        ${columns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${columns.map(col => {
                                const val = row[col];
                                return `<td>${val === null ? '<i class="text-muted">null</i>' : val}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="mt-2 text-muted small text-right">
            <i class="fas fa-list"></i> Total : ${data.length} ligne(s)
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Initialisation des événements
 */
document.addEventListener('DOMContentLoaded', function() {
    const consoleElem = document.getElementById('sqlConsole');
    if (consoleElem) {
        consoleElem.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                executeCustomSQL();
            }
        });
    }
});