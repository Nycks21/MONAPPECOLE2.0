/**
 * bulletins.js - Version moderne avec design amélioré
 * La liste des matières affiche : NomMatière (NomClasse)
 * La classe est automatiquement définie par la matière sélectionnée
 */

// ============================================================
// FONCTIONS REQUISES PAR LE HTML
// ============================================================

function onMatiereChange() {
    console.log('[UI] Matière changée');
    
    const matiereSelect = document.getElementById('ddlMatiere');
    const selectedOption = matiereSelect.options[matiereSelect.selectedIndex];
    const classeId = selectedOption?.getAttribute('data-classe-id');
    const classeNom = selectedOption?.getAttribute('data-classe-nom');
    
    // Mettre à jour le select des classes (lecture seule)
    const classeSelect = document.getElementById('ddlClasse');
    if (classeSelect && classeId) {
        classeSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = classeId;
        opt.textContent = classeNom || 'Classe';
        classeSelect.appendChild(opt);
        classeSelect.disabled = true; // Désactiver car la classe est liée à la matière
    }
    
    const coeff = getMatiereCoefficient();
    const maxNote = 20 * coeff;
    showToast(`Coefficient ${coeff} → Note maximale: ${maxNote}/20`, 'info');
    
    // Recharger le tableau
    afficherListe();
}

function onClasseChange() {
    // La classe ne peut plus être changée manuellement
    console.log('[UI] Classe changée (désactivé)');
}

function closeModal(id) {
    const modal = document.getElementById(id || 'bulletinModal');
    if (modal) modal.style.display = 'none';
}

// ============================================================
// VARIABLES GLOBALES
// ============================================================

let currentUser = {
    role: null,
    userName: null,
    professeurId: null,
    classesAutorisees: [],
    matieresAutorisees: []
};

let allMatieres = [];
let currentEleves = [];

// ============================================================
// RÉCUPÉRATION DU CONTEXTE UTILISATEUR
// ============================================================

function getUserContext() {
    console.log('[CONTEXTE] Lecture du contexte utilisateur...');
    
    currentUser.role = document.getElementById('hfUserRole')?.value || '';
    currentUser.userName = document.getElementById('hfUserName')?.value || '';
    currentUser.professeurId = document.getElementById('hfProfesseurId')?.value || '';
    
    const classesAutoriseesStr = document.getElementById('hfClassesAutorisees')?.value || '[]';
    const matieresAutoriseesStr = document.getElementById('hfMatieresAutorisees')?.value || '[]';
    
    try {
        currentUser.classesAutorisees = JSON.parse(classesAutoriseesStr);
        currentUser.matieresAutorisees = JSON.parse(matieresAutoriseesStr);
    } catch(e) {
        console.error('[CONTEXTE] Erreur parsing JSON:', e);
        currentUser.classesAutorisees = [];
        currentUser.matieresAutorisees = [];
    }
    
    const navbarUsername = document.getElementById('navbarUsername');
    if (navbarUsername && currentUser.userName) {
        navbarUsername.textContent = currentUser.userName;
    }
    
    const profilUsername = document.getElementById('profilUsername');
    if (profilUsername) {
        let roleName = '';
        switch(currentUser.role) {
            case '0': roleName = 'Super Admin'; break;
            case '1': roleName = 'Admin'; break;
            case '3': roleName = 'Professeur'; break;
            case '4': roleName = 'Secrétaire'; break;
            case '5': roleName = 'Comptable'; break;
            default: roleName = 'Utilisateur';
        }
        profilUsername.textContent = `Profil : ${roleName}`;
    }
    
    console.log('[CONTEXTE] Utilisateur:', {
        role: currentUser.role,
        userName: currentUser.userName,
        classesAutorisees: currentUser.classesAutorisees.length,
        matieresAutorisees: currentUser.matieresAutorisees.length
    });
    
    return currentUser;
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log(message);
        return;
    }
    
    const colors = {
        success: '#d4edda;color:#155724;border-left:4px solid #28a745',
        error: '#f8d7da;color:#721c24;border-left:4px solid #dc3545',
        warning: '#fff3cd;color:#856404;border-left:4px solid #ffc107',
        info: '#d1ecf1;color:#0c5460;border-left:4px solid #17a2b8'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `background:${(colors[type] || colors.info).split(';')[0]}; ${(colors[type] || colors.info).split(';')[1]}; padding:12px 18px; border-radius:8px; font-size:13px; font-weight:500; min-width:280px; box-shadow:0 4px 12px rgba(0,0,0,.15); opacity:0; transition:opacity .3s; margin-bottom:10px; cursor:pointer; z-index:9999;`;
    
    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <i class="fas ${icons[type] || icons.info}" style="font-size:18px;"></i>
            <span style="flex:1;">${message}</span>
            <i class="fas fa-times" style="cursor:pointer; opacity:0.6;"></i>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    
    toast.addEventListener('click', () => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 350);
    });
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }
    }, 4000);
}

