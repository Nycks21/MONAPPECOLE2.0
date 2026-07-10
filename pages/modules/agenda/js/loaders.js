'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LOADERS — Module Agenda
// ─────────────────────────────────────────────────────────────────────────────

async function loadEvents() {
    showLoading('Chargement des événements...');
    try {
        const response = await fetch(API_AGENDA.getEvents);
        if (!response.ok) throw new Error('Erreur HTTP ' + response.status);
        const data = await response.json();
        if (data.success) {
            window._agendaEvents = data.events || [];
            if (calendar) {
                // ✅ Rafraîchir le calendrier pour qu'il utilise la nouvelle liste
                calendar.refetchEvents();
            }
            await loadStatistics();
        } else {
            showToast(data.message || 'Erreur de chargement', 'error');
        }
    } catch (e) {
        console.error('Erreur loadEvents:', e);
        showToast('Erreur de connexion: ' + e.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadStatistics() {
    try {
        const response = await fetch(API_AGENDA.getStatistics);
        const data = await response.json();
        if (data.success) {
            const el1 = document.getElementById('statMonthEvents');
            const el2 = document.getElementById('statUpcoming');
            const el3 = document.getElementById('statPast');
            if (el1) el1.textContent = data.monthEvents || 0;
            if (el2) el2.textContent = data.upcoming || 0;
            if (el3) el3.textContent = data.past || 0;
        }
    } catch (e) {
        console.error('Erreur statistiques:', e);
    }
}

async function loadTemplates() {
    const container = document.getElementById('templateList');
    if (!container) return;
    try {
        const response = await fetch(API_AGENDA.getTemplates);
        const data = await response.json();
        if (!data.success) {
            container.innerHTML = '<div class="text-center text-muted" style="padding:10px;font-size:12px;">Aucun modèle disponible</div>';
            return;
        }
        const templates = data.templates || [];
        if (templates.length === 0) {
            container.innerHTML = `<div class="text-center text-muted" style="padding:15px;font-size:12px;"><i class="fas fa-plus-circle" style="display:block;font-size:20px;margin-bottom:5px;"></i>Aucun modèle<br><small>Créez-en dans l'agenda</small></div>`;
            return;
        }
        let html = '';
        templates.forEach(t => {
            const color = t.COULEUR || '#007bff';
            html += `<div class="template-item" style="display:flex; align-items:center; padding:6px 10px; margin-bottom:4px; border-radius:4px; cursor:pointer; transition:background 0.2s;" 
                     onmouseover="this.style.background='#f0f7f4'" onmouseout="this.style.background='transparent'"
                     onclick="addEventFromTemplate('${t.ID}')">
                     <span style="width:12px; height:12px; border-radius:50%; background:${color}; display:inline-block; margin-right:10px; flex-shrink:0;"></span>
                     <span style="font-size:12px; color:#1e3a2f; flex:1;">${escapeHtml(t.NOM)}</span>
                     <span style="font-size:10px; color:#6c757d;">${t.HEURE_DEBUT || ''}</span>
                     </div>`;
        });
        container.innerHTML = html;
    } catch (e) {
        console.error('Erreur templates:', e);
        container.innerHTML = '<div class="text-center text-danger" style="padding:10px;font-size:12px;">Erreur de chargement</div>';
    }
}

async function loadUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    container.innerHTML = '<div class="text-center text-muted" style="padding:20px;"><i class="fas fa-spinner fa-spin"></i> Chargement...</div>';
    try {
        const response = await fetch(API_AGENDA.getUpcomingEvents);
        const data = await response.json();
        if (!data.success) {
            container.innerHTML = `<div class="text-center text-danger" style="padding:10px;font-size:13px;">${data.message || 'Erreur de chargement'}</div>`;
            return;
        }
        const events = data.events || [];
        if (events.length === 0) {
            container.innerHTML = `<div class="text-center text-muted" style="padding:20px;"><i class="fas fa-calendar-check" style="font-size:28px;display:block;margin-bottom:8px;"></i>Aucun événement à venir</div>`;
            return;
        }
        let html = '';
        events.forEach(event => {
            const color = event.COULEUR || '#007bff';
            const date = new Date(event.DATE_DEBUT);
            const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
            const timeStr = event.HEURE_DEBUT ? ` à ${event.HEURE_DEBUT}` : '';
            html += `<div class="upcoming-event-item" style="border-left:4px solid ${color}; padding:10px 12px; margin-bottom:10px; background:#f8f9fa; border-radius:4px; cursor:pointer;" onclick="showUpcomingEventDetail('${event.ID}')">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="font-weight:600; font-size:13px; color:#1e3a2f;">${escapeHtml(event.TITRE || 'Sans titre')}</div>
                        <div style="font-size:11px; color:#6c757d; margin-top:2px;"><i class="far fa-calendar-alt"></i> ${dateStr}${timeStr}</div>
                    </div>
                    <span style="font-size:10px; background:${color}; color:white; padding:2px 8px; border-radius:10px; white-space:nowrap; margin-left:8px;">${event.TYPE || 'Événement'}</span>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    } catch (e) {
        console.error('Erreur upcoming:', e);
        container.innerHTML = '<div class="text-center text-danger" style="padding:10px;font-size:13px;">Erreur de connexion</div>';
    }
}

// ════════════════════════════════════════════════════════
// EXPOSITION GLOBALE
// ════════════════════════════════════════════════════════

window.loadEvents = loadEvents;
window.loadStatistics = loadStatistics;
window.loadTemplates = loadTemplates;
window.loadUpcomingEvents = loadUpcomingEvents;