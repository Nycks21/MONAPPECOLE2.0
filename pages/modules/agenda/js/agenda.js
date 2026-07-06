/**
 * agenda.js - Gestion de l'agenda avec FullCalendar + Drag & Drop
 */

// ============================================================
// VARIABLES GLOBALES
// ============================================================

let calendar = null;
let currentEventId = null;
let isEditMode = false;

// Couleurs par type d'événement
const eventColors = {
    'cours': '#28a745',
    'examen': '#dc3545',
    'reunion': '#17a2b8',
    'reunion_parents': '#6f42c1',
    'vacances': '#ffc107',
    'ferie': '#fd7e14',
    'autre': '#6c757d'
};

const typeLabels = {
    'cours': 'Cours',
    'examen': 'Examens',
    'reunion': 'Réunions',
    'reunion_parents': 'Réunion Parents',
    'vacances': 'Vacances',
    'ferie': 'Jours fériés',
    'autre': 'Autre'
};

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
    initControls();
    initExternalEvents();
    loadEvents();
    loadTemplates();
    loadUpcomingEvents();
    loadStatistics(); // ✅ Ajouté
});

// ============================================================
// CONTROLES
// ============================================================

function initControls() {
    // Ajouter un événement
    var btnAddEvent = document.getElementById('btnAddEvent');
    if (btnAddEvent) {
        btnAddEvent.addEventListener('click', function() {
            openEventModal();
        });
    }

    // Rafraîchir
    var btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', function() {
            loadEvents();
            loadTemplates();
            loadUpcomingEvents();
            loadStatistics(); // ✅ Ajouté
        });
    }

    // Ajouter un événement depuis la sidebar
    var addNewEvent = document.getElementById('add-new-event');
    if (addNewEvent) {
        addNewEvent.addEventListener('click', function(e) {
            e.preventDefault();
            addEventFromSidebar();
        });
    }

    // Sélection de couleur
    var colorChooser = document.querySelectorAll('#color-chooser > li > a');
    if (colorChooser.length > 0) {
        colorChooser.forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                var color = window.getComputedStyle(this).color;
                var btn = document.getElementById('add-new-event');
                if (btn) {
                    btn.style.backgroundColor = color;
                    btn.style.borderColor = color;
                    btn.dataset.color = rgbToHex(color);
                }
            });
        });
    }

    // Enter dans le champ de saisie rapide
    var newEventInput = document.getElementById('new-event');
    if (newEventInput) {
        newEventInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addEventFromSidebar();
            }
        });
    }
}

// ============================================================
// INITIALISATION DU CALENDRIER
// ============================================================

function initCalendar() {
    var calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error('Element #calendar non trouvé');
        return;
    }
    
    if (typeof FullCalendar === 'undefined') {
        console.error('FullCalendar non chargé');
        return;
    }
    
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendar.Draggable;

    var containerEl = document.getElementById('external-events');
    var checkbox = document.getElementById('drop-remove');
    
    if (containerEl && Draggable) {
        new Draggable(containerEl, {
            itemSelector: '.external-event',
            eventData: function(eventEl) {
                return {
                    title: eventEl.innerText.trim(),
                    backgroundColor: window.getComputedStyle(eventEl, null).getPropertyValue('background-color'),
                    borderColor: window.getComputedStyle(eventEl, null).getPropertyValue('background-color'),
                    textColor: window.getComputedStyle(eventEl, null).getPropertyValue('color'),
                    extendedProps: {
                        type: eventEl.dataset.type || 'autre',
                        location: eventEl.dataset.location || '',
                        publique: eventEl.dataset.publique || 'all'
                    }
                };
            }
        });
    }
    
    calendar = new Calendar(calendarEl, {
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        locale: 'fr',
        themeSystem: 'bootstrap',
        height: 'auto',
        contentHeight: 'auto',
        buttonText: {
            today: "Aujourd'hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            list: 'Liste'
        },
        
        events: function(info, successCallback, failureCallback) {
            fetchEvents(successCallback, failureCallback);
        },
        
        eventClick: function(info) {
            showEventDetail(info.event);
        },
        
        dateClick: function(info) {
            openEventModal({ date: info.dateStr });
        },
        
        editable: true,
        droppable: true,
        
        drop: function(info) {
            var checkbox = document.getElementById('drop-remove');
            if (checkbox && checkbox.checked) {
                if (info.draggedEl && info.draggedEl.parentNode) {
                    info.draggedEl.parentNode.removeChild(info.draggedEl);
                }
            }
            
            var eventData = {
                title: info.draggedEl.innerText.trim(),
                start: info.dateStr,
                type: info.draggedEl.dataset.type || 'autre',
                color: window.getComputedStyle(info.draggedEl, null).getPropertyValue('background-color'),
                location: info.draggedEl.dataset.location || '',
                publique: info.draggedEl.dataset.publique || 'all'
            };
            
            saveEventFromDrop(eventData);
        },
        
        eventDrop: function(info) {
            updateEventDate(info.event);
        },
        
        eventResize: function(info) {
            updateEventDate(info.event);
        },
        
        eventDidMount: function(info) {
            var type = info.event.extendedProps.type || 'autre';
            info.el.classList.add('event-type-' + type);
            
            var tooltip = document.createElement('div');
            tooltip.className = 'event-tooltip';
            tooltip.innerHTML = `
                <strong>${info.event.title}</strong><br>
                <span class="tooltip-type">${typeLabels[type] || type}</span>
                ${info.event.extendedProps.location ? `<br>📍 ${info.event.extendedProps.location}` : ''}
            `;
            info.el.style.position = 'relative';
            info.el.appendChild(tooltip);
            
            info.el.addEventListener('mouseenter', function() {
                tooltip.style.display = 'block';
            });
            info.el.addEventListener('mouseleave', function() {
                tooltip.style.display = 'none';
            });
        }
    });
    
    calendar.render();
}

