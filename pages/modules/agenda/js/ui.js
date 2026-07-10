'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UI — Module Agenda (Modales, Filtres, Confirmations)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// MODALES
// ─────────────────────────────────────────────────────────────────────────────

function openEventModal(data) {
    var modal = document.getElementById('eventModal');
    if (!modal) return;
    
    var title = document.getElementById('eventModalTitle');
    var deleteBtn = document.getElementById('btnDeleteEvent');
    
    isEditMode = false;
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
            var startDate = new Date(data.start);
            if (endDate < startDate) {
                endDate = new Date(startDate);
                endDate.setHours(startDate.getHours() + 1);
            }
            document.getElementById('eventEnd').value = endDate.toISOString().slice(0, 16);
        }
    } else {
        title.textContent = 'Ajouter un événement';
        currentEventId = null;
        if (deleteBtn) deleteBtn.style.display = 'none';
        
        var now = new Date();
        now.setMinutes(0, 0, 0);
        
        var startDate;
        if (data && data.date) {
            startDate = new Date(data.date);
            if (data.date.length <= 10) {
                startDate.setHours(8, 0, 0);
            }
        } else {
            startDate = new Date(now);
        }
        document.getElementById('eventStart').value = startDate.toISOString().slice(0, 16);
        
        var defaultEnd = new Date(startDate);
        defaultEnd.setHours(startDate.getHours() + 1);
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

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────

function showConfirmDialog(title, message, confirmText, cancelText, isDanger) {
    confirmText = confirmText || 'Confirmer';
    cancelText = cancelText || 'Annuler';
    isDanger = (isDanger !== undefined) ? isDanger : true;

    return new Promise(function(resolve) {
        var modal = document.getElementById('confirmDeleteModal');
        var msgEl = document.getElementById('confirmDeleteMessage');
        var okBtn = document.getElementById('confirmDeleteBtn');
        var cancelBtn = document.querySelector('#confirmDeleteModal .btn-secondary');
        var closeBtn = document.querySelector('#confirmDeleteModal .modal-close');

        if (!modal || !msgEl || !okBtn) {
            if (confirm(message)) {
                resolve(true);
            } else {
                resolve(false);
            }
            return;
        }

        msgEl.textContent = message;
        okBtn.textContent = confirmText;
        if (cancelBtn) cancelBtn.textContent = cancelText;

        if (isDanger) {
            okBtn.style.background = '#dc3545';
        } else {
            okBtn.style.background = '#28a745';
        }

        var newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        
        if (cancelBtn) {
            var newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        }
        
        if (closeBtn) {
            var newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        }

        var close = function(result) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = '';
            resolve(result);
        };

        newOkBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            close(true);
        });

        if (newCancelBtn) {
            newCancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                close(false);
            });
        }

        if (newCloseBtn) {
            newCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                close(false);
            });
        }

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                close(false);
            }
        });

        document.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') {
                close(false);
                document.removeEventListener('keydown', escListener);
            }
        });

        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

function closeConfirmDeleteModal() {
    var modal = document.getElementById('confirmDeleteModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTRES
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLES UI
// ─────────────────────────────────────────────────────────────────────────────

function initControls() {
    var btnAddEvent = document.getElementById('btnAddEvent');
    if (btnAddEvent) {
        btnAddEvent.addEventListener('click', function() {
            openEventModal();
        });
    }

    var btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', function() {
            loadEvents();
            loadTemplates();
            loadUpcomingEvents();
            loadStatistics();
        });
    }

    var addNewEvent = document.getElementById('add-new-event');
    if (addNewEvent) {
        addNewEvent.addEventListener('click', function(e) {
            e.preventDefault();
            addEventFromSidebar();
        });
    }

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

    var newEventInput = document.getElementById('new-event');
    if (newEventInput) {
        newEventInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addEventFromSidebar();
            }
        });
    }

    var startInput = document.getElementById('eventStart');
    var endInput = document.getElementById('eventEnd');
    
    if (startInput && endInput) {
        startInput.addEventListener('change', function() {
            var startVal = this.value;
            var endVal = endInput.value;
            
            if (startVal && endVal) {
                var startDate = new Date(startVal);
                var endDate = new Date(endVal);
                
                if (endDate < startDate) {
                    var newEnd = new Date(startDate);
                    newEnd.setHours(startDate.getHours() + 1);
                    endInput.value = newEnd.toISOString().slice(0, 16);
                    showToast('⏰ La date de fin a été ajustée automatiquement', 'info');
                }
            }
        });
    }
}