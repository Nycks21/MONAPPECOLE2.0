/**
 * bulletins.js - Version moderne avec design amélioré
 */

// ============================================================
// FONCTIONS REQUISES PAR LE HTML
// ============================================================

function onClasseChange() {
    console.log('Classe changée');
}

function closeModal(id) {
    const modal = document.getElementById(id || 'bulletinModal');
    if (modal) modal.style.display = 'none';
}

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[INIT] DOM chargé');
    
    // Afficher le nom utilisateur
    const hfUserName = document.getElementById('hfUserName');
    const navbarUsername = document.getElementById('navbarUsername');
    if (hfUserName && navbarUsername && hfUserName.value) {
        navbarUsername.textContent = hfUserName.value;
    }
    
    // Charger les listes déroulantes
    chargerClasses();
    chargerMatieres();
    
    // Attacher l'événement au bouton
    const btn = document.getElementById('btnAfficherListe');
    if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            afficherListe();
            return false;
        });
        console.log('[INIT] Bouton attaché');
    }
});

// ============================================================
// CHARGEMENT DES LISTES
// ============================================================

async function chargerClasses() {
    try {
        const response = await fetch('../../parametres/classes/handlers/GetClasse.ashx');
        const data = await response.json();
        
        const select = document.getElementById('ddlClasse');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Sélectionner --</option>';
        
        let classes = [];
        if (data.Classes) classes = data.Classes;
        else if (data.data) classes = data.data;
        
        for (let c of classes) {
            let opt = document.createElement('option');
            opt.value = c.ID || c.id;
            opt.textContent = c.NOM || c.nom;
            select.appendChild(opt);
        }
        console.log('[LOAD] Classes chargées:', classes.length);
    } catch(e) {
        console.error('Erreur classes:', e);
    }
}

async function chargerMatieres() {
    try {
        const response = await fetch('../../parametres/matieres/handlers/GetMatieres.ashx');
        const data = await response.json();
        
        const select = document.getElementById('ddlMatiere');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Sélectionner --</option>';
        
        let matieres = [];
        if (data.matieres) matieres = data.matieres;
        else if (data.data) matieres = data.data;
        
        for (let m of matieres) {
            let opt = document.createElement('option');
            opt.value = m.ID || m.id;
            opt.textContent = m.NOM || m.nom;
            select.appendChild(opt);
        }
        console.log('[LOAD] Matières chargées:', matieres.length);
    } catch(e) {
        console.error('Erreur matières:', e);
    }
}

// ============================================================
// AFFICHAGE DE LA LISTE AVEC DESIGN MODERNE
// ============================================================

