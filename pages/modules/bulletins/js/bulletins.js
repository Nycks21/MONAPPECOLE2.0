/**
 * bulletins.js - Version avec coefficients globaux
 */

// ============================================================
// VARIABLES GLOBALES
// ============================================================

let currentUser = { role: null, userName: null, professeurId: null, classesAutorisees: [], matieresAutorisees: [] };
let allMatieres = [];
let currentEleves = [];
let currentCoefficients = { coeff1: 1, coeff2: 2, coeffProjet: 1 };
let currentMatiereId = null;
let currentClasseId = null;
let currentPeriode = null;

// ============================================================
// FONCTIONS REQUISES
// ============================================================

function onMatiereChange() {
    const matiereSelect = document.getElementById('ddlMatiere');
    const selectedOption = matiereSelect.options[matiereSelect.selectedIndex];
    const classeId = selectedOption?.getAttribute('data-classe-id');
    const classeNom = selectedOption?.getAttribute('data-classe-nom');
    currentMatiereId = matiereSelect.value;
    
    const classeSelect = document.getElementById('ddlClasse');
    if (classeSelect && classeId) {
        classeSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = classeId;
        opt.textContent = classeNom || 'Classe';
        classeSelect.appendChild(opt);
        classeSelect.disabled = true;
        currentClasseId = classeId;
    }
    
    // Cacher le panneau des coefficients
    document.getElementById('coeffGlobalPanel').style.display = 'none';
}

function onClasseChange() {}

