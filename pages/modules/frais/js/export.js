'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ET IMPRESSION
// ─────────────────────────────────────────────────────────────────────────────
function exportFraisToExcel() {
    if (!filteredFrais.length) {
        Swal.fire('Info', 'Aucune donnée à exporter', 'info');
        return;
    }

    // Génération du tableau HTML pour Excel
    var date = new Date().toLocaleDateString('fr-FR');
    var rows = [
        ['Matricule', 'Nom', 'Classe', 'Total (Ar)', 'Payé (Ar)', 'Reste (Ar)', 'Progression (%)', 'Statut']
    ];
    filteredFrais.forEach(function (f) {
        // Progression avec virgule comme séparateur décimal
        var progression = (f.PROGRESSION || 0).toFixed(1).replace('.', ',');
        rows.push([
            f.MATRICULE || '',
            f.NOM || '',
            f.CLASSE_NOM || '',
            f.TOTAL || 0,
            f.PAYE || 0,
            f.RESTE || 0,
            progression,
            f.STATUT || 'Non payé'
        ]);
    });

    // Construction du HTML
    var tableHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
        'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
        'xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="UTF-8">' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
        '<x:Name>Frais</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
        '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
        '<style>table{border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt;}' +
        'th{background:#007bff;color:white;font-weight:bold;border:1px solid #000;padding:5px;}' +
        'td{border:1px solid #ccc;padding:5px;}</style></head><body>' +
        '<h2>Rapport des Frais Scolaires</h2>' +
        '<p>Date : ' + date + ' | ' + filteredFrais.length + ' enregistrement(s)</p>' +
        '<table>';

    // En-tête
    tableHtml += '<thead><tr>';
    rows[0].forEach(function (header) {
        tableHtml += '<th>' + header + '</th>';
    });
    tableHtml += '</tr></thead><tbody>';

    // Données
    for (var i = 1; i < rows.length; i++) {
        tableHtml += '<tr>';
        rows[i].forEach(function (cell) {
            tableHtml += '<td>' + cell + '</td>';
        });
        tableHtml += '</tr>';
    }

    tableHtml += '</tbody></table></body></html>';

    // Création du blob et téléchargement
    var blob = new Blob(['\uFEFF' + tableHtml], {
        type: 'application/vnd.ms-excel;charset=utf-8'
    });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    // Nom de fichier avec date et heure (secondes incluses)
    var now = new Date();
    var dateStr = now.toISOString().replace(/[:]/g, '-').replace('T', '_').slice(0, 19);
    link.download = 'Frais_' + dateStr + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function printFraisReport() {
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rapport Frais Scolaires</title>'
        + '<style>body{font-family:Arial;margin:20px}table{width:100%;border-collapse:collapse}'
        + 'th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}'
        + '@media print{button{display:none}}</style></head><body>'
        + '<h2>Rapport des Frais Scolaires</h2>'
        + '<p>Date : ' + new Date().toLocaleDateString('fr-FR') + ' | '
        + filteredFrais.length + ' enregistrement(s)</p>'
        + '<table><thead><tr><th>Matricule</th><th>Nom</th><th>Classe</th>'
        + '<th>Total (Ar)</th><th>Payé (Ar)</th><th>Reste (Ar)</th><th>Progression</th><th>Statut</th></tr></thead><tbody>';

    filteredFrais.forEach(function (f) {
        var progression = (f.PROGRESSION || 0).toFixed(1).replace('.', ',');
        html += '<tr>'
            + '<td>' + escapeHtml(f.MATRICULE || '') + '</td>'
            + '<td>' + escapeHtml(f.NOM || '') + '</td>'
            + '<td>' + escapeHtml(f.CLASSE_NOM || '') + '</td>'
            + '<td>' + (f.TOTAL || 0) + '</td>'
            + '<td>' + (f.PAYE || 0) + '</td>'
            + '<td>' + (f.RESTE || 0) + '</td>'
            + '<td>' + progression + '%</td>'
            + '<td>' + (f.STATUT || 'Non payé') + '</td>'
            + '</tr>';
    });

    html += '</tbody></table>'
        + '<br><button onclick="window.print()" style="padding:10px 20px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;">🖨️ Imprimer</button>'
        + '</body></html>';

    var w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// REÇU DE PAIEMENT AVEC DÉTAILS DES PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────
async function printStudentReceipt(matricule, nom, classe, total, paye, reste, statut) {
    showSpinner();
    try {
        var res = await fetch(API_FRAIS.getHistorique + '?matricule=' + encodeURIComponent(matricule));
        var result = await res.json();

        var history = result.success ? (result.data || []) : [];
        var totalPaiements = history.reduce(function (s, h) { return s + h.MONTANT; }, 0);

        var dateStr = new Date().toLocaleDateString('fr-FR');
        var heureStr = new Date().toLocaleTimeString('fr-FR');
        var dateTimeStr = dateStr + ' à ' + heureStr;

        var paiementsHtml = '';
        if (history.length > 0) {
            paiementsHtml = '<div style="margin-top:25px;">';
            paiementsHtml += '<h3 style="color:#495057;border-left:4px solid #007bff;padding-left:12px;margin-bottom:15px;font-size:16px;">📋 Détail des paiements</h3>';

            for (var i = 0; i < history.length; i++) {
                var h = history[i];
                var borderStyle = i < history.length - 1 ? 'border-bottom:1px solid #e9ecef;' : '';
                paiementsHtml += '<div style="padding:5px 0;' + borderStyle + '">';
                paiementsHtml += '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">';
                paiementsHtml += '<div style="min-width:110px;"><strong>Date de paiement:</strong><br>' + formatDateTime(h.DATE_PAIEMENT) + '</div>';
                paiementsHtml += '<div style="min-width:70px;"><strong>Mois:</strong><br>' + escapeHtml(h.MOIS || '-') + '</div>';
                paiementsHtml += '<div style="min-width:65px;"><strong>Année:</strong><br>' + escapeHtml(h.ANNEE || '-') + '</div>';
                paiementsHtml += '<div style="min-width:100px;text-align:right;"><strong>Montant:</strong><br><span style="color:#28a745;font-weight:bold;">' + formatMoney(h.MONTANT) + '</span></div>';
                paiementsHtml += '<div style="min-width:90px;"><strong>Mode:</strong><br>' + getModePaiementBadge(h.MODE_PAIEMENT) + '</div>';
                paiementsHtml += '<div style="min-width:90px;"><strong>Référence:</strong><br>' + escapeHtml(h.REFERENCE || '-') + '</div>';
                paiementsHtml += '<div style="flex:1;"><strong>Commentaire:</strong><br>' + escapeHtml(h.COMMENTAIRE || '-') + '</div>';
                paiementsHtml += '</div></div>';
            }

            paiementsHtml += '<div style="margin-top:15px;padding:12px;background:#e8f4fd;border-radius:8px;text-align:right;">';
            paiementsHtml += '<div><strong>💰 Total des paiements : ' + formatMoney(totalPaiements) + '</strong></div>';
            paiementsHtml += '<div style="font-size:11px;color:#6c757d;margin-top:5px;">Arrêté le montant total à la somme de : ' + numberToWords(totalPaiements) + '</div>';
            paiementsHtml += '</div></div>';
        } else {
            paiementsHtml = '<p style="margin-top:25px;color:#6c757d;text-align:center;padding:20px;background:#f8f9fa;border-radius:8px;">Aucun paiement enregistré pour cet élève.</p>';
        }

        var statutClass = '';
        var statutIcon = '';
        if (statut === 'Terminé') {
            statutClass = 'badge-success';
            statutIcon = '✅';
        } else if (statut === 'En cours') {
            statutClass = 'badge-warning';
            statutIcon = '⏳';
        } else {
            statutClass = 'badge-danger';
            statutIcon = '❌';
        }

        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reçu — ' + escapeHtml(nom) + '</title>'
            + '<style>'
            + 'body{font-family:"Segoe UI",Arial,sans-serif;margin:30px;color:#333;background:#fff;font-size:12px}'
            + 'h1{color:#007bff;border-bottom:2px solid #007bff;padding-bottom:10px;margin-bottom:0px;font-size:18px}'
            + 'h3{color:#495057;margin:0 0 10px 0}'
            + '.receipt-container{max-width:900px;margin:0 auto;background:#fff;border-radius:12px;padding:20px;position:relative;min-height:500px}'
            + '.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:0px;padding:8px;background:#f8f9fa;border-radius:10px}'
            + '.info-item{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px dashed #dee2e6}'
            + '.info-item:last-child{border-bottom:none}'
            + '.info-label{font-weight:600;color:#6c757d}'
            + '.info-value{font-weight:500;color:#333}'
            + '.totals-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0}'
            + '.total-card{text-align:center;padding:5px;border-radius:10px;background:#fff;border:1px solid #dee2e6}'
            + '.total-label{font-size:11px;color:#6c757d;margin-bottom:5px}'
            + '.total-value{font-size:16px;font-weight:bold}'
            + '.total-value.total{color:#007bff}'
            + '.total-value.paid{color:#28a745}'
            + '.total-value.rest{color:#dc3545}'
            + '.badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600}'
            + '.badge-success{background:#d4edda;color:#155724}'
            + '.badge-warning{background:#fff3cd;color:#856404}'
            + '.badge-danger{background:#f8d7da;color:#721c24}'
            + '.footer{margin-top:10px;text-align:center;color:#6c757d;padding-top:10px;border-top:1px solid #dee2e6}'
            + '.print-btn{display:block;width:200px;margin:20px auto 0;padding:10px 20px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;font-size:12px;text-align:center}'
            + '.print-btn:hover{background:#0056b3}'
            + '.date-footer{position:relative;margin-top:30px;padding-top:5px}'
            + '.date-footer .print-date{font-size:10px;color:#adb5bd;text-align:left}'
            + '@media print{.print-btn{display:none}body{margin:0;padding:10px}.receipt-container{padding:0;min-height:auto}}'
            + '</style></head><body>'
            + '<div class="receipt-container">'
            + '<h1>🏫 Reçu de frais scolaires</h1>'
            + '<div style="display:flex;justify-content:flex-end;margin-bottom:10px;padding:5px;">'
            + '<div><strong>🧾 Reçu N° :</strong> ' + new Date().getTime() + '</div>'
            + '</div>'
            + '<div class="info-grid">'
            + '<div class="info-item"><span class="info-label">Matricule :</span><span class="info-value">' + escapeHtml(matricule) + '</span></div>'
            + '<div class="info-item"><span class="info-label">Nom de l\'élève :</span><span class="info-value">' + escapeHtml(nom) + '</span></div>'
            + '<div class="info-item"><span class="info-label">Classe :</span><span class="info-value">' + escapeHtml(classe) + '</span></div>'
            + '<div class="info-item"><span class="info-label">Statut :</span><span class="info-value"><span class="badge ' + statutClass + '">' + statutIcon + ' ' + escapeHtml(statut) + '</span></span></div>'
            + '</div>'
            + '<div class="totals-grid">'
            + '<div class="total-card"><div class="total-label">💰 Montant total</div><div class="total-value total">' + formatMoney(total) + '</div></div>'
            + '<div class="total-card"><div class="total-label">✅ Montant payé</div><div class="total-value paid">' + formatMoney(paye) + '</div></div>'
            + '<div class="total-card"><div class="total-label">⚠️ Reste à payer</div><div class="total-value rest">' + formatMoney(reste) + '</div></div>'
            + '</div>'
            + paiementsHtml
            + '<div class="date-footer">'
            + '<div class="print-date">📅 Date d\'impression : ' + dateTimeStr + '</div>'
            + '</div>'
            + '<div class="footer">'
            + '<p>Document généré automatiquement par le système de Gestion Scolaire</p>'
            + '<p>Ce reçu fait office de preuve de paiement</p>'
            + '</div>'
            + '<button class="print-btn" onclick="window.print()">🖨️ Imprimer le reçu</button>'
            + '</div></body></html>';

        var w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
    } catch (err) {
        console.error('printStudentReceipt:', err);
        Swal.fire('Erreur', 'Impossible de générer le reçu', 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// REÇU POUR UN PAIEMENT SPÉCIFIQUE (appelé depuis l'historique)
// ─────────────────────────────────────────────────────────────────────────────
function printSinglePaymentReceipt(
    matricule, nom, id, montant, datePaiement, modePaiement,
    reference, commentaire, mois, annee
) {
    // Construction d'un reçu simple pour ce paiement
    var html = `<!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Reçu paiement</title>
    <style>body{font-family:Arial;margin:30px}
    .receipt{max-width:600px;margin:auto;border:1px solid #ddd;padding:20px;border-radius:8px}
    .header{text-align:center;border-bottom:2px solid #007bff;padding-bottom:10px}
    .details{margin:20px 0}
    .detail-item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}
    .label{font-weight:600;color:#555}
    .value{font-weight:500}
    .total{font-size:18px;color:#28a745;text-align:center;margin-top:15px}
    .footer{text-align:center;color:#999;font-size:12px;margin-top:20px}
    .print-btn{display:block;width:200px;margin:20px auto;padding:10px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer}
    @media print{.print-btn{display:none}}
    </style>
    </head>
    <body>
    <div class="receipt">
        <div class="header">
            <h2>🏫 Reçu de paiement</h2>
            <p>N° ${id}</p>
        </div>
        <div class="details">
            <div class="detail-item"><span class="label">Élève :</span><span class="value">${escapeHtml(nom)}</span></div>
            <div class="detail-item"><span class="label">Matricule :</span><span class="value">${escapeHtml(matricule)}</span></div>
            <div class="detail-item"><span class="label">Mois :</span><span class="value">${escapeHtml(mois)} ${escapeHtml(annee)}</span></div>
            <div class="detail-item"><span class="label">Date paiement :</span><span class="value">${formatDateTime(datePaiement)}</span></div>
            <div class="detail-item"><span class="label">Mode :</span><span class="value">${escapeHtml(modePaiement)}</span></div>
            <div class="detail-item"><span class="label">Référence :</span><span class="value">${escapeHtml(reference || '-')}</span></div>
            <div class="detail-item"><span class="label">Commentaire :</span><span class="value">${escapeHtml(commentaire || '-')}</span></div>
        </div>
        <div class="total">
            <strong>Montant : ${formatMoney(montant)}</strong>
        </div>
        <div class="footer">
            Document généré automatiquement<br>
            ${new Date().toLocaleString('fr-FR')}
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ Imprimer</button>
    </div>
    </body>
    </html>`;

    var w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
}