var sqlCurrentPage  = 1;
var sqlRowsPerPage  = 10;
var sqlAllData      = [];   
var sqlAllColumns   = [];   

function executeCustomSQL() {
    var queryArea  = document.getElementById('sqlConsole');
    var resultDiv  = document.getElementById('sqlExecutionResult');

    if (!queryArea || !queryArea.value.trim()) {
        Swal.fire({ icon: 'error', title: 'Champ vide', text: 'Veuillez saisir une requête.' });
        return;
    }

    var queryText = queryArea.value.trim();

    Swal.fire({
        title: 'Confirmer l\'exécution ?',
        text: 'Action directe sur la base de données scolaire.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, exécuter'
    }).then(function (result) {
        if (!result.isConfirmed) return;

        Swal.showLoading();

        var formData = new URLSearchParams();
        formData.append('query', queryText);

        fetch('handlers/ExecuteSQL.ashx', {
            method : 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body   : formData
        })
        .then(function (response) { return response.json(); })
        .then(function (res) {
            Swal.close();
            if (res.success) {
                if (res.type === 'SELECT') {
                    sqlAllData     = res.data || [];
                    sqlAllColumns  = sqlAllData.length > 0 ? Object.keys(sqlAllData[0]) : [];
                    sqlCurrentPage = 1;
                    renderSqlTablePaged(resultDiv);
                } else {
                    resultDiv.innerHTML = '<div class="alert alert-success" style="margin:10px;">' + res.message + '</div>';
                }
            } else {
                resultDiv.innerHTML = '<div class="alert alert-danger" style="margin:10px;">' + res.message + '</div>';
            }
        })
        .catch(function(err) {
            Swal.fire('Erreur', 'Impossible de joindre le serveur.', 'error');
        });
    });
}

function renderSqlTablePaged(container) {
    if (!sqlAllData || sqlAllData.length === 0) {
        container.innerHTML = '<div class="alert alert-info" style="margin:10px;">Aucun résultat trouvé.</div>';
        return;
    }

    var start = (sqlCurrentPage - 1) * sqlRowsPerPage;
    var end   = Math.min(start + sqlRowsPerPage, sqlAllData.length);
    var pageData = sqlAllData.slice(start, end);

    // Barre d'outils
    var controlBar = '<div style="padding:10px; display:flex; justify-content:space-between; font-size:13px; background:#f8f9fa; border-bottom:1px solid #dee2e6;">' +
        '<span>Lignes: <select onchange="onRowsPerPageChange(this.value)">' +
        [5, 10, 20, 50, 100].map(function(n){ return '<option '+(n==sqlRowsPerPage?'selected':'')+'>'+n+'</option>'; }).join('') +
        '</select></span>' +
        '<span>' + (start+1) + '-' + end + ' sur ' + sqlAllData.length + '</span></div>';

    // Tableau : min-width force le scroll de l'ID parent (sqlExecutionResult)
    var tableHtml = 
        '<table style="width:100%; min-width:1200px; border-collapse:collapse; table-layout:fixed; background:#fff;">' +
            '<thead style="background:#343a40; color:#fff;"><tr>' +
                sqlAllColumns.map(function(col) { 
                    return '<th style="width:150px; padding:12px; text-align:left; border:1px solid #454d55; white-space:nowrap;">' + col + '</th>'; 
                }).join('') +
            '</tr></thead>' +
            '<tbody>' +
                pageData.map(function(row) {
                    return '<tr>' + sqlAllColumns.map(function(col) {
                        var val = row[col];
                        return '<td style="padding:10px; border:1px solid #dee2e6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px;">' + 
                               (val === null ? '<i style="color:#aaa;">null</i>' : escSql(val)) + '</td>';
                    }).join('') + '</tr>';
                }).join('') +
            '</tbody>' +
        '</table>';

    var pagination = buildPagination(Math.ceil(sqlAllData.length / sqlRowsPerPage));

    // Injection dans sqlExecutionResult
    container.innerHTML = controlBar + tableHtml + pagination;
}

function buildPagination(totalPages) {
    if (totalPages <= 1) return '';
    var html = '<div style="padding:15px; text-align:center; background:#f8f9fa; border-top:1px solid #dee2e6;">';
    for (var i = 1; i <= totalPages; i++) {
        html += '<button onclick="goToPage(' + i + ')" style="margin:2px; padding:6px 12px; border:1px solid #ddd; cursor:pointer; border-radius:4px; ' + (i==sqlCurrentPage?'background:#007bff; color:#fff;':'background:#fff;') + '">' + i + '</button>';
    }
    return html + '</div>';
}

function goToPage(p) { 
    sqlCurrentPage = p; 
    renderSqlTablePaged(document.getElementById('sqlExecutionResult')); 
}

function onRowsPerPageChange(v) { 
    sqlRowsPerPage = parseInt(v); 
    sqlCurrentPage = 1; 
    renderSqlTablePaged(document.getElementById('sqlExecutionResult')); 
}

function escSql(s) { 
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); 
}

document.addEventListener('DOMContentLoaded', function () {
    var consoleElem = document.getElementById('sqlConsole');
    if (consoleElem) {
        consoleElem.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); executeCustomSQL(); }
        });
    }
});