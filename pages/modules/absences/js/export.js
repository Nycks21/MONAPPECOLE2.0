'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — Module Absences & Retards
// ─────────────────────────────────────────────────────────────────────────────

function exportAbsences() {
    if (!filteredAbsences.length) {
        Swal.fire('Info', 'Aucune donnée à exporter.', 'info');
        return;
    }

    var rows = [['NOM', 'CLASSE', 'DATE_DEBUT', 'DATE_FIN', 'DUREE', 'JUSTIFIE', 'MOTIF']];
    filteredAbsences.forEach(function (item) {
        rows.push([
            item.NOM || '',
            item.CLASSE_NOM || '',
            formatDate(item.DATE_DEBUT),
            formatDate(item.DATE_FIN),
            item.DUREE || '1',
            item.JUSTIFIE ? 'Oui' : 'Non',
            item.MOTIF || ''
        ]);
    });

    var csv = rows.map(function (row) {
        return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');

    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Absences_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

function exportRetards() {
    if (!filteredRetards.length) {
        Swal.fire('Info', 'Aucune donnée à exporter.', 'info');
        return;
    }

    var rows = [['NOM', 'CLASSE', 'DATE', 'HEURE_ARRIVEE', 'HEURE_PREVUE', 'DUREE', 'JUSTIFIE', 'MOTIF']];
    filteredRetards.forEach(function (item) {
        rows.push([
            item.NOM || '',
            item.CLASSE_NOM || '',
            formatDate(item.DATE_RETARD),
            formatHeure(item.HEURE_ARRIVEE),
            formatHeure(item.HEURE_PREVUE),
            item.DUREE || '0',
            item.JUSTIFIE ? 'Oui' : 'Non',
            item.MOTIF || ''
        ]);
    });

    var csv = rows.map(function (row) {
        return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');

    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Retards_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

window.exportAbsences = exportAbsences;
window.exportRetards = exportRetards;