function closeModal(id) {
    const modal = document.getElementById(id || 'bulletinModal');
    if (modal) modal.style.display = 'none';
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) { console.log(message); return; }
    
    const colors = {
        success: '#d4edda;color:#155724;border-left:4px solid #28a745',
        error: '#f8d7da;color:#721c24;border-left:4px solid #dc3545',
        warning: '#fff3cd;color:#856404;border-left:4px solid #ffc107',
        info: '#d1ecf1;color:#0c5460;border-left:4px solid #17a2b8'
    };
    
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    
    const toast = document.createElement('div');
    toast.style.cssText = `background:${colors[type].split(';')[0]}; ${colors[type].split(';')[1]}; padding:12px 18px; border-radius:8px; font-size:13px; font-weight:500; min-width:280px; box-shadow:0 4px 12px rgba(0,0,0,.15); opacity:0; transition:opacity .3s; margin-bottom:10px; cursor:pointer; z-index:9999;`;
    toast.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><i class="fas ${icons[type]}" style="font-size:18px;"></i><span style="flex:1;">${message}</span><i class="fas fa-times" style="cursor:pointer; opacity:0.6;"></i></div>`;
    
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    toast.addEventListener('click', () => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 350); });
    setTimeout(() => { if (toast.parentNode) { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 350); } }, 4000);
}

// ============================================================
// CONTEXTE UTILISATEUR
// ============================================================

function getUserContext() {
    currentUser.role = document.getElementById('hfUserRole')?.value || '';
    currentUser.userName = document.getElementById('hfUserName')?.value || '';
    currentUser.professeurId = document.getElementById('hfProfesseurId')?.value || '';
    
    const classesAutoriseesStr = document.getElementById('hfClassesAutorisees')?.value || '[]';
    const matieresAutoriseesStr = document.getElementById('hfMatieresAutorisees')?.value || '[]';
    
    try {
        currentUser.classesAutorisees = JSON.parse(classesAutoriseesStr);
        currentUser.matieresAutorisees = JSON.parse(matieresAutoriseesStr);
    } catch(e) { currentUser.classesAutorisees = []; currentUser.matieresAutorisees = []; }
    
    const navbarUsername = document.getElementById('navbarUsername');
    if (navbarUsername && currentUser.userName) navbarUsername.textContent = currentUser.userName;
    
    const profilUsername = document.getElementById('profilUsername');
    if (profilUsername) {
        let roleName = { '0': 'Super Admin', '1': 'Admin', '3': 'Professeur', '4': 'Secrétaire', '5': 'Comptable' }[currentUser.role] || 'Utilisateur';
        profilUsername.textContent = `Profil : ${roleName}`;
    }
}

// ============================================================
// CHARGEMENT DES MATIÈRES
// ============================================================

async function chargerMatieres() {
    try {
        const response = await fetch('../../parametres/matieres/handlers/GetMatieres.ashx');
        const data = await response.json();
        
        const select = document.getElementById('ddlMatiere');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Sélectionner une matière --</option>';
        allMatieres = data.matieres || data.data || [];
        
        let matieresToShow = [];
        const isSuperAdmin = (currentUser.role === '0');
        
        if (isSuperAdmin) {
            matieresToShow = allMatieres;
        } else if (currentUser.matieresAutorisees.length > 0) {
            const autoriseesIds = currentUser.matieresAutorisees.map(m => (m.ID || m.id || m).toString());
            matieresToShow = allMatieres.filter(m => autoriseesIds.includes((m.ID || m.id).toString()));
        }
        
        if (matieresToShow.length === 0) {
            select.innerHTML = '<option value="">-- Aucune matière disponible --</option>';
            return;
        }
        
        for (let m of matieresToShow) {
            let opt = document.createElement('option');
            opt.value = m.ID || m.id;
            let displayText = m.NOM || m.nom;
            if (m.CLASSE_NOM) displayText = `${displayText} (${m.CLASSE_NOM})`;
            opt.textContent = displayText;
            opt.setAttribute('data-classe-id', m.CLASSE_ID);
            opt.setAttribute('data-classe-nom', m.CLASSE_NOM || '');
            select.appendChild(opt);
        }
        
        if (matieresToShow.length === 1) {
            select.value = matieresToShow[0].ID;
            onMatiereChange();
        }
    } catch(e) {
        console.error('Erreur matières:', e);
        showToast('Erreur lors du chargement des matières', 'error');
    }
}

// ============================================================
// CALCUL DE LA MOYENNE
// ============================================================

function calculerMoyenne(note1, note2, noteProjet) {
    let somme = 0;
    let totalCoeff = 0;
    
    // Les coefficients sont maintenant des entiers
    if (note1 !== null && note1 !== undefined && note1 !== '' && !isNaN(parseFloat(note1))) {
        somme += parseFloat(note1) * currentCoefficients.coeff1;
        totalCoeff += currentCoefficients.coeff1;
    }
    if (note2 !== null && note2 !== undefined && note2 !== '' && !isNaN(parseFloat(note2))) {
        somme += parseFloat(note2) * currentCoefficients.coeff2;
        totalCoeff += currentCoefficients.coeff2;
    }
    if (noteProjet !== null && noteProjet !== undefined && noteProjet !== '' && !isNaN(parseFloat(noteProjet))) {
        somme += parseFloat(noteProjet) * currentCoefficients.coeffProjet;
        totalCoeff += currentCoefficients.coeffProjet;
    }
    
    if (totalCoeff > 0) {
        return (somme / totalCoeff).toFixed(1);
    }
    return '-';
}

// ============================================================
// AFFICHAGE DE LA LISTE
// ============================================================

async function afficherListe() {
    const matiereId = document.getElementById('ddlMatiere').value;
    const classeId = document.getElementById('ddlClasse').value;
    const periode = document.getElementById('ddlPeriode').value;
    
    if (!matiereId || !classeId || !periode) {
        showToast('Veuillez sélectionner une matière, une classe et une période', 'warning');
        return;
    }
    
    currentMatiereId = matiereId;
    currentClasseId = classeId;
    currentPeriode = periode;
    
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        const response = await fetch('handlers/GetBulletins.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classeId: classeId, matiereId: matiereId, periodeId: periode })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            showToast(data.message || 'Erreur de chargement', 'error');
            return;
        }
        
        currentEleves = data.eleves || [];
        
        // Récupérer les coefficients sauvegardés
        if (data.coefficients) {
            currentCoefficients = data.coefficients;
            document.getElementById('globalCoeff1').value = currentCoefficients.coeff1;
            document.getElementById('globalCoeff2').value = currentCoefficients.coeff2;
            document.getElementById('globalCoeffProjet').value = currentCoefficients.coeffProjet;
        }
        
        if (currentEleves.length === 0) {
            showToast('Aucun élève trouvé', 'warning');
            return;
        }
        
        const selectedMatiere = document.getElementById('ddlMatiere').options[document.getElementById('ddlMatiere').selectedIndex];
        const nomMatiere = selectedMatiere?.textContent || '';
        const nomPeriode = document.getElementById('ddlPeriode').options[document.getElementById('ddlPeriode').selectedIndex]?.text || '';
        
        document.getElementById('tableInfoLabel').innerHTML = `<i class="fas fa-graduation-cap"></i> ${nomMatiere} — ${nomPeriode}`;
        document.getElementById('countBadge').textContent = `${currentEleves.length} élève(s)`;
        
        renderTable();
        
        // Afficher le panneau des coefficients
        document.getElementById('coeffGlobalPanel').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('tableWrapper').style.display = 'block';
        
        // Afficher les coefficients actuels dans le message
        document.getElementById('coeffMessage').innerHTML = `Coefficients actuels : Note1 (×${currentCoefficients.coeff1}) | Note2 (×${currentCoefficients.coeff2}) | Examen (×${currentCoefficients.coeffProjet})`;
        
    } catch(e) {
        console.error('Erreur:', e);
        showToast('Erreur: ' + e.message, 'error');
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

// ============================================================
// RENDU DU TABLEAU
// ============================================================

function renderTable() {
    const tbody = document.getElementById('notesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentEleves.forEach((eleve, idx) => {
        const isReadonly = (eleve.Statut === 'Enregistré' || eleve.Statut === 'Validé');
        const moyenne = calculerMoyenne(eleve.Note1, eleve.Note2, eleve.NoteProjet);
        
        let moyenneClass = '';
        if (moyenne !== '-') {
            const m = parseFloat(moyenne);
            if (m >= 16) moyenneClass = 'moyenne-excellent';
            else if (m >= 14) moyenneClass = 'moyenne-tres-bien';
            else if (m >= 12) moyenneClass = 'moyenne-bien';
            else if (m >= 10) moyenneClass = 'moyenne-passable';
            else moyenneClass = 'moyenne-insuffisant';
        }
        
        let statutClass = 'statut-non-saisi';
        let statutIcon = '○';
        if (eleve.Statut === 'Validé') { statutClass = 'statut-valide'; statutIcon = '✓'; }
        else if (eleve.Statut === 'En cours') { statutClass = 'statut-en-cours'; statutIcon = '⏳'; }
        else if (eleve.Statut === 'Enregistré') { statutClass = 'statut-enregistre'; statutIcon = '📝'; }
        
        const row = tbody.insertRow();
        row.className = idx % 2 === 0 ? 'table-row-even' : 'table-row-odd';
        row.dataset.idx = idx;
        row.dataset.eleveId = eleve.EleveId;
        
        row.innerHTML = `
            <td class="cell-eleve">
        <div class="eleve-avatar"><i class="fas fa-user-graduate"></i></div>
        <div class="eleve-info">
            <strong class="eleve-nom">${escapeHtml(eleve.Nom || '')}</strong>
            <span class="eleve-numero">#${idx + 1}</span>
        </div>
            </td>
            <td class="cell-note">
                <input type="number" class="note-input note-input-modern" data-field="note1" 
                    value="${eleve.Note1 || ''}" step="0.5" min="0" max="20" 
                    ${isReadonly ? 'readonly' : ''} placeholder="0-20">
                <div class="coeff-display">×${currentCoefficients.coeff1}</div>
            </td>
            <td class="cell-note">
                <input type="number" class="note-input note-input-modern" data-field="note2" 
                    value="${eleve.Note2 || ''}" step="0.5" min="0" max="20" 
                    ${isReadonly ? 'readonly' : ''} placeholder="0-20">
                <div class="coeff-display">×${currentCoefficients.coeff2}</div>
            </td>
            <td class="cell-note">
                <input type="number" class="note-input note-input-modern" data-field="projet" 
                    value="${eleve.NoteProjet || ''}" step="0.5" min="0" max="20" 
                    ${isReadonly ? 'readonly' : ''} placeholder="0-20">
                <div class="coeff-display">×${currentCoefficients.coeffProjet}</div>
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
        input.removeEventListener('input', handleNoteInput);
        input.addEventListener('input', handleNoteInput);
    });
    
    document.querySelectorAll('.appreciation-input').forEach(ta => {
        ta.removeEventListener('input', handleAppreciationInput);
        ta.addEventListener('input', handleAppreciationInput);
    });
}