async function afficherListe() {
    console.log('[ACTION] afficherListe() appelé');
    
    const classeId = document.getElementById('ddlClasse').value;
    const matiereId = document.getElementById('ddlMatiere').value;
    const periodeId = document.getElementById('ddlPeriode').value;
    
    if (!classeId || !matiereId || !periodeId) {
        alert('Veuillez sélectionner une classe, une matière et une période');
        return;
    }
    
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        const response = await fetch('handlers/GetBulletins.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                classeId: classeId,
                matiereId: matiereId,
                periodeId: periodeId
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            alert(data.message || 'Erreur de chargement');
            return;
        }
        
        const eleves = data.eleves || [];
        
        if (eleves.length === 0) {
            alert('Aucun élève trouvé');
            return;
        }
        
        // Mettre à jour l'en-tête
        const nomClasse = document.getElementById('ddlClasse').options[document.getElementById('ddlClasse').selectedIndex]?.text || '';
        const nomMatiere = document.getElementById('ddlMatiere').options[document.getElementById('ddlMatiere').selectedIndex]?.text || '';
        const nomPeriode = document.getElementById('ddlPeriode').options[document.getElementById('ddlPeriode').selectedIndex]?.text || '';
        
        document.getElementById('tableInfoLabel').innerHTML = `<i class="fas fa-graduation-cap"></i> ${nomClasse} — ${nomMatiere} — ${nomPeriode}`;
        document.getElementById('countBadge').textContent = `${eleves.length} élève(s)`;
        
        // Remplir le tableau avec design moderne
        renderModernTable(eleves);
        
        // Afficher le tableau
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('tableWrapper').style.display = 'block';
        
    } catch(e) {
        console.error('Erreur:', e);
        alert('Erreur: ' + e.message);
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

// ============================================================
// RENDU DU TABLEAU MODERNE
// ============================================================

function renderModernTable(eleves) {
    const tbody = document.getElementById('notesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    eleves.forEach((eleve, idx) => {
        const isReadonly = (eleve.Statut === 'Enregistré' || eleve.Statut === 'Validé');
        const bgColor = isReadonly ? '#f8f9fa' : '#fff';
        const rowClass = idx % 2 === 0 ? 'table-row-even' : 'table-row-odd';
        
        // Calcul de la moyenne
        let moyenne = '-';
        let moyenneClass = '';
        let somme = 0, coef = 0;
        
        if (eleve.Note1) { somme += parseFloat(eleve.Note1) * 1; coef += 1; }
        if (eleve.Note2) { somme += parseFloat(eleve.Note2) * 2; coef += 2; }
        if (eleve.NoteProjet) { somme += parseFloat(eleve.NoteProjet) * 1; coef += 1; }
        
        if (coef > 0) {
            moyenne = (somme / coef).toFixed(1);
            if (moyenne >= 16) moyenneClass = 'moyenne-excellent';
            else if (moyenne >= 14) moyenneClass = 'moyenne-tres-bien';
            else if (moyenne >= 12) moyenneClass = 'moyenne-bien';
            else if (moyenne >= 10) moyenneClass = 'moyenne-passable';
            else moyenneClass = 'moyenne-insuffisant';
        }
        
        // Déterminer la classe de statut
        let statutClass = 'statut-non-saisi';
        let statutIcon = '○';
        if (eleve.Statut === 'Validé') {
            statutClass = 'statut-valide';
            statutIcon = '✓';
        } else if (eleve.Statut === 'En cours') {
            statutClass = 'statut-en-cours';
            statutIcon = '⏳';
        } else if (eleve.Statut === 'Enregistré') {
            statutClass = 'statut-enregistre';
            statutIcon = '📝';
        }
        
        const row = tbody.insertRow();
        row.className = rowClass;
        row.dataset.idx = idx;
        row.dataset.eleveId = eleve.EleveId;
        
        row.innerHTML = `
            <td class="cell-eleve">
                <div class="eleve-avatar">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="eleve-info">
                    <strong class="eleve-nom">${escapeHtml(eleve.Nom || '')}</strong>
                    <span class="eleve-numero">#${idx + 1}</span>
                </div>
            </td>
            <td class="cell-note">
                <input type="number" class="note-input note-input-modern" data-field="note1" 
                       value="${eleve.Note1 || ''}" step="0.5" min="0" max="20" 
                       ${isReadonly ? 'readonly' : ''}
                       placeholder="Note 1">
                <span class="note-coef">coef 1</span>
            </td>
            <td class="cell-note">
                <input type="number" class="note-input note-input-modern" data-field="note2" 
                       value="${eleve.Note2 || ''}" step="0.5" min="0" max="20" 
                       ${isReadonly ? 'readonly' : ''}
                       placeholder="Note 2">
                <span class="note-coef">coef 2</span>
            </td>
            <td class="cell-note">
                <input type="number" class="note-input note-input-modern" data-field="projet" 
                       value="${eleve.NoteProjet || ''}" step="0.5" min="0" max="20" 
                       ${isReadonly ? 'readonly' : ''}
                       placeholder="Projet">
                <span class="note-coef">coef 1</span>
            </td>
            <td class="cell-moyenne">
                <div class="moyenne-circle ${moyenneClass}">
                    <span class="moyenne-value">${moyenne}</span>
                </div>
            </td>
            <td class="cell-appreciation">
                <textarea class="appreciation-input" rows="2" ${isReadonly ? 'readonly' : ''}
                          placeholder="Appréciation...">${escapeHtml(eleve.Appreciation || '')}</textarea>
            </td>
            <td class="cell-statut">
                <span class="statut-badge ${statutClass}">
                    <i class="statut-icon">${statutIcon}</i> ${eleve.Statut || 'Non saisi'}
                </span>
            </td>
        `;
    });
    
    // Attacher les événements
    document.querySelectorAll('.note-input-modern').forEach(input => {
        input.addEventListener('input', function() {
            updateMoyenneModerne(this);
        });
    });
    
    document.querySelectorAll('.appreciation-input').forEach(ta => {
        ta.addEventListener('input', function() {
            marquerModification(this);
        });
    });
}

function updateMoyenneModerne(input) {
    const row = input.closest('tr');
    const idx = row.dataset.idx;
    const note1 = parseFloat(row.querySelector('[data-field="note1"]')?.value) || 0;
    const note2 = parseFloat(row.querySelector('[data-field="note2"]')?.value) || 0;
    const projet = parseFloat(row.querySelector('[data-field="projet"]')?.value) || 0;
    
    let somme = 0, coef = 0;
    if (note1) { somme += note1 * 1; coef += 1; }
    if (note2) { somme += note2 * 2; coef += 2; }
    if (projet) { somme += projet * 1; coef += 1; }
    
    const moyenne = coef > 0 ? (somme / coef).toFixed(1) : '-';
    const moyenneCircle = row.querySelector('.moyenne-circle');
    const moyenneValue = row.querySelector('.moyenne-value');
    
    if (moyenneValue) moyenneValue.textContent = moyenne;
    
    // Mettre à jour la classe CSS selon la moyenne
    if (moyenneCircle) {
        moyenneCircle.classList.remove('moyenne-excellent', 'moyenne-tres-bien', 'moyenne-bien', 'moyenne-passable', 'moyenne-insuffisant');
        if (moyenne !== '-') {
            const m = parseFloat(moyenne);
            if (m >= 16) moyenneCircle.classList.add('moyenne-excellent');
            else if (m >= 14) moyenneCircle.classList.add('moyenne-tres-bien');
            else if (m >= 12) moyenneCircle.classList.add('moyenne-bien');
            else if (m >= 10) moyenneCircle.classList.add('moyenne-passable');
            else moyenneCircle.classList.add('moyenne-insuffisant');
        }
    }
    
    marquerModification(input);
}