// ============================================================
// CHARGEMENT DES MATIÈRES
// ============================================================

// Dans getUserContext(), le rôle est déjà récupéré depuis hfUserRole
// Pas besoin de logique supplémentaire car le C# a déjà filtré les données

async function chargerMatieres() {
    try {
        console.log('[LOAD] Début chargement des matières...');
        console.log('[LOAD] Rôle utilisateur (depuis C#):', currentUser.role);
        
        const response = await fetch('../../parametres/matieres/handlers/GetMatieres.ashx');
        const data = await response.json();
        
        const select = document.getElementById('ddlMatiere');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Sélectionner une matière --</option>';
        
        allMatieres = [];
        if (data.matieres) allMatieres = data.matieres;
        else if (data.data) allMatieres = data.data;
        
        console.log('[LOAD] Matières totales:', allMatieres.length);
        
        // ============================================================
        // FILTRAGE PAR RÔLE - LE C# A DÉJÀ PRÉPARÉ LES DONNÉES
        // ============================================================
        let matieresToShow = [];
        const isSuperAdmin = (currentUser.role === '0');
        
        if (isSuperAdmin) {
            // SuperAdmin voit TOUTES les matières
            matieresToShow = allMatieres;
            console.log('[FILTRE] SuperAdmin - Affichage de toutes les matières');
        } 
        else if (currentUser.matieresAutorisees && currentUser.matieresAutorisees.length > 0) {
            // Professeur - ne voit que ses matières autorisées
            const autoriseesIds = currentUser.matieresAutorisees.map(m => {
                if (typeof m === 'object' && m !== null) {
                    return (m.ID || m.id).toString();
                }
                return m.toString();
            });
            
            matieresToShow = allMatieres.filter(m => {
                const matiereId = (m.ID || m.id).toString();
                return autoriseesIds.includes(matiereId);
            });
            
            console.log('[FILTRE] Professeur - Matières autorisées:', matieresToShow.length);
        } 
        else {
            // Autres rôles ou aucune matière autorisée
            matieresToShow = [];
            console.log('[FILTRE] Aucune matière autorisée');
        }
        
        if (matieresToShow.length === 0) {
            select.innerHTML = '<option value="">-- Aucune matière disponible --</option>';
            if (!isSuperAdmin) {
                showToast('Vous n\'êtes affecté à aucune matière. Veuillez contacter l\'administrateur.', 'warning');
            }
            return;
        }
        
        // Peupler le select
        for (let m of matieresToShow) {
            let opt = document.createElement('option');
            opt.value = m.ID || m.id;
            
            let displayText = m.NOM || m.nom;
            if (m.CLASSE_NOM) {
                displayText = `${displayText} (${m.CLASSE_NOM})`;
            }
            opt.textContent = displayText;
            
            const coeff = m.COEFFICIENT || 1;
            opt.setAttribute('data-coeff', coeff);
            opt.setAttribute('data-classe-id', m.CLASSE_ID);
            opt.setAttribute('data-classe-nom', m.CLASSE_NOM || '');
            
            select.appendChild(opt);
        }
        
        console.log('[LOAD] Matières chargées:', matieresToShow.length);
        
        if (matieresToShow.length === 1) {
            select.value = matieresToShow[0].ID;
            onMatiereChange();
        }
        
    } catch(e) {
        console.error('Erreur matières:', e);
        showToast('Erreur lors du chargement des matières', 'error');
    }
}

