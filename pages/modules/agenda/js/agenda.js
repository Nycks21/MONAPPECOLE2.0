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
    'cours': '📚 Cours',
    'examen': '📝 Examens',
    'reunion': '🤝 Réunions',
    'reunion_parents': '👨‍👩‍👦 Réunions Parents',
    'vacances': '🏖️ Vacances',
    'ferie': '🎉 Jours fériés',
    'autre': '📌 Autre'
};

// Couleurs prédéfinies pour les événements rapides
const presetColors = [
    '#28a745', // Vert
    '#dc3545', // Rouge
    '#17a2b8', // Bleu
    '#ffc107', // Jaune
    '#6f42c1', // Violet
    '#fd7e14', // Orange
    '#20c997', // Turquoise
    '#e83e8c'  // Rose
];

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
    initControls();
    initExternalEvents();
    loadEvents();
});

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
        });
    }

    // Filtres
    var ddlEventType = document.getElementById('ddlEventType');
    if (ddlEventType) {
        ddlEventType.addEventListener('change', function() {
            applyFilters();
        });
    }

    var ddlEventStatus = document.getElementById('ddlEventStatus');
    if (ddlEventStatus) {
        ddlEventStatus.addEventListener('change', function() {
            applyFilters();
        });
    }

    // ✅ Ajouter un événement depuis la sidebar
    var addNewEvent = document.getElementById('add-new-event');
    if (addNewEvent) {
        addNewEvent.addEventListener('click', function(e) {
            e.preventDefault();
            addEventFromSidebar();
        });
    }

    // ✅ Sélection de couleur
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

    // ✅ Enter dans le champ de saisie rapide
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
    
    // Vérifier que FullCalendar est chargé
    if (typeof FullCalendar === 'undefined') {
        console.error('FullCalendar non chargé');
        return;
    }
    
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendar.Draggable;

    var containerEl = document.getElementById('external-events');
    var checkbox = document.getElementById('drop-remove');
    
    // ✅ Initialiser les événements externes draggable uniquement si le conteneur existe
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
                        audience: eventEl.dataset.audience || 'all'
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
                audience: info.draggedEl.dataset.audience || 'all'
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
                            audience: e.audience || 'all',
                            created_at: e.created_at
                        }
                    });
                });
            }
            
            updateUpcomingEvents(window._agendaEvents);
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
// ÉVÉNEMENTS À VENIR
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
                audience: eventData.audience || 'all'
            })
        });
        
        var data = await response.json();
        
        if (data.success) {
            showToast('Événement ajouté avec succès', 'success');
            await loadEvents();
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
    
    // Réinitialiser
    document.getElementById('eventId').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventType').value = 'cours';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventColor').value = '#1e3a2f';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventAudience').value = 'all';
    if (deleteBtn) deleteBtn.style.display = 'none';
    
    if (data && data.id) {
        isEditMode = true;
        title.textContent = 'Modifier l\'événement';
        document.getElementById('eventId').value = data.id;
        document.getElementById('eventTitle').value = data.title || '';
        document.getElementById('eventType').value = data.type || 'cours';
        document.getElementById('eventDescription').value = data.description || '';
        document.getElementById('eventColor').value = data.color || '#1e3a2f';
        document.getElementById('eventLocation').value = data.location || '';
        document.getElementById('eventAudience').value = data.audience || 'all';
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
        
        var now = new Date();
        if (data && data.date) {
            var date = new Date(data.date);
            document.getElementById('eventStart').value = date.toISOString().slice(0, 16);
        } else {
            document.getElementById('eventStart').value = now.toISOString().slice(0, 16);
        }
        document.getElementById('eventEnd').value = '';
    }
    
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
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
    var audience = document.getElementById('eventAudience').value;
    
    if (!title || !start) {
        showToast('Veuillez remplir le titre et la date de début', 'warning');
        return;
    }
    
    var url = id ? 'handlers/UpdateEvent.ashx' : 'handlers/AddEvent.ashx';
    var payload = {
        id: id || null,
        title: title,
        type: type,
        start: start,
        end: end || null,
        description: description,
        color: color,
        location: location,
        audience: audience
    };
    
    showLoading('Sauvegarde en cours...');
    
    try {
        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        var data = await response.json();
        
        if (data.success) {
            showToast(id ? 'Événement modifié avec succès' : 'Événement ajouté avec succès', 'success');
            closeEventModal();
            await loadEvents();
        } else {
            showToast(data.message || 'Erreur', 'error');
        }
        hideLoading();
    } catch (e) {
        hideLoading();
        showToast('Erreur de connexion', 'error');
    }
}

async function deleteEvent() {
    var id = document.getElementById('eventId').value;
    if (!id) return;
    
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    
    showLoading('Suppression en cours...');
    
    try {
        var response = await fetch('handlers/DeleteEvent.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        var data = await response.json();
        
        if (data.success) {
            showToast('Événement supprimé', 'success');
            closeEventModal();
            await loadEvents();
        } else {
            showToast(data.message || 'Erreur', 'error');
        }
        hideLoading();
    } catch (e) {
        hideLoading();
        showToast('Erreur de connexion', 'error');
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
        
        var data = await response.json();
        if (!data.success) {
            showToast('Erreur lors de la mise à jour', 'error');
            loadEvents();
        }
    } catch (e) {
        showToast('Erreur de connexion', 'error');
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
    var audience = event.extendedProps.audience || 'all';
    
    var startDate = new Date(event.start);
    var endDate = event.end ? new Date(event.end) : null;
    
    var audienceLabels = {
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
    
    if (audience !== 'all') {
        html += `<div class="detail-audience">👥 Public : ${audienceLabels[audience] || audience}</div>`;
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
                audience: audience
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