function marquerModification(element) {
    const row = element.closest('tr');
    if (!row) return;
    
    const statutSpan = row.querySelector('.statut-badge');
    if (statutSpan && !statutSpan.textContent.includes('Validé')) {
        statutSpan.className = 'statut-badge statut-en-cours';
        statutSpan.innerHTML = '<i class="statut-icon">⏳</i> En cours';
    }
}

// ============================================================
// SAUVEGARDE DES NOTES
// ============================================================

window.sauvegarder = async function() {
    const rows = document.querySelectorAll('#notesTableBody tr');
    const modifications = [];
    const matiereId = document.getElementById('ddlMatiere').value;
    const periodeId = document.getElementById('ddlPeriode').value;
    
    for (let row of rows) {
        const eleveId = row.dataset.eleveId;
        const note1 = row.querySelector('[data-field="note1"]')?.value;
        const note2 = row.querySelector('[data-field="note2"]')?.value;
        const projet = row.querySelector('[data-field="projet"]')?.value;
        const appreciation = row.querySelector('.appreciation-input')?.value;
        
        modifications.push({
            ELEVE_MATRICULE: eleveId,
            NOTE1: note1 || null,
            NOTE2: note2 || null,
            NOTE_PROJET: projet || null,
            APPRECIATION: appreciation || '',
            MATIERE_ID: matiereId,
            PERIODE: periodeId
        });
    }
    
    if (modifications.length === 0) {
        alert('Aucune donnée à sauvegarder');
        return;
    }
    
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        let successCount = 0;
        for (let mod of modifications) {
            const response = await fetch('handlers/SauvegarderNotes.ashx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mod)
            });
            const result = await response.json();
            if (result.success) successCount++;
        }
        
        alert(`${successCount} note(s) sauvegardée(s) avec succès`);
        await afficherListe(); // Recharger
    } catch(e) {
        console.error('Erreur:', e);
        alert('Erreur lors de la sauvegarde');
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
};

window.validerDefinitivement = async function() {
    if (!confirm('⚠️ Validation définitive irréversible. Confirmer ?')) return;
    
    const classeId = document.getElementById('ddlClasse').value;
    const matiereId = document.getElementById('ddlMatiere').value;
    const periodeId = document.getElementById('ddlPeriode').value;
    
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        const response = await fetch('handlers/ValiderDefinitivement.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classeId, matiereId, periodeId })
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`${result.updated || 0} note(s) validée(s) définitivement`);
            await afficherListe();
        } else {
            alert(result.message || 'Erreur lors de la validation');
        }
    } catch(e) {
        console.error('Erreur:', e);
        alert('Erreur de connexion');
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
};

window.exporter = function() {
    const rows = document.querySelectorAll('#notesTableBody tr');
    if (rows.length === 0) {
        alert('Aucune donnée à exporter');
        return;
    }
    
    const nomClasse = document.getElementById('ddlClasse').options[document.getElementById('ddlClasse').selectedIndex]?.text || '';
    const nomMatiere = document.getElementById('ddlMatiere').options[document.getElementById('ddlMatiere').selectedIndex]?.text || '';
    const nomPeriode = document.getElementById('ddlPeriode').options[document.getElementById('ddlPeriode').selectedIndex]?.text || '';
    
    let csv = `Classe;${nomClasse}\nMatière;${nomMatiere}\nPériode;${nomPeriode}\n\n`;
    csv += 'N°;Élève;Note1;Note2;Projet;Moyenne;Appréciation;Statut\n';
    
    for (let row of rows) {
        const idx = row.dataset.idx;
        const nom = row.querySelector('.eleve-nom')?.textContent || '';
        const note1 = row.querySelector('[data-field="note1"]')?.value || 'Ab';
        const note2 = row.querySelector('[data-field="note2"]')?.value || 'Ab';
        const projet = row.querySelector('[data-field="projet"]')?.value || 'Ab';
        const moyenne = row.querySelector('.moyenne-value')?.textContent || '-';
        const appreciation = row.querySelector('.appreciation-input')?.value || '';
        const statut = row.querySelector('.statut-badge')?.textContent.trim() || 'Non saisi';
        
        csv += `${parseInt(idx)+1};"${nom}";${note1};${note2};${projet};${moyenne};"${appreciation.replace(/"/g, '""')}";${statut}\n`;
    }
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bulletin_${nomClasse}_${nomMatiere}_${nomPeriode}.csv`.replace(/\s/g, '_');
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Export terminé');
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}