// ============================================================
// CHARGEMENT DES ÉVÉNEMENTS
// ============================================================

function fetchEvents(successCallback, failureCallback) {
    var events = window._agendaEvents || [];
    successCallback(events);
}

async function loadEvents() {
    showLoading('Chargement des événements...');
    
    try {
        var response = await fetch('handlers/GetEvents.ashx');
        
        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }
        
        var data = await response.json();
        
        if (data.success) {
            window._agendaEvents = data.events || [];
            
            if (calendar) {
                calendar.removeAllEvents();
                window._agendaEvents.forEach(function(e) {
                    calendar.addEvent({
                        id: e.id,
                        title: e.title,
                        start: e.start,
                        end: e.end,
                        color: e.color || eventColors[e.type] || '#1e3a2f',
                        extendedProps: {
                            type: e.type,
                            description: e.description || '',
                            location: e.location || '',
                            publique: e.publique || 'all',
                            created_at: e.created_at
                        }
                    });
                });
            }
            
            // ✅ Mettre à jour les statistiques
            await loadStatistics();
            
            hideLoading();
        } else {
            showToast(data.message || 'Erreur de chargement', 'error');
            hideLoading();
        }
    } catch (e) {
        console.error('Erreur:', e);
        showToast('Erreur de connexion: ' + e.message, 'error');
        hideLoading();
    }
}

// ============================================================
// CHARGEMENT DES STATISTIQUES
// ============================================================

async function loadStatistics() {
    try {
        var response = await fetch('handlers/GetStatistics.ashx');
        var data = await response.json();
        
        if (data.success) {
            var monthEl = document.getElementById('statMonthEvents');
            var upcomingEl = document.getElementById('statUpcoming');
            var pastEl = document.getElementById('statPast');
            
            if (monthEl) monthEl.textContent = data.monthEvents || 0;
            if (upcomingEl) upcomingEl.textContent = data.upcoming || 0;
            if (pastEl) pastEl.textContent = data.past || 0;
        }
    } catch (e) {
        console.error('Erreur chargement statistiques:', e);
    }
}

// ============================================================
// CHARGEMENT DES MODÈLES (TEMPLATES)
// ============================================================

