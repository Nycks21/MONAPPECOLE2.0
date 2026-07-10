'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
function exportEleves() {
    exportElevesToExcelOnly();
    exportElevesToCsvOnly();
}

function exportElevesToExcelOnly() {
    if (!filteredEleves.length) {
        Swal.fire('Info', 'Aucune donnée à exporter.', 'info');
        return;
    }

    var rows = [['MATRICULE', 'ANNÉE', 'NOM', 'CLASSE', 'EMAIL', 'TÉLÉPHONE', 'STATUT']];
    filteredEleves.forEach(function (e) {
        rows.push([
            e.MATRICULE || '',
            e.ANNEE_TEXTE || '',
            e.NOM || '',
            e.CLASSE_NOM || '',
            e.EMAIL || '',
            e.TELEPHONE || '',
            e.STATUT || ''
        ]);
    });

    var ws = XLSX.utils.aoa_to_sheet(rows);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Eleves');
    XLSX.writeFile(wb, 'eleves_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}

function exportElevesToCsvOnly() {
    if (!filteredEleves.length) {
        Swal.fire('Info', 'Aucune donnée à exporter.', 'info');
        return;
    }

    var header = 'MATRICULE;ANNEE;NOM;CLASSE;EMAIL;TELEPHONE;STATUT\n';
    var rows = filteredEleves.map(function (e) {
        return [
            e.MATRICULE || '',
            e.ANNEE_TEXTE || '',
            e.NOM || '',
            e.CLASSE_NOM || '',
            e.EMAIL || '',
            e.TELEPHONE || '',
            e.STATUT || ''
        ].join(';');
    }).join('\n');

    var blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'eleves_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPRIMER EN PDF
// ─────────────────────────────────────────────────────────────────────────────
window.exportElevesPDF = function () {
    if (!filteredEleves || filteredEleves.length === 0) {
        Swal.fire('Info', 'Aucune donnée à imprimer.', 'info');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');

        const head = [['MATRICULE', 'ANNÉE', 'NOM COMPLET', 'CLASSE', 'EMAIL', 'STATUT']];
        const body = filteredEleves.map(function (e) {
            return [
                e.MATRICULE || '',
                e.ANNEE_TEXTE || '',
                e.NOM || '',
                e.CLASSE_NOM || '',
                e.EMAIL || '',
                e.STATUT || ''
            ];
        });

        doc.autoTable({
            head: head,
            body: body,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [0, 123, 255] },
            styles: { fontSize: 8, cellPadding: 2 },
            didDrawPage: function (data) {
                doc.setFontSize(8);
                doc.text("Page " + data.pageNumber, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save('Liste_Eleves.pdf');

    } catch (err) {
        console.error("Erreur PDF détaillée:", err);
        Swal.fire('Erreur', 'Erreur lors de la génération : ' + err.message, 'error');
    }
};