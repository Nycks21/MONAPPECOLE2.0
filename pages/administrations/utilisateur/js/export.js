'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — Module Utilisateurs
// ─────────────────────────────────────────────────────────────────────────────

function exportUsers(event) {
    if (event) event.preventDefault();
    if (!filteredUsers || !filteredUsers.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Aucun utilisateur à exporter' });
        return false;
    }
    var headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    var rows = filteredUsers.map(function(user) {
        return [
            user.USERNAME || '',
            user.NOM || '',
            user.EMAIL || '',
            user.TELEPHONE || '',
            getUserRoleName(user.ROLEID),
            (user.ACTIVE === true || user.ACTIVE === 1) ? 'Actif' : 'Inactif',
            formatDate(user.CREATED_AT)
        ];
    });
    var csvContent = [headers].concat(rows).map(function(row) {
        return row.map(function(cell) {
            if (cell === null || cell === undefined) return '""';
            var cellStr = String(cell);
            if (cellStr.indexOf(',') !== -1 || cellStr.indexOf('"') !== -1 || cellStr.indexOf('\n') !== -1) {
                return '"' + cellStr.replace(/"/g, '""') + '"';
            }
            return cellStr;
        }).join(',');
    }).join('\n');
    downloadFile(csvContent, 'utilisateurs.csv', 'text/csv;charset=utf-8;');
    Swal.fire({ icon: 'success', title: 'Export CSV réussi', text: filteredUsers.length + ' utilisateur(s) exporté(s)', timer: 2000, showConfirmButton: false });
    return false;
}

function exportUsersToExcelOnly(event) {
    if (event) event.preventDefault();
    if (!filteredUsers || !filteredUsers.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Aucun utilisateur à exporter' });
        return false;
    }
    var headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    var rows = filteredUsers.map(function(user) {
        return [
            user.USERNAME || '',
            user.NOM || '',
            user.EMAIL || '',
            user.TELEPHONE || '',
            getUserRoleName(user.ROLEID),
            (user.ACTIVE === true || user.ACTIVE === 1) ? 'Actif' : 'Inactif',
            formatDate(user.CREATED_AT)
        ];
    });
    var exportDate = new Date().toLocaleString('fr-FR');
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export Utilisateurs</title><style>th{background:#4CAF50;color:white;border:1px solid #ddd;padding:8px}td{border:1px solid #ddd;padding:8px}table{border-collapse:collapse;width:100%}</style></head><body><h2>Liste des Utilisateurs</h2><p>Date: ' + escapeHtml(exportDate) + '</p><p>Total: ' + rows.length + '</p><table><thead><tr>' + headers.map(function(h) { return '<th>' + escapeHtml(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function(row) {
        return '<tr>' + row.map(function(cell) { return '<td>' + escapeHtml(String(cell || '-')) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table></body></html>';
    downloadFile(html, 'utilisateurs.xls', 'application/vnd.ms-excel');
    Swal.fire({ icon: 'success', title: 'Export Excel réussi', text: filteredUsers.length + ' utilisateur(s) exporté(s)', timer: 2000, showConfirmButton: false });
    return false;
}

function exportUsersToCsvOnly(event) {
    return exportUsers(event);
}

function downloadFile(content, filename, mimeType) {
    try {
        var blob = new Blob(['\uFEFF' + content], { type: mimeType });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function() { URL.revokeObjectURL(url); }, 100);
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de télécharger ' + filename });
    }
}

// Exposer globalement
window.exportUsers = exportUsers;
window.exportUsersToExcelOnly = exportUsersToExcelOnly;
window.exportUsersToCsvOnly = exportUsersToCsvOnly;
window.downloadFile = downloadFile;