async function loadTemplates() {
    var container = document.getElementById('templateList');
    if (!container) return;
    
    try {
        var response = await fetch('handlers/GetTemplates.ashx');
        var data = await response.json();
        
        if (!data.success) {
            container.innerHTML = '<div class="text-center text-muted" style="padding:10px;font-size:12px;">Aucun modèle disponible</div>';
            return;
        }
        
        var templates = data.templates || [];
        
        if (templates.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted" style="padding:15px;font-size:12px;">
                    <i class="fas fa-plus-circle" style="display:block;font-size:20px;margin-bottom:5px;"></i>
                    Aucun modèle<br>
                    <small>Créez-en dans l'agenda</small>
                </div>
            `;
            return;
        }
        
        var html = '';
        templates.forEach(function(t) {
            var color = t.COULEUR || '#007bff';
            html += `
                <div class="template-item" style="display:flex; align-items:center; padding:6px 10px; margin-bottom:4px; border-radius:4px; cursor:pointer; transition:background 0.2s;" 
                     onmouseover="this.style.background='#f0f7f4'" 
                     onmouseout="this.style.background='transparent'"
                     onclick="addEventFromTemplate('${t.ID}')">
                    <span style="width:12px; height:12px; border-radius:50%; background:${color}; display:inline-block; margin-right:10px; flex-shrink:0;"></span>
                    <span style="font-size:12px; color:#1e3a2f; flex:1;">${escapeHtml(t.NOM)}</span>
                    <span style="font-size:10px; color:#6c757d;">${t.HEURE_DEBUT || ''}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error('Erreur chargement templates:', e);
        container.innerHTML = '<div class="text-center text-danger" style="padding:10px;font-size:12px;">Erreur de chargement</div>';
    }
}

// ============================================================
// CHARGEMENT DES ÉVÉNEMENTS À VENIR
// ============================================================

async function loadUpcomingEvents() {
    var container = document.getElementById('upcomingEvents');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center text-muted" style="padding:20px;"><i class="fas fa-spinner fa-spin"></i> Chargement...</div>';
    
    try {
        var response = await fetch('handlers/GetUpcomingEvents.ashx');
        var data = await response.json();
        
        if (!data.success) {
            container.innerHTML = `<div class="text-center text-danger" style="padding:10px;font-size:13px;">${data.message || 'Erreur de chargement'}</div>`;
            return;
        }
        
        var events = data.events || [];
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted" style="padding:20px;">
                    <i class="fas fa-calendar-check" style="font-size:28px;display:block;margin-bottom:8px;"></i>
                    Aucun événement à venir
                </div>
            `;
            return;
        }
        
        var html = '';
        events.forEach(function(event) {
            var color = event.COULEUR || '#007bff';
            var date = new Date(event.DATE_DEBUT);
            var dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
            var timeStr = event.HEURE_DEBUT ? ` à ${event.HEURE_DEBUT}` : '';
            
            html += `
                <div class="upcoming-event-item" style="border-left:4px solid ${color}; padding:10px 12px; margin-bottom:10px; background:#f8f9fa; border-radius:4px; cursor:pointer;" onclick="showUpcomingEventDetail('${event.ID}')">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div style="flex:1;">
                            <div style="font-weight:600; font-size:13px; color:#1e3a2f;">${escapeHtml(event.TITRE || 'Sans titre')}</div>
                            <div style="font-size:11px; color:#6c757d; margin-top:2px;">
                                <i class="far fa-calendar-alt"></i> ${dateStr}${timeStr}
                            </div>
                        </div>
                        <span style="font-size:10px; background:${color}; color:white; padding:2px 8px; border-radius:10px; white-space:nowrap; margin-left:8px;">
                            ${event.TYPE || 'Événement'}
                        </span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error('Erreur chargement événements:', e);
        container.innerHTML = '<div class="text-center text-danger" style="padding:10px;font-size:13px;">Erreur de connexion</div>';
    }
}

// ============================================================
// AJOUTER UN ÉVÉNEMENT DEPUIS UN TEMPLATE
// ============================================================

async function addEventFromTemplate(templateId) {
    showLoading('Création de l\'événement...');
    
    try {
        var response = await fetch('handlers/AddEventFromTemplate.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: templateId
            })
        });
        
        var data = await response.json();
        
        if (data.success) {
            showToast('Événement ajouté avec succès', 'success');
            await loadEvents();
            await loadUpcomingEvents();
            await loadStatistics(); // ✅ Ajouté
        } else {
            showToast(data.message || 'Erreur lors de l\'ajout', 'error');
        }
        hideLoading();
    } catch (e) {
        console.error('Erreur:', e);
        showToast('Erreur de connexion', 'error');
        hideLoading();
    }
}

// ============================================================
// AFFICHER LES DÉTAILS D'UN ÉVÉNEMENT À VENIR
// ============================================================