function getMatiereCoefficient() {
    const matiereSelect = document.getElementById('ddlMatiere');
    const selectedOption = matiereSelect.options[matiereSelect.selectedIndex];
    const coeff = selectedOption?.getAttribute('data-coeff') || 1;
    return parseFloat(coeff);
}

// ============================================================
// AFFICHAGE DE LA LISTE
// ============================================================

async function afficherListe() {
    console.log('[ACTION] afficherListe() appelé');
    
    const matiereId = document.getElementById('ddlMatiere').value;
    const classeId = document.getElementById('ddlClasse').value;
    const periodeId = document.getElementById('ddlPeriode').value;
    
    if (!matiereId || !classeId || !periodeId) {
        showToast('Veuillez sélectionner une matière, une classe et une période', 'warning');
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
            showToast(data.message || 'Erreur de chargement', 'error');
            return;
        }
        
        const eleves = data.eleves || [];
        currentEleves = eleves;
        
        if (eleves.length === 0) {
            showToast('Aucun élève trouvé', 'warning');
            return;
        }
        
        // Mettre à jour l'en-tête - sans la classe en double
        const selectedMatiere = document.getElementById('ddlMatiere').options[document.getElementById('ddlMatiere').selectedIndex];
        const nomMatiere = selectedMatiere?.textContent || '';
        // NE PLUS utiliser nomClasse dans l'en-tête car il est déjà dans nomMatiere
        const nomPeriode = document.getElementById('ddlPeriode').options[document.getElementById('ddlPeriode').selectedIndex]?.text || '';
        
        // Afficher uniquement Matière et Période (la classe est déjà dans le nom de la matière)
        document.getElementById('tableInfoLabel').innerHTML = `<i class="fas fa-graduation-cap"></i> ${nomMatiere} — ${nomPeriode}`;
        document.getElementById('countBadge').textContent = `${eleves.length} élève(s)`;
        
        renderModernTable(eleves);
        
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('tableWrapper').style.display = 'block';
        
        const coeff = getMatiereCoefficient();
        const maxNote = 20 * coeff;
        showToast(`Coefficient ${coeff} - Note max: ${maxNote}/20`, 'info');
        
    } catch(e) {
        console.error('Erreur:', e);
        showToast('Erreur: ' + e.message, 'error');
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
    
    const coeff = getMatiereCoefficient();
    const maxNote = 20 * coeff;
    
    let placeholder = '0-20';
    if (coeff === 1) {
        placeholder = '0-20';
    } else if (coeff === 2) {
        placeholder = '0-40';
    } else if (coeff === 3) {
        placeholder = '0-60';
    } else {
        placeholder = `0-${maxNote}`;
    }
    
    tbody.innerHTML = '';
    
    eleves.forEach((eleve, idx) => {
        const isReadonly = (eleve.Statut === 'Enregistré' || eleve.Statut === 'Validé');
        const bgColor = isReadonly ? '#f8f9fa' : '#fff';
        const rowClass = idx % 2 === 0 ? 'table-row-even' : 'table-row-odd';
        
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
        
        const coeffHint = coeff > 1 ? `<small style="display:block; font-size:9px; color:#856404;">max:${maxNote}</small>` : '';
        
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
                       value="${eleve.Note1 || ''}" step="0.5" min="0" max="${maxNote}" 
                       ${isReadonly ? 'readonly' : ''}
                       placeholder="${placeholder}">
                ${coeffHint}
            </td>
            <td class="cell-note">
                <input type="number" class="note-input note-input-modern" data-field="note2" 
                       value="${eleve.Note2 || ''}" step="0.5" min="0" max="${maxNote}" 
                       ${isReadonly ? 'readonly' : ''}
                       placeholder="${placeholder}">
                ${coeffHint}
            </td>
            <td class="cell-note">
                <input type="number" class="note-input note-input-modern" data-field="projet" 
                       value="${eleve.NoteProjet || ''}" step="0.5" min="0" max="${maxNote}" 
                       ${isReadonly ? 'readonly' : ''}
                       placeholder="${placeholder}">
                ${coeffHint}
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
            </tr>
        `;
    });
    
    document.querySelectorAll('.note-input-modern').forEach(input => {
        input.removeEventListener('input', handleNoteInput);
        input.addEventListener('input', handleNoteInput);
    });
    
    document.querySelectorAll('.appreciation-input').forEach(ta => {
        ta.removeEventListener('input', handleAppreciationInput);
        ta.addEventListener('input', handleAppreciationInput);
    });
}

function handleNoteInput(e) {
    const input = e.target;
    const row = input.closest('tr');
    const idx = parseInt(row.dataset.idx);
    const field = input.getAttribute('data-field');
    const value = parseFloat(input.value);
    
    let fieldName = '';
    if (field === 'note1') fieldName = 'Note 1';
    else if (field === 'note2') fieldName = 'Note 2';
    else if (field === 'projet') fieldName = 'Projet';
    
    if (input.value !== '' && !isNaN(value)) {
        const coeff = getMatiereCoefficient();
        const maxAllowed = 20 * coeff;
        
        if (value < 0) {
            showToast(`${fieldName} ne peut pas être négative`, 'error');
            input.value = '';
            return;
        }
        
        if (value > maxAllowed) {
            showToast(`⚠️ ${fieldName} = ${value}/${maxAllowed} dépasse la limite ! (Coeff ${coeff} → max ${maxAllowed})`, 'error');
            input.value = '';
            return;
        }
    }
    
    if (currentEleves && currentEleves[idx]) {
        if (field === 'note1') currentEleves[idx].Note1 = value || null;
        if (field === 'note2') currentEleves[idx].Note2 = value || null;
        if (field === 'projet') currentEleves[idx].NoteProjet = value || null;
    }
    
    updateMoyenneModerne(input);
    marquerModification(input);
}

function handleAppreciationInput(e) {
    const input = e.target;
    const row = input.closest('tr');
    const idx = parseInt(row.dataset.idx);
    const value = input.value;
    
    if (currentEleves && currentEleves[idx]) {
        currentEleves[idx].Appreciation = value;
    }
    marquerModification(input);
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
// SAUVEGARDE
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
        showToast('Aucune donnée à sauvegarder', 'warning');
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
        
        showToast(`${successCount} note(s) sauvegardée(s) avec succès`, 'success');
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
            showToast(`${result.updated || 0} note(s) validée(s) définitivement`, 'success');
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
    
    let csv = `Matière;${nomMatiere}\nClasse;${nomClasse}\nPériode;${nomPeriode}\n\n`;
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
    a.download = `Bulletin_${nomMatiere}_${nomClasse}_${nomPeriode}.csv`.replace(/\s/g, '_');
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Export terminé', 'success');
};

// ============================================================
// UTILITAIRES
// ============================================================

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[INIT] DOM chargé');
    
    getUserContext();
    
    // Charger uniquement les matières (elles contiennent déjà CLASSE_ID et CLASSE_NOM)
    chargerMatieres();
    
    // Désactiver le select des classes (sera rempli automatiquement)
    const classeSelect = document.getElementById('ddlClasse');
    if (classeSelect) {
        classeSelect.disabled = true;
        classeSelect.innerHTML = '<option value="">-- Choisissez une matière d\'abord --</option>';
    }
    
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
    
    const matiereSelect = document.getElementById('ddlMatiere');
    if (matiereSelect) {
        matiereSelect.addEventListener('change', onMatiereChange);
    }
    
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    }
    
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    if (notifToggle && notifDropdown) {
        notifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => notifDropdown.classList.remove('show'));
    }
    
    console.log('[INIT] Terminé');
});