// ============================================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================================

function handleNoteInput(e) {
    const input = e.target;
    const row = input.closest('tr');
    const idx = parseInt(row.dataset.idx);
    const field = input.getAttribute('data-field');
    const value = parseFloat(input.value);
    
    if (input.value !== '' && !isNaN(value)) {
        if (value < 0) { showToast(`La note ne peut pas être négative`, 'error'); input.value = ''; return; }
        if (value > 20) { showToast(`⚠️ Note maximum: 20/20`, 'error'); input.value = ''; return; }
    }
    
    if (currentEleves && currentEleves[idx]) {
        if (field === 'note1') currentEleves[idx].Note1 = value || null;
        if (field === 'note2') currentEleves[idx].Note2 = value || null;
        if (field === 'projet') currentEleves[idx].NoteProjet = value || null;
    }
    
    updateMoyenneFromRow(row, idx);
    marquerModification(input);
}

function handleAppreciationInput(e) {
    const input = e.target;
    const row = input.closest('tr');
    const idx = parseInt(row.dataset.idx);
    
    if (currentEleves && currentEleves[idx]) {
        currentEleves[idx].Appreciation = input.value;
    }
    marquerModification(input);
}

function updateMoyenneFromRow(row, idx) {
    if (!currentEleves[idx]) return;
    
    const eleve = currentEleves[idx];
    const moyenne = calculerMoyenne(eleve.Note1, eleve.Note2, eleve.NoteProjet);
    
    const moyenneValue = row.querySelector('.moyenne-value');
    if (moyenneValue) moyenneValue.textContent = moyenne;
    
    const moyenneCircle = row.querySelector('.moyenne-circle');
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
// APPLICATION DES COEFFICIENTS GLOBAUX
// ============================================================

async function appliquerCoefficients() {
    const coeff1 = parseFloat(document.getElementById('globalCoeff1').value);
    const coeff2 = parseFloat(document.getElementById('globalCoeff2').value);
    const coeffProjet = parseFloat(document.getElementById('globalCoeffProjet').value);
    
    if (coeff1 < 0.5 || coeff2 < 0.5 || coeffProjet < 0.5) {
        showToast('Les coefficients doivent être au minimum 0.5', 'warning');
        return;
    }
    
    if (coeff1 > 10 || coeff2 > 10 || coeffProjet > 10) {
        showToast('Les coefficients doivent être au maximum 10', 'warning');
        return;
    }
    
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        // Sauvegarder les coefficients dans la base
        const response = await fetch('handlers/SaveCoeffs.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matiereId: currentMatiereId,
                classeId: currentClasseId,
                periode: currentPeriode,
                coeff1: coeff1,
                coeff2: coeff2,
                coeffProjet: coeffProjet
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Mettre à jour les coefficients locaux
            currentCoefficients = { coeff1, coeff2, coeffProjet };
            
            // Mettre à jour l'affichage des coefficients dans le tableau
            document.querySelectorAll('.coeff-display').forEach((el, idx) => {
                const colIndex = idx % 3;
                if (colIndex === 0) el.textContent = `×${coeff1}`;
                else if (colIndex === 1) el.textContent = `×${coeff2}`;
                else if (colIndex === 2) el.textContent = `×${coeffProjet}`;
            });
            
            // Recalculer toutes les moyennes
            document.querySelectorAll('#notesTableBody tr').forEach((row, idx) => {
                updateMoyenneFromRow(row, idx);
            });
            
            document.getElementById('coeffMessage').innerHTML = `Coefficients appliqués : Note1 (×${coeff1}) | Note2 (×${coeff2}) | Examen (×${coeffProjet})`;
            showToast('Coefficients appliqués avec succès', 'success');
        } else {
            showToast(result.message || 'Erreur lors de la sauvegarde', 'error');
        }
    } catch(e) {
        console.error('Erreur:', e);
        showToast('Erreur de connexion', 'error');
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

// ============================================================
// SAUVEGARDE DES NOTES
// ============================================================

window.sauvegarder = async function() {
    const rows = document.querySelectorAll('#notesTableBody tr');
    const modifications = [];
    
    for (let row of rows) {
        const eleveId = row.dataset.eleveId;
        const note1 = row.querySelector('[data-field="note1"]')?.value;
        const note2 = row.querySelector('[data-field="note2"]')?.value;
        const projet = row.querySelector('[data-field="projet"]')?.value;
        const appreciation = row.querySelector('.appreciation-input')?.value;
        
        modifications.push({
            ELEVE_MATRICULE: eleveId,
            NOTE1: note1 && note1 !== '' ? parseFloat(note1) : null,
            NOTE2: note2 && note2 !== '' ? parseFloat(note2) : null,
            NOTE_PROJET: projet && projet !== '' ? parseFloat(projet) : null,
            COEFF1: currentCoefficients.coeff1,
            COEFF2: currentCoefficients.coeff2,
            COEFF_PROJET: currentCoefficients.coeffProjet,
            APPRECIATION: appreciation || '',
            MATIERE_ID: currentMatiereId,
            PERIODE: currentPeriode
        });
    }
    
    if (modifications.length === 0) {
        showToast('Aucune donnée à sauvegarder', 'warning');
        return;
    }
    
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        let successCount = 0;
        for (let mod of modifications) {
            const response = await fetch('handlers/ModifierBulletin.ashx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mod)
            });
            const result = await response.json();
            if (result.success) successCount++;
        }
        
        showToast(`${successCount} élève(s) sauvegardé(s) avec succès`, 'success');
        await afficherListe();
    } catch(e) {
        console.error('Erreur:', e);
        showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
};

window.validerDefinitivement = async function() {
    if (!confirm('⚠️ Validation définitive irréversible. Confirmer ?')) return;
    
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        const response = await fetch('handlers/ValiderDefinitivement.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classeId: currentClasseId, matiereId: currentMatiereId, periodeId: currentPeriode })
        });
        const result = await response.json();
        
        if (result.success) {
            showToast(`${result.updated || 0} élève(s) validé(s) définitivement`, 'success');
            await afficherListe();
        } else {
            showToast(result.message || 'Erreur lors de la validation', 'error');
        }
    } catch(e) {
        console.error('Erreur:', e);
        showToast('Erreur de connexion', 'error');
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
};