async function showUpcomingEventDetail(eventId) {
    try {
        var response = await fetch('handlers/GetEventDetail.ashx?id=' + encodeURIComponent(eventId));
        var data = await response.json();
        
        if (!data.success) {
            showToast(data.message || 'Erreur', 'error');
            return;
        }
        
        var event = data.event;
        var color = event.COULEUR || '#007bff';
        var date = new Date(event.DATE_DEBUT);
        var dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        var timeStr = event.HEURE_DEBUT ? event.HEURE_DEBUT + (event.HEURE_FIN ? ' - ' + event.HEURE_FIN : '') : 'Journée entière';
        
        var publiqueLabels = {
            'all': 'Tous',
            'eleves': 'Élèves',
            'parents': 'Parents',
            'enseignants': 'Enseignants',
            'personnel': 'Personnel'
        };
        
        Swal.fire({
            title: event.TITRE || 'Événement',
            html: `
                <div style="text-align:left; padding:10px 0;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        <span style="width:20px; height:20px; border-radius:4px; background:${color}; display:inline-block;"></span>
                        <span style="font-size:13px; color:#6c757d;">${event.TYPE || 'Événement'}</span>
                    </div>
                    <div style="margin-bottom:8px;">
                        <i class="far fa-calendar-alt" style="width:20px; color:#6c757d;"></i>
                        <span style="font-size:14px;">${dateStr}</span>
                    </div>
                    <div style="margin-bottom:8px;">
                        <i class="far fa-clock" style="width:20px; color:#6c757d;"></i>
                        <span style="font-size:14px;">${timeStr}</span>
                    </div>
                    ${event.LIEU ? `
                        <div style="margin-bottom:8px;">
                            <i class="fas fa-map-marker-alt" style="width:20px; color:#6c757d;"></i>
                            <span style="font-size:14px;">${escapeHtml(event.LIEU)}</span>
                        </div>
                    ` : ''}
                    ${event.PUBLIQUE && event.PUBLIQUE !== 'all' ? `
                        <div style="margin-bottom:8px;">
                            <i class="fas fa-users" style="width:20px; color:#6c757d;"></i>
                            <span style="font-size:14px;">Public : ${publiqueLabels[event.PUBLIQUE] || event.PUBLIQUE}</span>
                        </div>
                    ` : ''}
                    ${event.URL ? `
                        <div style="margin-bottom:8px;">
                            <i class="fas fa-link" style="width:20px; color:#6c757d;"></i>
                            <a href="${event.URL}" target="_blank" style="font-size:14px; color:#007bff;">${event.URL}</a>
                        </div>
                    ` : ''}
                    ${event.DESCRIPTION ? `
                        <div style="margin-top:12px; padding-top:12px; border-top:1px solid #dee2e6;">
                            <div style="font-size:13px; color:#495057;">${escapeHtml(event.DESCRIPTION)}</div>
                        </div>
                    ` : ''}
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Fermer',
            confirmButtonColor: '#1e3a2f'
        });
        
    } catch (e) {
        console.error('Erreur:', e);
        showToast('Erreur de connexion', 'error');
    }
}

// ============================================================
// GESTION DES FILTRES
// ============================================================

function applyFilters() {
    if (!calendar) return;
    
    var typeFilter = document.getElementById('ddlEventType');
    var statusFilter = document.getElementById('ddlEventStatus');
    
    var typeValue = typeFilter ? typeFilter.value : 'all';
    var statusValue = statusFilter ? statusFilter.value : 'all';
    
    calendar.getEvents().forEach(function(event) {
        var type = event.extendedProps.type || 'autre';
        var now = new Date();
        var isUpcoming = event.start > now;
        
        var show = true;
        
        if (typeValue !== 'all' && type !== typeValue) {
            show = false;
        }
        
        if (statusValue === 'a_venir' && !isUpcoming) {
            show = false;
        }
        
        if (statusValue === 'termine' && isUpcoming) {
            show = false;
        }
        
        event.setProp('display', show ? 'auto' : 'none');
    });
}

// ============================================================
// ÉVÉNEMENTS À VENIR (DANS LE CALENDRIER)
// ============================================================

function updateUpcomingEvents(events) {
    var container = document.getElementById('upcomingEvents');
    if (!container) return;
    
    var now = new Date();
    
    var upcoming = events
        .filter(function(e) { return new Date(e.start) > now; })
        .sort(function(a, b) { return new Date(a.start) - new Date(b.start); })
        .slice(0, 10);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<div class="text-center text-muted">Aucun événement à venir</div>';
        return;
    }
    
    var html = '';
    upcoming.forEach(function(e) {
        var date = new Date(e.start);
        var dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        var color = e.color || eventColors[e.type] || '#1e3a2f';
        
        html += `
            <div class="upcoming-event" style="border-left: 3px solid ${color};" onclick="navigateToDate('${e.start}')">
                <div class="upcoming-event-date">${dateStr}</div>
                <div class="upcoming-event-title">${e.title}</div>
                <div class="upcoming-event-type">${typeLabels[e.type] || e.type}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function navigateToDate(dateStr) {
    if (calendar) {
        calendar.gotoDate(dateStr);
        calendar.changeView('dayGridMonth');
    }
}

// ============================================================
// INITIALISATION DES ÉVÉNEMENTS EXTERNES
// ============================================================

function initExternalEvents() {
    var events = document.querySelectorAll('#external-events div.external-event');
    if (events.length === 0) return;
    
    events.forEach(function(el) {
        makeEventDraggable(el);
    });
}

function makeEventDraggable(el) {
    if (typeof $ !== 'undefined' && $.fn.draggable) {
        $(el).draggable({
            zIndex: 1070,
            revert: true,
            revertDuration: 0
        });
    }
}

// ============================================================
// AJOUTER UN ÉVÉNEMENT DEPUIS LA SIDEBAR
// ============================================================

function addEventFromSidebar() {
    var input = document.getElementById('new-event');
    if (!input) return;
    
    var title = input.value.trim();
    
    if (title.length === 0) {
        showToast('Veuillez saisir un titre', 'warning');
        return;
    }
    
    var btn = document.getElementById('add-new-event');
    var color = btn ? (btn.dataset.color || '#3c8dbc') : '#3c8dbc';
    
    var container = document.getElementById('external-events');
    if (!container) {
        showToast('Conteneur d\'événements non trouvé', 'error');
        return;
    }
    
    var eventDiv = document.createElement('div');
    eventDiv.className = 'external-event';
    eventDiv.style.backgroundColor = color;
    eventDiv.style.borderColor = color;
    eventDiv.style.color = '#ffffff';
    eventDiv.textContent = title;
    eventDiv.dataset.type = 'autre';
    eventDiv.dataset.publique = 'all';
    
    container.prepend(eventDiv);
    makeEventDraggable(eventDiv);
    
    input.value = '';
    showToast('Événement ajouté dans la liste', 'success');
}

// ============================================================
// SAUVEGARDER UN ÉVÉNEMENT (Drop)
// ============================================================

async function saveEventFromDrop(eventData) {
    showLoading('Enregistrement...');
    
    try {
        var response = await fetch('handlers/AddEvent.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: eventData.title,
                type: eventData.type || 'autre',
                start: eventData.start,
                end: null,
                color: eventData.color || '#1e3a2f',
                location: eventData.location || '',
                publique: eventData.publique || 'all'
            })
        });
        
        var data = await response.json();
        
        if (data.success) {
            showToast('Événement ajouté avec succès', 'success');
            await loadEvents();
            await loadUpcomingEvents();
            await loadStatistics(); // ✅ Ajouté
        } else {
            showToast(data.message || 'Erreur', 'error');
        }
        hideLoading();
    } catch (e) {
        hideLoading();
        showToast('Erreur de connexion', 'error');
    }
}

// ============================================================
// MODALE AJOUT/MODIFICATION
// ============================================================

function openEventModal(data) {
    var modal = document.getElementById('eventModal');
    if (!modal) return;
    
    var title = document.getElementById('eventModalTitle');
    var deleteBtn = document.getElementById('btnDeleteEvent');
    
    isEditMode = false;
    
    // Réinitialiser le formulaire
    resetEventForm();
    
    if (data && data.id) {
        isEditMode = true;
        title.textContent = 'Modifier l\'événement';
        document.getElementById('eventId').value = data.id;
        document.getElementById('eventTitle').value = data.title || '';
        document.getElementById('eventType').value = data.type || 'cours';
        document.getElementById('eventDescription').value = data.description || '';
        document.getElementById('eventColor').value = data.color || '#1e3a2f';
        document.getElementById('eventLocation').value = data.location || '';
        document.getElementById('eventAudience').value = data.publique || 'all';
        if (data.url) document.getElementById('eventUrl').value = data.url;
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        currentEventId = data.id;
        
        if (data.start) {
            var startDate = new Date(data.start);
            document.getElementById('eventStart').value = startDate.toISOString().slice(0, 16);
        }
        if (data.end) {
            var endDate = new Date(data.end);
            document.getElementById('eventEnd').value = endDate.toISOString().slice(0, 16);
        }
    } else {
        title.textContent = 'Ajouter un événement';
        currentEventId = null;
        if (deleteBtn) deleteBtn.style.display = 'none';
        
        var now = new Date();
        now.setMinutes(0, 0, 0);
        
        if (data && data.date) {
            var date = new Date(data.date);
            if (data.date.length <= 10) {
                date.setHours(8, 0, 0);
            }
            document.getElementById('eventStart').value = date.toISOString().slice(0, 16);
        } else {
            document.getElementById('eventStart').value = now.toISOString().slice(0, 16);
        }
        
        var defaultEnd = new Date(now);
        defaultEnd.setHours(now.getHours() + 1);
        document.getElementById('eventEnd').value = defaultEnd.toISOString().slice(0, 16);
    }
    
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function resetEventForm() {
    document.getElementById('eventId').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventType').value = 'cours';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventColor').value = '#1e3a2f';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventAudience').value = 'all';
    document.getElementById('eventStart').value = '';
    document.getElementById('eventEnd').value = '';
    document.getElementById('eventUrl').value = '';
}

function closeEventModal() {
    var modal = document.getElementById('eventModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentEventId = null;
}

function closeDetailModal() {
    var modal = document.getElementById('detailModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================================
// SAUVEGARDE / SUPPRESSION
// ============================================================

async function saveEvent() {
    var id = document.getElementById('eventId').value;
    var title = document.getElementById('eventTitle').value.trim();
    var type = document.getElementById('eventType').value;
    var start = document.getElementById('eventStart').value;
    var end = document.getElementById('eventEnd').value;
    var description = document.getElementById('eventDescription').value.trim();
    var color = document.getElementById('eventColor').value;
    var location = document.getElementById('eventLocation').value.trim();
    var publique = document.getElementById('eventAudience').value;
    var url = document.getElementById('eventUrl').value.trim();
    
    if (!title) {
        showToast('Veuillez saisir un titre', 'warning');
        document.getElementById('eventTitle').focus();
        return;
    }
    
    if (!start) {
        showToast('Veuillez sélectionner une date de début', 'warning');
        document.getElementById('eventStart').focus();
        return;
    }
    
    var endpoint = id ? 'handlers/UpdateEvent.ashx' : 'handlers/AddEvent.ashx';
    var payload = {
        id: id || null,
        title: title,
        type: type,
        start: start,
        end: end || null,
        description: description,
        color: color,
        location: location,
        publique: publique,
        url: url
    };
    
    showLoading('Sauvegarde en cours...');
    
    try {
        var response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }
        
        var data = await response.json();
        
        if (data.success) {
            showToast(id ? 'Événement modifié avec succès' : 'Événement ajouté avec succès', 'success');
            closeEventModal();
            await loadEvents();
            await loadUpcomingEvents();
            await loadStatistics(); // ✅ Ajouté
        } else {
            showToast(data.message || 'Erreur lors de l\'enregistrement', 'error');
        }
        hideLoading();
    } catch (e) {
        console.error('Erreur saveEvent:', e);
        hideLoading();
        showToast('Erreur de connexion: ' + e.message, 'error');
    }
}

async function deleteEvent() {
    var id = document.getElementById('eventId').value;
    if (!id) {
        closeEventModal();
        return;
    }
    
    if (typeof Swal !== 'undefined') {
        var result = await Swal.fire({
            title: 'Confirmation de suppression',
            text: 'Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });
        
        if (!result.isConfirmed) return;
    } else {
        if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    }
    
    showLoading('Suppression en cours...');
    
    try {
        var response = await fetch('handlers/DeleteEvent.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }
        
        var data = await response.json();
        
        if (data.success) {
            showToast('Événement supprimé avec succès', 'success');
            closeEventModal();
            await loadEvents();
            await loadUpcomingEvents();
            await loadStatistics(); // ✅ Ajouté
        } else {
            showToast(data.message || 'Erreur lors de la suppression', 'error');
        }
        hideLoading();
    } catch (e) {
        console.error('Erreur deleteEvent:', e);
        hideLoading();
        showToast('Erreur de connexion: ' + e.message, 'error');
    }
}

async function updateEventDate(event) {
    try {
        var response = await fetch('handlers/UpdateEvent.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: event.id,
                start: event.start.toISOString(),
                end: event.end ? event.end.toISOString() : null
            })
        });
        
        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }
        
        var data = await response.json();
        if (!data.success) {
            showToast('Erreur lors de la mise à jour de la date', 'error');
            loadEvents();
        }
    } catch (e) {
        console.error('Erreur updateEventDate:', e);
        showToast('Erreur de connexion: ' + e.message, 'error');
        loadEvents();
    }
}

// ============================================================
// DÉTAILS D'UN ÉVÉNEMENT
// ============================================================

function showEventDetail(event) {
    var modal = document.getElementById('detailModal');
    var body = document.getElementById('detailBody');
    if (!modal || !body) return;
    
    var type = event.extendedProps.type || 'autre';
    var description = event.extendedProps.description || '';
    var location = event.extendedProps.location || '';
    var publique = event.extendedProps.publique || 'all';
    var url = event.extendedProps.url || '';
    
    var startDate = new Date(event.start);
    var endDate = event.end ? new Date(event.end) : null;
    
    var publiqueLabels = {
        'all': 'Tous',
        'eleves': 'Élèves',
        'parents': 'Parents',
        'enseignants': 'Enseignants',
        'personnel': 'Personnel'
    };
    
    var html = `
        <div class="detail-event" style="border-left: 5px solid ${event.backgroundColor};">
            <h4>${event.title}</h4>
            <div class="detail-meta">
                <span class="detail-type">${typeLabels[type] || type}</span>
                <span class="detail-date">📅 ${startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                ${startDate ? `<span class="detail-time">🕐 ${startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>` : ''}
                ${endDate ? `<span class="detail-time">➜ ${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>` : ''}
            </div>
    `;
    
    if (location) {
        html += `<div class="detail-location">📍 ${location}</div>`;
    }
    
    if (publique && publique !== 'all') {
        html += `<div class="detail-audience">👥 Public : ${publiqueLabels[publique] || publique}</div>`;
    }
    
    if (url) {
        html += `<div class="detail-url">🔗 <a href="${url}" target="_blank">${url}</a></div>`;
    }
    
    if (description) {
        html += `<div class="detail-description">${description}</div>`;
    }
    
    html += `</div>`;
    
    body.innerHTML = html;
    
    var editBtn = document.getElementById('btnEditDetail');
    if (editBtn) {
        editBtn.onclick = function() {
            closeDetailModal();
            var eventData = {
                id: event.id,
                title: event.title,
                type: type,
                start: event.start,
                end: event.end,
                description: description,
                color: event.backgroundColor,
                location: location,
                publique: publique,
                url: url
            };
            openEventModal(eventData);
        };
    }
    
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function editDetail() {
    // Fonction appelée via le bouton dans le modal
    // Le onclick est défini dynamiquement dans showEventDetail
}

// ============================================================
// UTILITAIRES
// ============================================================

function rgbToHex(rgb) {
    var match = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#3c8dbc';
    
    var r = parseInt(match[1]);
    var g = parseInt(match[2]);
    var b = parseInt(match[3]);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showLoading(message) {
    var overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        var msgEl = overlay.querySelector('.loading-message');
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.className = 'loading-message';
            msgEl.style.cssText = 'color:white; margin-top:15px; font-size:14px; font-weight:500;';
            overlay.appendChild(msgEl);
        }
        msgEl.textContent = message || 'Chargement en cours...';
    }
}

function hideLoading() {
    var overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    
    var container = document.getElementById('toastContainer');
    if (!container) return;
    
    var colors = {
        success: '#d4edda;color:#155724;border-left:4px solid #28a745',
        error: '#f8d7da;color:#721c24;border-left:4px solid #dc3545',
        warning: '#fff3cd;color:#856404;border-left:4px solid #ffc107',
        info: '#d1ecf1;color:#0c5460;border-left:4px solid #17a2b8'
    };
    
    var icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    var toast = document.createElement('div');
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
        transition:opacity .3s ease; 
        margin-bottom:10px; 
        cursor:pointer; 
        z-index:9999;
    `;
    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <i class="fas ${icons[type]}" style="font-size:18px;"></i>
            <span style="flex:1;">${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    requestAnimationFrame(function() { toast.style.opacity = '1'; });
    
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 350);
    }, duration);
}