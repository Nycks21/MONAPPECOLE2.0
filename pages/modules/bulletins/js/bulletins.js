/**
 * bulletins.js — Gestion complète des bulletins
 * Fusion de la saisie des notes et de la gestion des bulletins
 * Compatible AdminLTE + ASP.NET WebForms
 */

'use strict';

// ============================================================
// CONFIGURATION ET ÉTAT GLOBAL
// ============================================================

// URLs des handlers (API)
const API_BULLETINS = {
    getBulletins: 'handlers/GetBulletins.ashx',
    getEleves: '../eleves/handlers/GetEleve.ashx',
    getClasses: '../../parametres/classes/handlers/GetClasse.ashx',
    getMatieres: '../../parametres/matieres/handlers/GetMatieres.ashx',
    getAnnees: '../../administrations/annee/handlers/GetAnnee.ashx',
    ajouter: 'handlers/AjouterBulletin.ashx',
    modifier: 'handlers/ModifierBulletin.ashx',
    supprimer: 'handlers/SupprimerBulletin.ashx',
    sauvegarderNotes: 'handlers/SauvegarderNotes.ashx',
    validerDefinitivement: 'handlers/ValiderDefinitivement.ashx'
};

// État global de l'application
const APP = {
    userRole: '',
    userName: '',
    professeurId: 0,
    classesAutorisees: [],
    matieresAutorisees: [],
    classeId: null,
    matiereId: null,
    periodeId: null,
    eleves: [],
    modifiedRows: new Set(),
    validees: false,
    bulletinsData: [],
    filteredBulletins: [],
    elevesList: [],
    classesList: [],
    matieresList: [],
    anneesList: [],
    currentPage: 1,
    rowsPerPage: 10,
    currentSortCol: 'ELEVE_NOM',
    currentSortDir: 'ASC',
    currentBulletinId: null,
    currentMode: 'add',
    isLoading: false,
    isSaisieActive: false
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatNote(note) {
    if (note === null || note === undefined) return '-';
    return parseFloat(note).toFixed(1) + '/20';
}

function getNoteClass(note) {
    if (note >= 16) return 'note-excellent';
    if (note >= 14) return 'note-bien';
    if (note >= 12) return 'note-assez-bien';
    if (note >= 10) return 'note-passable';
    return 'note-insuffisant';
}

function fmtNote(v) {
    return (v === null || v === undefined) ? '' : parseFloat(v).toFixed(1);
}

function badgeMoyenneStyle(moy) {
    let bg = '#e9ecef', color = '#6c757d';
    if (moy !== null) {
        if (moy >= 14) { bg = '#d4edda'; color = '#155724'; }
        else if (moy >= 10) { bg = '#fff3cd'; color = '#856404'; }
        else { bg = '#f8d7da'; color = '#721c24'; }
    }
    return `display:inline-block; min-width:52px; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:700; text-align:center; background:${bg}; color:${color};`;
}

function iconStatut(s) {
    const icons = { 'Enregistré': '✅', 'En cours': '⏳', 'Validé': '✅', 'Non saisi': '○', 'Saisi': '○' };
    return icons[s] || '○';
}

function classBadgeStatut(s) {
    const classes = {
        'Enregistré': 'badge badge-success',
        'Validé': 'badge badge-success',
        'En cours': 'badge badge-warning',
        'Non saisi': 'badge badge-secondary',
        'Saisi': 'badge badge-secondary'
    };
    return classes[s] || 'badge badge-secondary';
}

// ============================================================
// SPINNER
// ============================================================

function showSpinner(show) {
    const s = document.getElementById('spinnerOverlay');
    if (s) {
        if (show) {
            s.style.display = 'flex';
            s.style.visibility = 'visible';
            s.style.opacity = '1';
            console.log('[SPINNER] ✅ Affiché');
        } else {
            s.style.display = 'none';
            s.style.visibility = 'hidden';
            s.style.opacity = '0';
            console.log('[SPINNER] ❌ Masqué');
        }
    }
}

// ============================================================
// CONTEXTE UTILISATEUR
// ============================================================

function lireContexteServeur() {
    console.log('[CONTEXTE] 📋 Lecture du contexte serveur...');

    APP.userRole = getHiddenFieldValue('hfUserRole');
    APP.userName = getHiddenFieldValue('hfUserName');
    APP.professeurId = parseInt(getHiddenFieldValue('hfProfesseurId')) || 0;

    try {
        APP.classesAutorisees = JSON.parse(getHiddenFieldValue('hfClassesAutorisees')) || [];
    } catch (e) { APP.classesAutorisees = []; }

    try {
        APP.matieresAutorisees = JSON.parse(getHiddenFieldValue('hfMatieresAutorisees')) || [];
    } catch (e) { APP.matieresAutorisees = []; }

    console.log('[CONTEXTE] 👤 UserRole:', APP.userRole || '(non défini)');
    console.log('[CONTEXTE] 👤 UserName:', APP.userName || '(non défini)');
}

function getHiddenFieldValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function afficherUsernameNavbar() {
    const el = document.getElementById('navbarUsername');
    if (el && APP.userName) {
        el.textContent = APP.userName;
    }
}

// ============================================================
// UI HELPERS
// ============================================================

function getSelectVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function getSelectText(id) {
    const el = document.getElementById(id);
    return el ? (el.options[el.selectedIndex]?.text || '') : '';
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function show(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
}

function hide(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// ============================================================
// MODALES
// ============================================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closeAddBulletinModal() {
    closeModal('addBulletinModal');
    APP.currentMode = 'add';
    APP.currentBulletinId = null;
}

function ouvrirModal(titre, message, onConfirm) {
    setText('modalTitle', titre);
    setText('modalMessage', message);
    const modal = document.getElementById('bulletinModal');
    if (modal) modal.style.display = 'flex';

    const confirmBtn = document.getElementById('btnConfirm');
    const oldBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(oldBtn, confirmBtn);

    oldBtn.onclick = () => {
        closeModal('bulletinModal');
        if (onConfirm) onConfirm();
    };
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        const icon = type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info';
        Swal.fire({ icon: icon, title: message, timer: 2000, showConfirmButton: false });
        return;
    }

    const container = document.getElementById('toastContainer');
    if (!container) {
        alert(message);
        return;
    }

    const colors = {
        success: '#d4edda;color:#155724',
        error: '#f8d7da;color:#721c24',
        warning: '#fff3cd;color:#856404',
        info: '#d1ecf1;color:#0c5460'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `background:${(colors[type] || colors.info).split(';')[0]}; ${(colors[type] || colors.info).split(';')[1]}; padding:12px 18px; border-radius:6px; font-size:13px; font-weight:500; min-width:240px; box-shadow:0 4px 12px rgba(0,0,0,.15); opacity:0; transition:opacity .3s; margin-bottom:10px;`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

// ============================================================
// APPELS AJAX
// ============================================================

async function callApi(url, method = 'GET', data = null) {
    console.log(`[API] 🌐 Appel ${method} vers ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
        };
        if (data && method !== 'GET') options.body = JSON.stringify(data);

        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`[API] ✅ Succès ${url}`);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`[API] ❌ Erreur ${url}:`, error);
        if (error.name === 'AbortError') {
            return { success: false, error: 'Timeout - Le serveur ne répond pas' };
        }
        return { success: false, error: error.message };
    }
}

// ============================================================
// PEUPLEMENT DES SELECTS
// ============================================================

function populateClassSelect() {
    const sel = document.getElementById('ddlClasse');
    if (!sel) return;

    sel.innerHTML = '<option value="">-- Sélectionner une classe --</option>';

    if (APP.classesList && APP.classesList.length > 0) {
        APP.classesList.forEach(classe => {
            const opt = document.createElement('option');
            opt.value = classe.ID || classe.id || '';
            opt.textContent = classe.NOM || classe.nom || 'Classe';
            if (opt.value) sel.appendChild(opt);
        });
    }
}

function populateMatiereSelect() {
    const sel = document.getElementById('ddlMatiere');
    if (!sel) return;

    sel.innerHTML = '<option value="">-- Sélectionner une matière --</option>';

    if (APP.matieresList && APP.matieresList.length > 0) {
        APP.matieresList.forEach(matiere => {
            const opt = document.createElement('option');
            opt.value = matiere.ID || matiere.id || '';
            const coeff = matiere.COEFFICIENT || 1;
            opt.textContent = `${matiere.NOM || 'Matière'} (Coeff: ${coeff})`;
            if (opt.value) sel.appendChild(opt);
        });
    }
}

function populateStudentSelect() {
    const sel = document.getElementById('bulletinStudent');
    if (!sel) return;
    sel.innerHTML = '<option value="">Sélectionner un élève...</option>';
    APP.elevesList.forEach(e => {
        const matricule = e.MATRICULE || e.matricule;
        const nom = e.NOM || e.nom;
        if (matricule) {
            const opt = document.createElement('option');
            opt.value = matricule;
            opt.textContent = `${matricule} — ${nom || ''}`;
            sel.appendChild(opt);
        }
    });
}

// ============================================================
// SECTION 1: SAISIE DES NOTES
// ============================================================

function onClasseChange() {
    const classeId = getSelectVal('ddlClasse');
    console.log('[SAISIE] 📚 Changement de classe:', classeId);
}

async function afficherListe() {
    console.log('[SAISIE] 🔍 afficherListe() appelé');

    if (APP.isLoading) return;

    APP.classeId = getSelectVal('ddlClasse');
    APP.matiereId = getSelectVal('ddlMatiere');
    APP.periodeId = getSelectVal('ddlPeriode');

    if (!APP.classeId || !APP.matiereId || !APP.periodeId) {
        showToast('Veuillez sélectionner une classe, une matière et une période.', 'warning');
        return;
    }

    APP.modifiedRows.clear();
    APP.validees = false;
    APP.isLoading = true;
    APP.isSaisieActive = true;

    showSpinner(true);

    try {
        hide('emptyState');
        hide('tableWrapper');

        const response = await callApi(API_BULLETINS.getBulletins, 'POST', {
            classeId: APP.classeId,
            matiereId: APP.matiereId,
            periodeId: APP.periodeId
        });

        if (!response || !response.success) {
            showToast(response?.message || 'Erreur lors du chargement', 'error');
            show('emptyState');
            APP.isSaisieActive = false;
            return;
        }

        APP.eleves = response.eleves || [];

        if (APP.eleves.length === 0) {
            showToast('Aucun élève trouvé pour cette sélection.', 'warning');
            show('emptyState');
            APP.isSaisieActive = false;
            return;
        }

        const e0 = APP.eleves[0];
        setText('dateEval1', e0.DateEval1 ? `[${e0.DateEval1}]` : '');
        setText('dateEval2', e0.DateEval2 ? `[${e0.DateEval2}]` : '');
        setText('dateEvalP', e0.DateEvalP ? `[${e0.DateEvalP}]` : '');

        const nomClasse = getSelectText('ddlClasse');
        const nomMatiere = getSelectText('ddlMatiere');
        const nomPeriode = getSelectText('ddlPeriode');
        setText('tableInfoLabel', `${nomClasse} — ${nomMatiere} — ${nomPeriode}`);
        setText('countBadge', `${APP.eleves.length} élève(s)`);

        renderSaisieTable();
        show('tableWrapper');

    } catch (error) {
        console.error('[SAISIE] ❌ Erreur:', error);
        showToast('Erreur de connexion au serveur', 'error');
        show('emptyState');
        APP.isSaisieActive = false;
    } finally {
        showSpinner(false);
        APP.isLoading = false;
    }
}

function renderSaisieTable() {
    const tbody = document.getElementById('notesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    APP.eleves.forEach((eleve, idx) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-idx', idx);
        tr.setAttribute('data-eleve-id', eleve.EleveId);
        tr.setAttribute('data-note-id', eleve.NoteId || '');
        tr.innerHTML = buildSaisieLigne(eleve, idx);
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.note-input').forEach(inp => {
        inp.addEventListener('input', (ev) => {
            onNoteChange(ev.target, parseInt(ev.target.closest('tr').dataset.idx));
        });
        inp.addEventListener('blur', (ev) => {
            validateNoteInput(ev.target, parseInt(ev.target.closest('tr').dataset.idx));
        });
    });

    tbody.querySelectorAll('.apprec-input').forEach(ta => {
        ta.addEventListener('input', (ev) => {
            markModified(parseInt(ev.target.closest('tr').dataset.idx));
        });
    });
}

function buildSaisieLigne(eleve, idx) {
    const n1 = fmtNote(eleve.Note1);
    const n2 = fmtNote(eleve.Note2);
    const np = fmtNote(eleve.NoteProjet);
    const moy = calculateAverage(eleve.Note1, eleve.Note2, eleve.NoteProjet);
    const statut = eleve.Statut || 'Non saisi';
    const verrou = (statut === 'Enregistré' || statut === 'Validé');

    const inputStyle = `style="width:75px; text-align:center; height:30px; border:1px solid #ced4da; border-radius:4px; font-size:13px; font-weight:500; padding:2px 6px; background:${verrou ? '#f4f6fb' : '#fff'};"`;
    const disabledAttr = verrou ? 'readonly' : '';

    return `
        <td style="padding:7px 14px; font-weight:500; color:#212529;">
            <span style="background:#e8f4fd; color:#1565c0; font-size:11px; font-weight:700; padding:1px 6px; border-radius:4px; margin-right:6px;">${eleve.Numero || idx + 1}</span>
            ${escapeHtml(eleve.Nom || '')}
        </td>
        <td style="text-align:center; padding:6px 8px;">
            <input type="text" class="note-input" data-col="note1" data-idx="${idx}"
                   value="${n1}" maxlength="5" placeholder="--" ${disabledAttr} ${inputStyle}>
        </td>
        <td style="text-align:center; padding:6px 8px;">
            <input type="text" class="note-input" data-col="note2" data-idx="${idx}"
                   value="${n2}" maxlength="5" placeholder="--" ${disabledAttr} ${inputStyle}>
        </td>
        <td style="text-align:center; padding:6px 8px;">
            <input type="text" class="note-input" data-col="noteprojet" data-idx="${idx}"
                   value="${np}" maxlength="5" placeholder="--" ${disabledAttr} ${inputStyle}>
        </td>
        <td style="text-align:center; padding:6px 8px;">
            <span id="moy-${idx}" style="${badgeMoyenneStyle(moy)}">
                ${moy !== null ? moy.toFixed(2) : '--'}
            </span>
        </td>
        <td style="padding:6px 10px;">
            <textarea class="apprec-input" data-idx="${idx}" rows="2" ${disabledAttr}
                style="width:100%; font-size:12px; border:1px solid #ced4da; border-radius:4px; padding:4px 7px; resize:vertical; background:${verrou ? '#f4f6fb' : '#fff'};">${escapeHtml(eleve.Appreciation || '')}</textarea>
        </td>
        <td style="text-align:center; padding:6px 8px;">
            <span id="statut-${idx}" class="${classBadgeStatut(statut)}">
                ${iconStatut(statut)} ${statut}
            </span>
        </td>
    `;
}

function calculateAverage(n1, n2, np) {
    let sum = 0, coef = 0;
    if (n1 !== null && !isNaN(n1)) { sum += n1 * 1; coef += 1; }
    if (n2 !== null && !isNaN(n2)) { sum += n2 * 2; coef += 2; }
    if (np !== null && !isNaN(np)) { sum += np * 1; coef += 1; }
    return coef > 0 ? sum / coef : null;
}

function onNoteChange(input, idx) {
    updateAverage(idx);
    markModified(idx);
}

function validateNoteInput(input, idx) {
    const val = input.value.trim();
    if (val === '' || val.toLowerCase() === 'ab') {
        input.style.borderColor = '#ced4da';
        return;
    }
    const num = parseFloat(val.replace(',', '.'));
    if (isNaN(num) || num < 0 || num > 20) {
        input.style.borderColor = '#dc3545';
        input.style.background = '#fff5f5';
        showToast(`Note invalide : "${val}". Entrez 0-20 ou "Ab".`, 'error');
    } else {
        input.style.borderColor = '#28a745';
        input.style.background = '#fff';
        input.value = num.toFixed(1);
        updateAverage(idx);
    }
}

function updateAverage(idx) {
    const tr = document.querySelector(`tr[data-idx="${idx}"]`);
    if (!tr) return;

    const n1 = getNoteFromInput(tr, 'note1');
    const n2 = getNoteFromInput(tr, 'note2');
    const np = getNoteFromInput(tr, 'noteprojet');
    const moy = calculateAverage(n1, n2, np);

    const span = document.getElementById(`moy-${idx}`);
    if (span) {
        span.textContent = moy !== null ? moy.toFixed(2) : '--';
        span.setAttribute('style', badgeMoyenneStyle(moy));
    }

    if (APP.eleves[idx]) {
        APP.eleves[idx].Note1 = n1;
        APP.eleves[idx].Note2 = n2;
        APP.eleves[idx].NoteProjet = np;
    }
}

function getNoteFromInput(tr, col) {
    const inp = tr.querySelector(`input[data-col="${col}"]`);
    if (!inp) return null;
    const v = inp.value.trim();
    if (v === '' || v.toLowerCase() === 'ab') return null;
    const n = parseFloat(v.replace(',', '.'));
    return isNaN(n) ? null : n;
}

function markModified(idx) {
    APP.modifiedRows.add(idx);
    const span = document.getElementById(`statut-${idx}`);
    if (span && !span.textContent.includes('Enregistré') && !span.textContent.includes('Validé')) {
        span.className = 'badge badge-warning';
        span.innerHTML = `${iconStatut('En cours')} En cours`;
        if (APP.eleves[idx]) APP.eleves[idx].Statut = 'En cours';
    }
}

async function sauvegarder() {
    if (APP.validees) {
        showToast('Notes déjà validées définitivement.', 'warning');
        return;
    }
    if (APP.modifiedRows.size === 0) {
        showToast('Aucune modification à sauvegarder.', 'info');
        return;
    }

    showSpinner(true);
    let errors = 0;
    let saved = 0;

    try {
        for (const idx of APP.modifiedRows) {
            const eleve = APP.eleves[idx];
            if (!eleve) continue;

            const tr = document.querySelector(`tr[data-idx="${idx}"]`);
            const appreciation = tr?.querySelector('.apprec-input')?.value || '';

            const result = await callApi(API_BULLETINS.sauvegarderNotes, 'POST', {
                ELEVE_MATRICULE: eleve.EleveId,
                MATIERE_ID: APP.matiereId,
                PERIODE: APP.periodeId,
                NOTE1: eleve.Note1,
                NOTE2: eleve.Note2,
                NOTE_PROJET: eleve.NoteProjet,
                APPRECIATION: appreciation
            });

            if (result && result.success) saved++;
            else errors++;
        }

        if (errors === 0) {
            showToast(`${saved} note(s) sauvegardée(s) avec succès !`, 'success');
            APP.modifiedRows.clear();
            await afficherListe();
        } else {
            showToast(`${errors} erreur(s) sur ${saved + errors} note(s).`, 'error');
        }
    } catch (error) {
        console.error('[SAISIE] ❌ Erreur sauvegarde:', error);
        showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
        showSpinner(false);
    }
}

async function validerDefinitivement() {
    if (APP.validees) {
        showToast('Déjà validé définitivement.', 'warning');
        return;
    }

    ouvrirModal(
        'Validation Définitive',
        'Cette action est irréversible. Toutes les notes seront verrouillées. Confirmer ?',
        async () => {
            showSpinner(true);
            try {
                const result = await callApi(API_BULLETINS.validerDefinitivement, 'POST', {
                    classeId: APP.classeId,
                    matiereId: APP.matiereId,
                    periodeId: APP.periodeId
                });

                if (!result || !result.success) {
                    showToast(result?.message || 'Erreur lors de la validation', 'error');
                    return;
                }

                APP.validees = true;
                APP.modifiedRows.clear();

                document.querySelectorAll('.note-input, .apprec-input').forEach(el => {
                    el.setAttribute('readonly', true);
                    el.style.background = '#f4f6fb';
                    el.style.cursor = 'not-allowed';
                });

                document.querySelectorAll('[id^="statut-"]').forEach(span => {
                    span.className = 'badge badge-success';
                    span.innerHTML = `${iconStatut('Validé')} Validé`;
                });

                showToast(`${result.updated || 0} note(s) validée(s) définitivement.`, 'success');
            } catch (error) {
                console.error('[SAISIE] ❌ Erreur validation:', error);
                showToast('Erreur lors de la validation', 'error');
            } finally {
                showSpinner(false);
            }
        }
    );
}

// ============================================================
// SECTION 2: GESTION DES BULLETINS
// ============================================================

async function loadBulletins() {
    console.log('[ADMIN] 📊 loadBulletins() appelé');

    if (APP.isSaisieActive) {
        console.log('[ADMIN] ⏳ Mode saisie actif - Chargement des selects uniquement');
        await loadClassesAndMatieresOnly();
        return;
    }

    if (APP.isLoading) {
        console.log('[ADMIN] ⏳ Déjà en chargement, ignoré');
        return;
    }

    APP.isLoading = true;
    showSpinner(true);

    try {
        console.log('[ADMIN] 🌐 Appel API...');
        const [bulletinsRes, elevesRes, classesRes, matieresRes] = await Promise.all([
            callApi(API_BULLETINS.getBulletins),
            callApi(API_BULLETINS.getEleves),
            callApi(API_BULLETINS.getClasses),
            callApi(API_BULLETINS.getMatieres)
        ]);

        if (bulletinsRes && bulletinsRes.success) {
            APP.bulletinsData = bulletinsRes.data || [];
            console.log('[ADMIN] 📋 Bulletins chargés:', APP.bulletinsData.length);
        } else {
            APP.bulletinsData = [];
        }

        if (elevesRes && elevesRes.success) {
            APP.elevesList = elevesRes.Eleves || elevesRes.data || [];
            populateStudentSelect();
        } else {
            APP.elevesList = [];
        }

        if (classesRes && classesRes.success) {
            APP.classesList = classesRes.Classes || classesRes.data || [];
        } else {
            APP.classesList = [];
        }

        if (matieresRes && matieresRes.success) {
            APP.matieresList = matieresRes.matieres || matieresRes.data || [];
        } else {
            APP.matieresList = [];
        }

        populateClassSelect();
        populateMatiereSelect();

        APP.filteredBulletins = [...APP.bulletinsData];
        applySort();
        renderBulletinsTable();

    } catch (err) {
        console.error('[ADMIN] ❌ Erreur loadBulletins:', err);
        showToast('Impossible de charger les données.', 'error');
    } finally {
        showSpinner(false);
        APP.isLoading = false;
    }
}

async function loadClassesAndMatieresOnly() {
    console.log('[ADMIN] 📋 Chargement des selects uniquement');

    try {
        const [classesRes, matieresRes] = await Promise.all([
            callApi(API_BULLETINS.getClasses),
            callApi(API_BULLETINS.getMatieres)
        ]);

        if (classesRes && classesRes.success) {
            APP.classesList = classesRes.Classes || classesRes.data || [];
        } else {
            APP.classesList = [];
        }

        if (matieresRes && matieresRes.success) {
            APP.matieresList = matieresRes.matieres || matieresRes.data || [];
        } else {
            APP.matieresList = [];
        }

        populateClassSelect();
        populateMatiereSelect();

    } catch (err) {
        console.error('[ADMIN] ❌ Erreur chargement selects:', err);
    }
}

function applySort() {
    APP.filteredBulletins.sort((a, b) => {
        let valA = a[APP.currentSortCol] || '';
        let valB = b[APP.currentSortCol] || '';

        if (typeof valA === 'number' && typeof valB === 'number') {
            return APP.currentSortDir === 'ASC' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return APP.currentSortDir === 'ASC' ? -1 : 1;
        if (strA > strB) return APP.currentSortDir === 'ASC' ? 1 : -1;
        return 0;
    });
}

function sortBy(column) {
    if (APP.currentSortCol === column) {
        APP.currentSortDir = APP.currentSortDir === 'ASC' ? 'DESC' : 'ASC';
    } else {
        APP.currentSortCol = column;
        APP.currentSortDir = 'ASC';
    }
    applySort();
    renderBulletinsTable();
}

function renderBulletinsTable() {
    const tbody = document.getElementById('bulletinsTableBody');
    if (!tbody) return;

    if (!APP.filteredBulletins || APP.filteredBulletins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:50px;">Aucun bulletin trouvé</td></tr>';
        updatePaginationInfo();
        return;
    }

    const start = (APP.currentPage - 1) * APP.rowsPerPage;
    const pageData = APP.filteredBulletins.slice(start, start + APP.rowsPerPage);

    tbody.innerHTML = '';
    for (const b of pageData) {
        const noteClass = getNoteClass(b.NOTE);
        const row = tbody.insertRow();
        row.innerHTML = `
            <td class="text-center"><span class="badge badge-secondary">${escapeHtml(b.MATRICULE || '-')}</span></td>
            <td class="text-center"><strong>${escapeHtml(b.ELEVE_NOM || '-')}</strong></td>
            <td class="text-center"><span class="badge badge-info">${escapeHtml(b.CLASSE_NOM || '-')}</span></td>
            <td class="text-center"><span class="badge badge-primary">${escapeHtml(b.MATIERE_NOM || '-')}</span></td>
            <td class="text-center">${escapeHtml(b.ENSEIGNANT_NOM || '-')}</td>
            <td class="text-center"><span class="${noteClass}">${formatNote(b.NOTE)}</span></td>
            <td class="text-center">${b.COEFFICIENT || 1}</td>
            <td class="text-center"><span class="badge badge-warning">${escapeHtml(b.PERIODE || '-')}</span></td>
            <td class="text-center">
                <button class="btn btn-sm btn-primary" onclick="editBulletin('${escapeHtml(b.ID)}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteBulletin('${escapeHtml(b.ID)}', '${escapeHtml(b.ELEVE_NOM)}', '${escapeHtml(b.MATIERE_NOM)}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
    }

    updatePaginationInfo();
}

function updatePaginationInfo() {
    const total = APP.filteredBulletins.length;
    const infoSpan = document.getElementById('bulletinPaginationInfo');
    if (infoSpan) {
        infoSpan.textContent = total === 0 ? 'Aucun enregistrement' : `${total} bulletin(s)`;
    }
}

function openAddBulletinModal() {
    APP.currentMode = 'add';
    APP.currentBulletinId = null;

    const studentSelect = document.getElementById('bulletinStudent');
    const subjectSelect = document.getElementById('bulletinSubject');
    const periodSelect = document.getElementById('bulletinPeriod');

    if (studentSelect) studentSelect.value = '';
    if (subjectSelect) subjectSelect.value = '';
    if (periodSelect) periodSelect.value = 'T1';

    openModal('addBulletinModal');
}

async function saveNewBulletin() {
    const matricule = document.getElementById('bulletinStudent')?.value;
    const matiereId = document.getElementById('bulletinSubject')?.value;
    const periode = document.getElementById('bulletinPeriod')?.value;

    if (!matricule) { showToast('Sélectionnez un élève', 'warning'); return; }
    if (!matiereId) { showToast('Sélectionnez une matière', 'warning'); return; }
    if (!periode) { showToast('Sélectionnez une période', 'warning'); return; }

    showSpinner(true);

    try {
        const payload = {
            MATRICULE: matricule,
            MATIERE_ID: matiereId,
            NOTE1: null,
            NOTE2: null,
            NOTE_PROJET: null,
            APPRECIATION: '',
            PERIODE: periode
        };

        const result = await callApi(API_BULLETINS.ajouter, 'POST', payload);

        if (result && result.success) {
            closeAddBulletinModal();
            showToast('Bulletin ajouté avec succès', 'success');
            loadBulletins();
        } else {
            showToast(result?.message || 'Erreur lors de l\'ajout', 'error');
        }
    } catch (err) {
        console.error('saveNewBulletin error:', err);
        showToast('Erreur de connexion au serveur', 'error');
    } finally {
        showSpinner(false);
    }
}

async function editBulletin(id) {
    const bulletin = APP.bulletinsData.find(b => b.ID === id);
    if (!bulletin) { showToast('Bulletin non trouvé', 'error'); return; }

    const result = await Swal.fire({
        title: 'Modifier la note',
        html: `
            <div>
                <p><strong>Élève:</strong> ${escapeHtml(bulletin.ELEVE_NOM)}</p>
                <p><strong>Matière:</strong> ${escapeHtml(bulletin.MATIERE_NOM)}</p>
                <div class="form-group">
                    <label>Note (0-20)</label>
                    <input type="number" id="edit-note" class="form-control" step="0.5" min="0" max="20" value="${bulletin.NOTE}">
                </div>
            </div>
        `,
        confirmButtonText: 'Enregistrer',
        cancelButtonText: 'Annuler',
        showCancelButton: true,
        preConfirm: () => {
            const note = parseFloat(document.getElementById('edit-note').value);
            if (isNaN(note) || note < 0 || note > 20) {
                Swal.showValidationMessage('La note doit être entre 0 et 20');
                return false;
            }
            return { note: note };
        }
    });

    if (result.isConfirmed) {
        showSpinner(true);
        try {
            const res = await callApi(API_BULLETINS.modifier, 'POST', {
                ID: id,
                NOTE: result.value.note,
                COMMENTAIRE: ''
            });

            if (res && res.success) {
                showToast('Note modifiée avec succès', 'success');
                loadBulletins();
            } else {
                showToast(res?.message || 'Erreur lors de la modification', 'error');
            }
        } catch (err) {
            console.error('editBulletin:', err);
            showToast('Erreur réseau', 'error');
        } finally {
            showSpinner(false);
        }
    }
}

async function deleteBulletin(id, eleveNom, matiereNom) {
    const result = await Swal.fire({
        title: 'Supprimer ce bulletin ?',
        html: `<strong>${escapeHtml(eleveNom)}</strong> - <strong>${escapeHtml(matiereNom)}</strong>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    showSpinner(true);
    try {
        const res = await callApi(API_BULLETINS.supprimer, 'POST', { ID: id });

        if (res && res.success) {
            APP.bulletinsData = APP.bulletinsData.filter(b => b.ID !== id);
            APP.filteredBulletins = APP.filteredBulletins.filter(b => b.ID !== id);
            renderBulletinsTable();
            showToast('Bulletin supprimé', 'success');
        } else {
            showToast(res?.message || 'Erreur lors de la suppression', 'error');
        }
    } catch (err) {
        console.error('deleteBulletin:', err);
        showToast('Erreur réseau', 'error');
    } finally {
        showSpinner(false);
    }
}

function exporter() {
    if (!APP.eleves.length) return;

    const nomClasse = getSelectText('ddlClasse');
    const nomMatiere = getSelectText('ddlMatiere');
    const nomPeriode = getSelectText('ddlPeriode');

    const csvRows = [`Classe;${nomClasse}`, `Matière;${nomMatiere}`, `Période;${nomPeriode}`, ''];
    csvRows.push('ID/Nom;Note1;Note2;Projet;Moyenne;Appréciation;Statut');

    for (let idx = 0; idx < APP.eleves.length; idx++) {
        const e = APP.eleves[idx];
        const tr = document.querySelector(`tr[data-idx="${idx}"]`);
        const app = tr ? tr.querySelector('.apprec-input')?.value || '' : '';
        const moy = calculateAverage(e.Note1, e.Note2, e.NoteProjet);
        csvRows.push([
            `${e.Numero || idx + 1} - ${e.Nom || ''}`,
            e.Note1 ?? 'Ab', e.Note2 ?? 'Ab', e.NoteProjet ?? 'Ab',
            moy !== null ? moy.toFixed(2) : '--',
            `"${app.replace(/"/g, '""')}"`,
            e.Statut || ''
        ].join(';'));
    }

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bulletin_${nomClasse}_${nomMatiere}_${nomPeriode}.csv`.replace(/\s/g, '_');
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================
// INITIALISATION
// ============================================================

function init() {
    console.log('[INIT] 🚀 Démarrage de bulletins.js');

    lireContexteServeur();
    afficherUsernameNavbar();
    loadBulletins();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('addBulletinModal');
            closeModal('bulletinModal');
        }
    });

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

    // Attacher l'événement au bouton par ID - CORRECTION ICI
    const btnAfficher = document.getElementById('btnAfficherListe');
    if (btnAfficher) {
        // Supprimer l'ancien onclick s'il existe
        btnAfficher.removeAttribute('onclick');
        btnAfficher.addEventListener('click', afficherListe);
        console.log('[INIT] ✅ Événement du bouton Afficher attaché par ID');
    } else {
        console.log('[INIT] ⚠️ Bouton btnAfficherListe non trouvé, recherche alternative...');
        // Recherche alternative par texte
        const buttons = document.querySelectorAll('button');
        for (let btn of buttons) {
            if (btn.textContent.includes('Afficher la liste')) {
                btn.id = 'btnAfficherListe';
                btn.addEventListener('click', afficherListe);
                console.log('[INIT] ✅ Bouton trouvé et événement attaché');
                break;
            }
        }
    }

    console.log('[INIT] ✅ Initialisation terminée');
}

function loadAdminView() {
    APP.isSaisieActive = false;
    loadBulletins();
}

// ============================================================
// EXPOSITION GLOBALE
// ============================================================

window.loadAdminView = loadAdminView;
window.onClasseChange = onClasseChange;
window.afficherListe = afficherListe;
window.sauvegarder = sauvegarder;
window.validerDefinitivement = validerDefinitivement;
window.exporter = exporter;
window.openAddBulletinModal = openAddBulletinModal;
window.closeAddBulletinModal = closeAddBulletinModal;
window.saveNewBulletin = saveNewBulletin;
window.editBulletin = editBulletin;
window.deleteBulletin = deleteBulletin;
window.sortBy = sortBy;
window.closeModal = closeModal;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}