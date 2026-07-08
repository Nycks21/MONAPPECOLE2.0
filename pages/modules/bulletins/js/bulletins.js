/**
 * bulletins.js - Version complète avec indicateur de chargement, animations et gestion d'erreurs
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
let hasUnsavedChanges = false;
let isLoading = false;
let pendingSave = false;
let toastTimeout = null;

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) { console.log(`[${type}] ${message}`); return; }

    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
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
    toast.style.cssText = `
        background:${colors[type].split(';')[0]}; 
        ${colors[type].split(';')[1]}; 
        padding:12px 18px; 
        border-radius:8px; 
        font-size:13px; 
        font-weight:500; 
        min-width:280px; 
        max-width:500px;
        box-shadow:0 4px 12px rgba(0,0,0,.15); 
        opacity:0; 
        transition:opacity .3s ease, transform .3s ease; 
        margin-bottom:10px; 
        cursor:pointer; 
        z-index:9999;
        transform: translateY(-10px);
    `;
    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <i class="fas ${icons[type]}" style="font-size:18px;"></i>
            <span style="flex:1;">${message}</span>
            <i class="fas fa-times" style="cursor:pointer; opacity:0.6;"></i>
        </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    const close = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
    };

    toast.querySelector('.fa-times')?.addEventListener('click', close);
    toast.addEventListener('click', close);
    toastTimeout = setTimeout(close, duration);
}

// ============================================================
// INDICATEUR DE CHARGEMENT GLOBAL
// ============================================================

function showLoading(message = 'Chargement en cours...') {
    const overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        // Ajouter un message si besoin
        const msgEl = overlay.querySelector('.loading-message');
        if (msgEl) {
            msgEl.textContent = message;
        } else {
            const msg = document.createElement('div');
            msg.className = 'loading-message';
            msg.textContent = message;
            msg.style.cssText = 'color:white; margin-top:15px; font-size:14px; font-weight:500;';
            overlay.appendChild(msg);
        }
    }
}

function hideLoading() {
    const overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================================================
// CHARGEMENT DES MATIÈRES
// ============================================================

async function chargerMatieres() {
    try {
        showLoading('Chargement des matières...');
        const response = await fetch('../../parametres/matieres/handlers/GetMatieres.ashx');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const select = document.getElementById('ddlMatiere');
        if (!select) return;

        select.innerHTML = '<option value="">-- Sélectionner une matière --</option>';
        allMatieres = data.matieres || data.data || [];

        let matieresToShow = [];
        const isSuperAdmin = currentUser.role === '0';

        if (isSuperAdmin) {
            matieresToShow = allMatieres;
        } else if (currentUser.matieresAutorisees.length > 0) {
            const ids = currentUser.matieresAutorisees.map(m => String(m.ID || m.id || m));
            matieresToShow = allMatieres.filter(m => ids.includes(String(m.ID || m.id)));
        }

        if (matieresToShow.length === 0) {
            select.innerHTML = '<option value="">-- Aucune matière disponible --</option>';
            hideLoading();
            return;
        }

        matieresToShow.sort((a, b) => (a.NOM || a.nom || '').localeCompare(b.NOM || b.nom || ''));

        for (const m of matieresToShow) {
            const opt = document.createElement('option');
            opt.value = m.ID || m.id;
            let text = m.NOM || m.nom || 'Sans nom';
            if (m.CLASSE_NOM) text += ' (' + m.CLASSE_NOM + ')';
            opt.textContent = text;
            opt.setAttribute('data-classe-id', m.CLASSE_ID || m.classe_id || m.CLASSEID || m.classeId);
            opt.setAttribute('data-classe-nom', m.CLASSE_NOM || m.classe_nom || '');
            select.appendChild(opt);
        }

        if (matieresToShow.length === 1) {
            select.value = matieresToShow[0].ID || matieresToShow[0].id;
            onMatiereChange();
        }
        hideLoading();
    } catch (e) {
        console.error('Erreur matières:', e);
        hideLoading();
        showToast('Erreur lors du chargement des matières: ' + e.message, 'error');
    }
}

// ============================================================
// CALCULS
// ============================================================

function calculerTotalNote(note1, note2, noteProjet) {
    const { coeff1, coeff2, coeffProjet } = currentCoefficients;
    let total = 0;

    const n1 = parseFloat(note1);
    const n2 = parseFloat(note2);
    const np = parseFloat(noteProjet);

    if (!isNaN(n1) && n1 >= 0 && n1 <= 20) total += n1 * coeff1;
    if (!isNaN(n2) && n2 >= 0 && n2 <= 20) total += n2 * coeff2;
    if (!isNaN(np) && np >= 0 && np <= 20) total += np * coeffProjet;

    return total;
}

function calculerMoyenne(note1, note2, noteProjet) {
    const total = calculerTotalNote(note1, note2, noteProjet);
    const coeffTotal = currentCoefficients.coeff1 + currentCoefficients.coeff2 + currentCoefficients.coeffProjet;

    if (total > 0 && coeffTotal > 0) {
        return (total / coeffTotal).toFixed(2);
    }
    return '-';
}

// ============================================================
// MODALE DE CONFIRMATION - AVEC ANIMATIONS
// ============================================================

function showConfirmDialog(title, message, confirmText = 'Confirmer', cancelText = 'Annuler', isDanger = true) {
    return new Promise((resolve) => {
        let resolved = false;

        // Créer l'overlay avec animation
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000000;
            opacity: 0;
            transition: opacity 0.4s ease;
            backdrop-filter: blur(6px);
        `;

        // Créer la boîte modale avec animation
        const box = document.createElement('div');
        box.style.cssText = `
            background: #ffffff;
            border-radius: 16px;
            max-width: 480px;
            width: 92%;
            padding: 0;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
            transform: scale(0.8) translateY(30px);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
            opacity: 0;
            overflow: hidden;
            max-height: 90vh;
        `;

        box.innerHTML = `
            <div style="padding: 22px 28px 14px 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f0f0f0;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e3a2f;">${escapeHtml(title)}</h3>
                <button id="modalCloseBtn" style="background: none; border: none; font-size: 30px; cursor: pointer; color: #adb5bd; padding: 0 4px; line-height: 1; transition: color 0.3s, transform 0.3s;">&times;</button>
            </div>
            <div style="padding: 24px 28px 16px 28px;">
                <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>
            <div style="padding: 16px 28px 24px 28px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 12px;">
                <button id="modalCancelBtn" style="padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; background: #f1f3f5; color: #495057; min-width: 100px; transition: all 0.3s ease;">${escapeHtml(cancelText)}</button>
                <button id="modalOkBtn" style="padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; background: ${isDanger ? '#dc3545' : '#28a745'}; color: white; min-width: 100px; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">${escapeHtml(confirmText)}</button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Empêcher le scroll
        document.body.style.overflow = 'hidden';

        // Animation d'entrée
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            box.style.opacity = '1';
            box.style.transform = 'scale(1) translateY(0)';
        });

        // Fonction de fermeture avec animation
        const close = (result) => {
            if (resolved) return;
            resolved = true;
            overlay.style.opacity = '0';
            box.style.opacity = '0';
            box.style.transform = 'scale(0.8) translateY(30px)';
            document.body.style.overflow = '';
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
                resolve(result);
            }, 400);
        };

        // Écouteurs d'événements
        const okBtn = box.querySelector('#modalOkBtn');
        const cancelBtn = box.querySelector('#modalCancelBtn');
        const closeBtn = box.querySelector('#modalCloseBtn');

        // Hover effects
        okBtn.addEventListener('mouseenter', () => {
            okBtn.style.transform = 'translateY(-2px)';
            okBtn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
        });
        okBtn.addEventListener('mouseleave', () => {
            okBtn.style.transform = 'translateY(0)';
            okBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });

        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.transform = 'translateY(-2px)';
            cancelBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.transform = 'translateY(0)';
            cancelBtn.style.boxShadow = 'none';
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = '#212529';
            closeBtn.style.transform = 'rotate(90deg)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = '#adb5bd';
            closeBtn.style.transform = 'rotate(0)';
        });

        okBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            close(true);
        });

        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            close(false);
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            close(false);
        });

        // Délai avant d'activer la fermeture par l'overlay
        setTimeout(() => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    close(false);
                }
            });
        }, 300);

        // Fermeture avec Echap
        document.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') {
                close(false);
                document.removeEventListener('keydown', escListener);
            }
        });
    });
}

// ============================================================
// GESTION DES ERREURS RÉSEAU
// ============================================================

async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            let errorMessage = `Erreur HTTP ${response.status}`;
            
            // Messages d'erreur spécifiques
            switch (response.status) {
                case 400:
                    errorMessage = 'Requête invalide. Vérifiez les données envoyées.';
                    break;
                case 401:
                    errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                    break;
                case 403:
                    errorMessage = 'Vous n\'avez pas les droits nécessaires.';
                    break;
                case 404:
                    errorMessage = 'Service introuvable. Contactez l\'administrateur.';
                    break;
                case 500:
                    errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                    break;
                case 503:
                    errorMessage = 'Service indisponible. Veuillez réessayer plus tard.';
                    break;
                default:
                    errorMessage = `Erreur serveur (${response.status}). Veuillez réessayer.`;
            }
            
            // Essayer de récupérer le message d'erreur du serveur
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // Si le serveur renvoie du HTML, utiliser le message par défaut
                const text = await response.text();
                if (text.toLowerCase().includes('<!doctype') || text.toLowerCase().includes('<html')) {
                    errorMessage = 'Le service a renvoyé une page d\'erreur. Contactez l\'administrateur.';
                }
            }
            
            throw new Error(errorMessage);
        }
        
        return await response.json();
    } catch (error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion réseau.');
        }
        if (error.message.includes('timeout') || error.message.includes('aborted')) {
            throw new Error('La requête a expiré. Veuillez réessayer.');
        }
        throw error;
    }
}

// ============================================================
// ON MATIERE CHANGE
// ============================================================

function onMatiereChange() {
    const select = document.getElementById('ddlMatiere');
    const opt = select.options[select.selectedIndex];
    const classeId = opt?.getAttribute('data-classe-id');
    const classeNom = opt?.getAttribute('data-classe-nom');
    currentMatiereId = select.value;

    const classeSelect = document.getElementById('ddlClasse');
    if (classeSelect && classeId) {
        classeSelect.innerHTML = '';
        const o = document.createElement('option');
        o.value = classeId;
        o.textContent = classeNom || 'Classe';
        classeSelect.appendChild(o);
        classeSelect.disabled = true;
        currentClasseId = classeId;
    }

    document.getElementById('coeffGlobalPanel').style.display = 'none';
    resetButtons();
}

// ============================================================
// BOUTONS D'ACTION
// ============================================================

function createActionButtons() {
    let container = document.getElementById('actionButtons');
    if (container) return;

    container = document.createElement('div');
    container.id = 'actionButtons';
    container.className = 'action-buttons';
    container.style.display = 'none';

    const btnSave = document.createElement('button');
    btnSave.id = 'btnSauvegarder';
    btnSave.className = 'btn btn-primary btn-sm';
    btnSave.innerHTML = '<i class="fas fa-save"></i> Sauvegarder';
    btnSave.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.sauvegarder();
    });
    container.appendChild(btnSave);

    const btnValidate = document.createElement('button');
    btnValidate.id = 'btnValider';
    btnValidate.className = 'btn btn-success btn-sm';
    btnValidate.innerHTML = '<i class="fas fa-check-double"></i> Valider Définitivement';
    btnValidate.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.validerDefinitivement();
    });
    container.appendChild(btnValidate);

    const btnExport = document.createElement('button');
    btnExport.id = 'btnExporter';
    btnExport.className = 'btn btn-secondary btn-sm';
    btnExport.innerHTML = '<i class="fas fa-download"></i> Exporter';
    btnExport.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.exporter();
    });
    container.appendChild(btnExport);

    const wrapper = document.getElementById('tableWrapper');
    if (wrapper?.parentNode) {
        wrapper.parentNode.insertBefore(container, wrapper.nextSibling);
    } else {
        document.getElementById('section-bulletins')?.appendChild(container);
    }
}

function updateButtonsState() {
    const allValidated = currentEleves.length > 0 && currentEleves.every(e => e.Statut === 'Validé');
    const btnSave = document.getElementById('btnSauvegarder');
    const btnValidate = document.getElementById('btnValider');

    if (btnSave) {
        btnSave.disabled = allValidated && currentEleves.length > 0;
        btnSave.style.opacity = (allValidated && currentEleves.length > 0) ? '0.5' : '1';
        btnSave.style.cursor = (allValidated && currentEleves.length > 0) ? 'not-allowed' : 'pointer';
    }

    if (btnValidate) {
        btnValidate.disabled = allValidated && currentEleves.length > 0;
        btnValidate.style.opacity = (allValidated && currentEleves.length > 0) ? '0.5' : '1';
        btnValidate.style.cursor = (allValidated && currentEleves.length > 0) ? 'not-allowed' : 'pointer';
    }
}

function resetButtons() {
    ['btnSauvegarder', 'btnValider'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

function showActionButtons(show) {
    const container = document.getElementById('actionButtons');
    if (container) {
        container.style.display = show ? 'flex' : 'none';
        container.classList.toggle('visible', show);
    }
}

// ============================================================
// AFFICHAGE DE LA LISTE
// ============================================================

async function afficherListe() {
    if (isLoading) return;

    const matiereId = document.getElementById('ddlMatiere').value;
    const classeId = document.getElementById('ddlClasse').value;
    const periode = document.getElementById('ddlPeriode').value;

    if (!matiereId || !classeId || !periode) {
        showToast('Veuillez sélectionner une matière, une classe et une période', 'warning');
        return;
    }

    if (hasUnsavedChanges) {
        const confirmed = await showConfirmDialog(
            'Modifications non sauvegardées',
            'Vous avez des modifications non sauvegardées.\nSi vous continuez, elles seront perdues.\n\nVoulez-vous continuer ?',
            'Continuer', 'Annuler', false
        );
        if (!confirmed) return;
    }

    currentMatiereId = matiereId;
    currentClasseId = classeId;
    currentPeriode = periode;
    setUnsavedChanges(false);

    showLoading('Chargement des bulletins...');
    isLoading = true;

    try {
        const data = await fetchWithErrorHandling('handlers/GetBulletins.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classeId, matiereId, periodeId: periode })
        });

        if (!data.success) {
            throw new Error(data.message || 'Erreur de chargement');
        }

        currentEleves = data.eleves || [];

        if (data.coefficients) {
            currentCoefficients = {
                coeff1: parseFloat(data.coefficients.coeff1) || 1,
                coeff2: parseFloat(data.coefficients.coeff2) || 2,
                coeffProjet: parseFloat(data.coefficients.coeffProjet) || 1
            };

            ['globalCoeff1', 'globalCoeff2', 'globalCoeffProjet'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.value = Object.values(currentCoefficients)[i];
            });
        }

        if (currentEleves.length === 0) {
            showToast('Aucun élève trouvé', 'warning');
            resetDisplay();
            hideLoading();
            return;
        }

        const matiere = document.getElementById('ddlMatiere');
        const nomMatiere = matiere?.options[matiere.selectedIndex]?.textContent || '';
        const nomPeriode = document.getElementById('ddlPeriode')?.options[document.getElementById('ddlPeriode').selectedIndex]?.text || '';

        const info = document.getElementById('tableInfoLabel');
        if (info) info.innerHTML = `<i class="fas fa-graduation-cap"></i> ${nomMatiere} — ${nomPeriode}`;

        const badge = document.getElementById('countBadge');
        if (badge) badge.textContent = currentEleves.length + ' élève(s)';

        renderTable();
        document.getElementById('coeffGlobalPanel').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('tableWrapper').style.display = 'block';
        showActionButtons(true);

        const msg = document.getElementById('coeffMessage');
        if (msg) {
            msg.innerHTML = `Coefficients actuels : Note1 (×${currentCoefficients.coeff1}) | Note2 (×${currentCoefficients.coeff2}) | Examen (×${currentCoefficients.coeffProjet})`;
        }

        updateButtonsState();
        hideLoading();

    } catch (e) {
        console.error('Erreur:', e);
        hideLoading();
        showToast('Erreur: ' + e.message, 'error');
        resetDisplay();
    } finally {
        isLoading = false;
    }
}

function resetDisplay() {
    currentEleves = [];
    document.getElementById('coeffGlobalPanel').style.display = 'none';
    document.getElementById('tableWrapper').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('countBadge').textContent = '0 élève(s)';
    showActionButtons(false);
    resetButtons();
}

// ============================================================
// RENDU DU TABLEAU
// ============================================================

function renderTable() {
    const tbody = document.getElementById('notesTableBody');
    if (!tbody) return;

    const fragment = document.createDocumentFragment();

    currentEleves.forEach((eleve, idx) => {
        const isReadonly = eleve.Statut === 'Validé';
        const totalNote = calculerTotalNote(eleve.Note1, eleve.Note2, eleve.NoteProjet);
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
        let statutText = eleve.Statut || 'Non saisi';

        if (eleve.Statut === 'Validé') {
            statutClass = 'statut-valide';
            statutIcon = '✓';
            statutText = 'Validé';
        } else if (eleve.Statut === 'En cours') {
            statutClass = 'statut-en-cours';
            statutIcon = '⏳';
            statutText = 'En cours';
        } else if (eleve.Statut === 'Enregistré') {
            statutClass = 'statut-enregistre';
            statutIcon = '📝';
            statutText = 'Enregistré';
        }

        const n1 = (eleve.Note1 != null) ? parseFloat(eleve.Note1).toFixed(2) : '';
        const n2 = (eleve.Note2 != null) ? parseFloat(eleve.Note2).toFixed(2) : '';
        const np = (eleve.NoteProjet != null) ? parseFloat(eleve.NoteProjet).toFixed(2) : '';
        const total = totalNote.toFixed(2);

        const row = document.createElement('tr');
        row.className = idx % 2 === 0 ? 'table-row-even' : 'table-row-odd';
        row.dataset.idx = idx;
        row.dataset.eleveId = eleve.EleveId;

        row.innerHTML = `
            <td class="cell-eleve">
                <div class="eleve-info">
                    <span class="eleve-numero">#${idx + 1}</span>
                    <strong class="eleve-nom">${escapeHtml(eleve.Nom || '')}</strong>
                </div>
            </td>
            <td class="cell-note">
                <input type="text" class="note-input note-input-modern" data-field="note1" value="${n1}" ${isReadonly ? 'readonly' : ''} placeholder="20.00" autocomplete="off" data-original="${n1}">
                <div class="coeff-display">×${currentCoefficients.coeff1}</div>
            </td>
            <td class="cell-note">
                <input type="text" class="note-input note-input-modern" data-field="note2" value="${n2}" ${isReadonly ? 'readonly' : ''} placeholder="20.00" autocomplete="off" data-original="${n2}">
                <div class="coeff-display">×${currentCoefficients.coeff2}</div>
            </td>
            <td class="cell-note">
                <input type="text" class="note-input note-input-modern" data-field="projet" value="${np}" ${isReadonly ? 'readonly' : ''} placeholder="20.00" autocomplete="off" data-original="${np}">
                <div class="coeff-display">×${currentCoefficients.coeffProjet}</div>
            </td>
            <td class="cell-totalnote">
                <span class="totalnote-value" data-total="${total}">${total}</span>
            </td>
            <td class="cell-moyenne">
                <div class="moyenne-circle ${moyenneClass}">
                    <span class="moyenne-value">${moyenne}</span>
                </div>
            </td>
            <td class="cell-appreciation">
                <textarea class="appreciation-input" rows="2" ${isReadonly ? 'readonly' : ''} placeholder="Appréciation..." data-original="${escapeHtml(eleve.Appreciation || '')}">${escapeHtml(eleve.Appreciation || '')}</textarea>
            </td>
            <td class="cell-statut">
                <span class="statut-badge ${statutClass}">
                    <i class="statut-icon">${statutIcon}</i> ${statutText}
                </span>
            </td>
        `;

        fragment.appendChild(row);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
    attachEventListeners();
}

// ============================================================
// CONTEXTE UTILISATEUR
// ============================================================

function getUserContext() {
    currentUser.role = document.getElementById('hfUserRole')?.value || '';
    currentUser.userName = document.getElementById('hfUserName')?.value || '';
    currentUser.professeurId = document.getElementById('hfProfesseurId')?.value || '';

    const classesStr = document.getElementById('hfClassesAutorisees')?.value || '[]';
    const matieresStr = document.getElementById('hfMatieresAutorisees')?.value || '[]';

    try {
        currentUser.classesAutorisees = JSON.parse(classesStr);
        currentUser.matieresAutorisees = JSON.parse(matieresStr);
    } catch (e) {
        currentUser.classesAutorisees = [];
        currentUser.matieresAutorisees = [];
    }
}

// ============================================================
// GESTION DES ÉVÉNEMENTS
// ============================================================

function attachEventListeners() {
    const tbody = document.getElementById('notesTableBody');
    if (!tbody) return;

    tbody.removeEventListener('input', handleTableInput);
    tbody.removeEventListener('blur', handleTableBlur);
    tbody.removeEventListener('keydown', handleTableKeydown);

    tbody.addEventListener('input', handleTableInput);
    tbody.addEventListener('blur', handleTableBlur, true);
    tbody.addEventListener('keydown', handleTableKeydown);
}

function handleTableInput(e) {
    const target = e.target;
    if (target.classList.contains('note-input-modern')) {
        handleNoteInput(e);
    } else if (target.classList.contains('appreciation-input')) {
        handleAppreciationInput(e);
    }
}

function handleTableBlur(e) {
    const target = e.target;
    if (target.classList.contains('note-input-modern')) {
        handleNoteBlur(e);
    }
}

function handleTableKeydown(e) {
    const target = e.target;
    if (target.classList.contains('note-input-modern')) {
        handleNoteKeydown(e);
    }
}

// ============================================================
// GESTION DES NOTES
// ============================================================

function validateAndFormatNote(input) {
    const value = input.value.trim().replace(',', '.');
    const original = input.dataset.original || '';

    if (value === '') return null;

    const num = parseFloat(value);

    if (isNaN(num)) {
        showToast('Veuillez entrer un nombre valide', 'warning');
        input.value = original;
        return null;
    }

    if (num < 0 || num > 20) {
        showToast(num < 0 ? 'La note ne peut pas être négative' : '⚠️ Note maximum: 20.00', 'error');
        input.value = original;
        return null;
    }

    const formatted = num.toFixed(2);
    input.value = formatted;
    return num;
}

function handleNoteKeydown(e) {
    const input = e.target;
    if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        input.value = input.dataset.original || '';
        input.blur();
    }
}

function handleNoteBlur(e) {
    const input = e.target;
    const row = input.closest('tr');
    if (!row) return;

    const idx = parseInt(row.dataset.idx);
    const field = input.getAttribute('data-field');

    if (input.readonly || isNaN(idx) || !currentEleves[idx]) return;

    const value = validateAndFormatNote(input);

    if (value !== null) {
        if (field === 'note1') currentEleves[idx].Note1 = value;
        else if (field === 'note2') currentEleves[idx].Note2 = value;
        else if (field === 'projet') currentEleves[idx].NoteProjet = value;

        updateTotalsFromRow(row, idx);
        marquerModification(input);
    }
}

function handleNoteInput(e) {
    const input = e.target;
    const row = input.closest('tr');
    if (!row) return;

    const idx = parseInt(row.dataset.idx);
    const field = input.getAttribute('data-field');
    const value = input.value.trim().replace(',', '.');

    if (input.readonly) {
        showToast('Ce bulletin est validé définitivement.', 'warning');
        input.value = input.dataset.original || '';
        return;
    }

    if (!currentEleves[idx]) return;

    if (value === '' || value === '-') {
        if (field === 'note1') currentEleves[idx].Note1 = null;
        else if (field === 'note2') currentEleves[idx].Note2 = null;
        else if (field === 'projet') currentEleves[idx].NoteProjet = null;

        updateTotalsFromRow(row, idx);
        marquerModification(input);
        return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) {
        if (num < 0 || num > 20) {
            input.style.borderColor = (num > 20) ? '#dc3545' : '';
        } else {
            input.style.borderColor = '#28a745';
            if (field === 'note1') currentEleves[idx].Note1 = num;
            else if (field === 'note2') currentEleves[idx].Note2 = num;
            else if (field === 'projet') currentEleves[idx].NoteProjet = num;

            updateTotalsFromRow(row, idx);
            marquerModification(input);
        }
    }
}

function handleAppreciationInput(e) {
    const input = e.target;
    const row = input.closest('tr');
    if (!row) return;

    const idx = parseInt(row.dataset.idx);

    if (input.readonly) {
        showToast('Ce bulletin est validé définitivement.', 'warning');
        input.value = input.dataset.original || '';
        return;
    }

    if (currentEleves?.[idx]) {
        currentEleves[idx].Appreciation = input.value;
        marquerModification(input);
    }
}

// ============================================================
// MISE À JOUR
// ============================================================

function updateTotalsFromRow(row, idx) {
    if (!currentEleves[idx]) return;

    const eleve = currentEleves[idx];
    const total = calculerTotalNote(eleve.Note1, eleve.Note2, eleve.NoteProjet);
    const moyenne = calculerMoyenne(eleve.Note1, eleve.Note2, eleve.NoteProjet);

    const totalSpan = row.querySelector('.totalnote-value');
    if (totalSpan) {
        totalSpan.textContent = total.toFixed(2);
        totalSpan.dataset.total = total.toFixed(2);
    }

    const moyenneValue = row.querySelector('.moyenne-value');
    if (moyenneValue) moyenneValue.textContent = moyenne;

    const circle = row.querySelector('.moyenne-circle');
    if (circle) {
        circle.className = 'moyenne-circle';
        if (moyenne !== '-') {
            const m = parseFloat(moyenne);
            if (m >= 16) circle.classList.add('moyenne-excellent');
            else if (m >= 14) circle.classList.add('moyenne-tres-bien');
            else if (m >= 12) circle.classList.add('moyenne-bien');
            else if (m >= 10) circle.classList.add('moyenne-passable');
            else circle.classList.add('moyenne-insuffisant');
        }
    }
}

function marquerModification(element) {
    const row = element.closest('tr');
    if (!row) return;

    const statut = row.querySelector('.statut-badge');
    if (statut && !statut.textContent.includes('Validé')) {
        statut.className = 'statut-badge statut-en-cours';
        statut.innerHTML = '<i class="statut-icon">⏳</i> En cours';
    }

    setUnsavedChanges(true);
}

function setUnsavedChanges(value) {
    hasUnsavedChanges = value;
    const btn = document.getElementById('btnSauvegarder');
    if (btn) btn.classList.toggle('btn-unsaved-pulse', value);
}

// ============================================================
// COEFFICIENTS
// ============================================================

async function appliquerCoefficients() {
    const coeff1 = parseInt(document.getElementById('globalCoeff1').value);
    const coeff2 = parseInt(document.getElementById('globalCoeff2').value);
    const coeffProjet = parseInt(document.getElementById('globalCoeffProjet').value);

    if (isNaN(coeff1) || isNaN(coeff2) || isNaN(coeffProjet) || coeff1 < 1 || coeff2 < 1 || coeffProjet < 1 || coeff1 > 10 || coeff2 > 10 || coeffProjet > 10) {
        showToast('Coefficients invalides (1-10, entiers)', 'warning');
        return;
    }

    if (!currentMatiereId || !currentClasseId || !currentPeriode) {
        showToast('Veuillez charger une liste d\'élèves d\'abord', 'warning');
        return;
    }

    showLoading('Application des coefficients...');

    try {
        const data = await fetchWithErrorHandling('handlers/SaveCoeffs.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matiereId: currentMatiereId, classeId: currentClasseId, periode: currentPeriode, coeff1, coeff2, coeffProjet })
        });

        if (data.success) {
            currentCoefficients = { coeff1, coeff2, coeffProjet };

            document.querySelectorAll('.coeff-display').forEach((el, i) => {
                const idx = i % 3;
                el.textContent = idx === 0 ? `×${coeff1}` : idx === 1 ? `×${coeff2}` : `×${coeffProjet}`;
            });

            document.querySelectorAll('#notesTableBody tr').forEach((row, idx) => updateTotalsFromRow(row, idx));

            const msg = document.getElementById('coeffMessage');
            if (msg) msg.innerHTML = `Coefficients appliqués : Note1 (×${coeff1}) | Note2 (×${coeff2}) | Examen (×${coeffProjet})`;

            showToast('Coefficients appliqués avec succès', 'success');
        } else {
            throw new Error(data.message || 'Erreur lors de la sauvegarde');
        }
    } catch (e) {
        showToast('Erreur: ' + e.message, 'error');
    } finally {
        hideLoading();
    }
}

// ============================================================
// SAUVEGARDE
// ============================================================

window.sauvegarder = async function () {
    if (isLoading || pendingSave) {
        showToast(pendingSave ? 'Sauvegarde en cours...' : 'Opération en cours...', 'info');
        return;
    }

    const rows = document.querySelectorAll('#notesTableBody tr');
    if (rows.length === 0) {
        showToast('Aucune donnée à sauvegarder', 'warning');
        return;
    }

    if (currentEleves.every(e => e.Statut === 'Validé')) {
        showToast('Tous les bulletins sont déjà validés', 'info');
        return;
    }

    pendingSave = true;
    showLoading('Sauvegarde en cours...');

    try {
        const promises = [];

        for (const row of rows) {
            const eleveId = row.dataset.eleveId;
            const note1 = row.querySelector('[data-field="note1"]')?.value;
            const note2 = row.querySelector('[data-field="note2"]')?.value;
            const projet = row.querySelector('[data-field="projet"]')?.value;
            const appreciation = row.querySelector('.appreciation-input')?.value || '';

            const cleanNote1 = note1 && note1 !== '' ? parseFloat(note1.trim().replace(',', '.')) : null;
            const cleanNote2 = note2 && note2 !== '' ? parseFloat(note2.trim().replace(',', '.')) : null;
            const cleanProjet = projet && projet !== '' ? parseFloat(projet.trim().replace(',', '.')) : null;

            let totalNote = 0;
            if (cleanNote1 !== null) totalNote += cleanNote1 * (currentCoefficients.coeff1 || 1);
            if (cleanNote2 !== null) totalNote += cleanNote2 * (currentCoefficients.coeff2 || 2);
            if (cleanProjet !== null) totalNote += cleanProjet * (currentCoefficients.coeffProjet || 1);

            promises.push(
                fetch('handlers/ModifierBulletin.ashx', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ELEVE_MATRICULE: eleveId,
                        NOTE1: cleanNote1,
                        NOTE2: cleanNote2,
                        NOTE_PROJET: cleanProjet,
                        TOTAL_NOTE: totalNote,
                        APPRECIATION: appreciation,
                        MATIERE_ID: currentMatiereId,
                        PERIODE: currentPeriode
                    })
                })
                .then(r => r.json())
                .then(result => ({ matricule: eleveId, success: !!result.success, message: result.message }))
                .catch(err => ({ matricule: eleveId, success: false, message: err.message }))
            );
        }

        const results = await Promise.all(promises);
        const successCount = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success);

        if (failed.length === 0) {
            showToast(`${successCount} élève(s) sauvegardé(s) avec succès`, 'success');
            setUnsavedChanges(false);
            currentEleves.forEach(e => { if (e.Statut !== 'Validé') e.Statut = 'Enregistré'; });
            await afficherListe();
            updateButtonsState();
        } else {
            const errors = failed.map(f => f.message || 'Erreur inconnue').join(', ');
            showToast(`${successCount} sauvegardé(s), ${failed.length} échec(s): ${errors}`, 'warning');
        }
    } catch (e) {
        showToast('Erreur: ' + e.message, 'error');
    } finally {
        hideLoading();
        pendingSave = false;
    }
};

// ============================================================
// ✅ VALIDATION DÉFINITIVE - Avec persistance en base
// ============================================================

window.validerDefinitivement = async function () {
    if (isLoading) {
        showToast('Opération en cours...', 'info');
        return;
    }

    const rows = document.querySelectorAll('#notesTableBody tr');
    if (rows.length === 0) {
        showToast('Aucun bulletin à valider', 'warning');
        return;
    }

    if (currentEleves.every(e => e.Statut === 'Validé')) {
        showToast('Tous les bulletins sont déjà validés', 'info');
        return;
    }

    if (!currentClasseId || !currentMatiereId || !currentPeriode) {
        showToast('Contexte incomplet. Veuillez recharger.', 'error');
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 50));

    const confirmed = await showConfirmDialog(
        '⚠️ Validation définitive',
        'Cette action est irréversible.\nUne fois validées, les notes ne pourront plus être modifiées.\n\nVoulez-vous continuer ?',
        'Confirmer',
        'Annuler',
        true
    );

    if (!confirmed) return;

    showLoading('Validation en cours...');
    isLoading = true;

    try {
        const data = await fetchWithErrorHandling('handlers/ValiderDefinitivement.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                classeId: currentClasseId,
                matiereId: currentMatiereId,
                periodeId: currentPeriode
            })
        });

        if (data.success && data.updated > 0) {
            // ✅ Persister l'état en base (déjà fait par le handler)
            // Mettre à jour l'état local
            currentEleves.forEach(e => { 
                if (e.Statut !== 'Validé' && (e.Note1 !== null || e.Note2 !== null || e.NoteProjet !== null)) {
                    e.Statut = 'Validé'; 
                } 
            });
            
            renderTable();
            updateButtonsState();
            setUnsavedChanges(false);
            showToast(`${data.updated} élève(s) validé(s) définitivement`, 'success');
        } else {
            showToast(data.message || 'Aucune note à valider', 'warning');
        }
    } catch (e) {
        showToast('Erreur: ' + e.message, 'error');
    } finally {
        hideLoading();
        isLoading = false;
    }
};

// ============================================================
// EXPORT
// ============================================================

window.exporter = function () {
    const rows = document.querySelectorAll('#notesTableBody tr');
    if (rows.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }

    const matiere = document.getElementById('ddlMatiere');
    const nomMatiere = matiere?.options[matiere.selectedIndex]?.textContent || '';
    const nomClasse = document.getElementById('ddlClasse')?.options[document.getElementById('ddlClasse').selectedIndex]?.text || '';
    const nomPeriode = document.getElementById('ddlPeriode')?.options[document.getElementById('ddlPeriode').selectedIndex]?.text || '';

    let csv = `Matière;${nomMatiere}\nClasse;${nomClasse}\nPériode;${nomPeriode}\n`;
    csv += `Coefficients;Note1:×${currentCoefficients.coeff1};Note2:×${currentCoefficients.coeff2};Examen:×${currentCoefficients.coeffProjet}\n\n`;
    csv += 'N°;Élève;Note1;Note2;Examen;Total;Moyenne;Appréciation;Statut\n';

    rows.forEach((row, i) => {
        const idx = row.dataset.idx;
        const nom = row.querySelector('.eleve-nom')?.textContent || '';
        const note1 = row.querySelector('[data-field="note1"]')?.value || 'Ab';
        const note2 = row.querySelector('[data-field="note2"]')?.value || 'Ab';
        const projet = row.querySelector('[data-field="projet"]')?.value || 'Ab';
        const total = row.querySelector('.totalnote-value')?.textContent || '0.00';
        const moyenne = row.querySelector('.moyenne-value')?.textContent || '-';
        const appreciation = row.querySelector('.appreciation-input')?.value || '';
        const statut = row.querySelector('.statut-badge')?.textContent.trim() || 'Non saisi';

        csv += `${parseInt(idx) + 1};"${nom}";${note1};${note2};${projet};${total};${moyenne};"${appreciation.replace(/"/g, '""')}";${statut}\n`;
    });

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
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function navigateTo(page) {
    if (hasUnsavedChanges) {
        showConfirmDialog(
            'Modifications non sauvegardées',
            'Vous avez des modifications non sauvegardées.\nVoulez-vous quitter sans sauvegarder ?',
            'Quitter', 'Annuler', false
        ).then(confirmed => {
            if (confirmed) window.location.href = page;
        });
    } else {
        window.location.href = page;
    }
}

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    getUserContext();
    chargerMatieres();
    createActionButtons();

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

    document.getElementById('ddlMatiere')?.addEventListener('change', onMatiereChange);
    document.getElementById('btnAppliquerCoeffs')?.addEventListener('click', appliquerCoefficients);

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

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            if (typeof window.sauvegarder === 'function' && currentEleves.length > 0) {
                window.sauvegarder();
            }
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});