window.exporter = function() {
    const rows = document.querySelectorAll('#notesTableBody tr');
    if (rows.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }
    
    const selectedMatiere = document.getElementById('ddlMatiere').options[document.getElementById('ddlMatiere').selectedIndex];
    const nomMatiere = selectedMatiere?.textContent || '';
    const nomClasse = document.getElementById('ddlClasse').options[document.getElementById('ddlClasse').selectedIndex]?.text || '';
    const nomPeriode = document.getElementById('ddlPeriode').options[document.getElementById('ddlPeriode').selectedIndex]?.text || '';
    
    let csv = `Matière;${nomMatiere}\nClasse;${nomClasse}\nPériode;${nomPeriode}\n`;
    csv += `Coefficients;Note1:×${currentCoefficients.coeff1};Note2:×${currentCoefficients.coeff2};Examen:×${currentCoefficients.coeffProjet}\n\n`;
    csv += 'N°;Élève;Note1;Note2;Examen;Moyenne;Appréciation;Statut\n';
    
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
    a.download = `Bulletin_${nomMatiere}_${nomClasse}_${nomPeriode}.csv`.replace(/\s/g, '_');
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Export terminé', 'success');
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    getUserContext();
    chargerMatieres();
    
    const classeSelect = document.getElementById('ddlClasse');
    if (classeSelect) {
        classeSelect.disabled = true;
        classeSelect.innerHTML = '<option value="">-- Choisissez une matière d\'abord --</option>';
    }
    
    const btn = document.getElementById('btnAfficherListe');
    if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', (e) => { e.preventDefault(); afficherListe(); });
    }
    
    const matiereSelect = document.getElementById('ddlMatiere');
    if (matiereSelect) matiereSelect.addEventListener('change', onMatiereChange);
    
    const btnAppliquer = document.getElementById('btnAppliquerCoeffs');
    if (btnAppliquer) btnAppliquer.addEventListener('click', appliquerCoefficients);
    
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) menuToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    
    // Fullscreen
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', () => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
        });
    }
    
    // Notifications
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    if (notifToggle && notifDropdown) {
        notifToggle.addEventListener('click', (e) => { e.stopPropagation(); notifDropdown.classList.toggle('show'); });
        document.addEventListener('click', () => notifDropdown.classList.remove('show'));
    }
});