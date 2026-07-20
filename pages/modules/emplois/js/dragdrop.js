// dragdrop.js
let dragData = null;

function onDragStart(e) {
    const td = e.target.closest('td');
    if (!td) return;
    const day = td.dataset.day;
    const hour = td.dataset.hour;
    const classe = STATE.currentClasse;
    if (!classe) {
        e.preventDefault();
        showToast('Veuillez sélectionner une classe', 'warning');
        return;
    }
    const cellData = getCellData(classe, day, hour);
    if (isCellEmpty(cellData)) {
        e.preventDefault();
        return;
    }
    dragData = { day, hour, classe, data: cellData };
    e.dataTransfer.setData('text/plain', `${day}|${hour}|${classe}`);
    td.style.opacity = '0.5';
    STATE.isDragging = true;
}

function onDragOver(e) {
    e.preventDefault();
    const td = e.target.closest('td');
    if (td) td.style.backgroundColor = '#cfe2ff';
}

function onDrop(e) {
    e.preventDefault();
    const td = e.target.closest('td');
    if (!td) return;
    const targetDay = td.dataset.day;
    const targetHour = td.dataset.hour;
    if (!dragData) return;

    const sourceDay = dragData.day;
    const sourceHour = dragData.hour;
    const classe = dragData.classe;

    // Même cellule ?
    if (sourceDay === targetDay && sourceHour === targetHour) {
        resetDragStyles();
        return;
    }

    const targetCell = getCellData(classe, targetDay, targetHour);
    if (!isCellEmpty(targetCell)) {
        // Case occupée → proposer d'échanger
        Swal.fire({
            title: 'Case occupée',
            text: 'Voulez-vous échanger les deux cours ou déplacer celui-ci (écraser) ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Échanger',
            cancelButtonText: 'Déplacer (écraser)'
        }).then(result => {
            if (result.isConfirmed) {
                moveCourse(classe, sourceDay, sourceHour, targetDay, targetHour, true);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                moveCourse(classe, sourceDay, sourceHour, targetDay, targetHour, false);
            }
            resetDragStyles();
        });
    } else {
        // Case libre → déplacement simple
        moveCourse(classe, sourceDay, sourceHour, targetDay, targetHour, false);
        resetDragStyles();
    }
}

function onDragEnd(e) {
    resetDragStyles();
}

function resetDragStyles() {
    document.querySelectorAll('td').forEach(td => {
        td.style.opacity = '1';
        td.style.backgroundColor = '';
    });
    dragData = null;
    STATE.isDragging = false;
}

// Attache les événements drag à toutes les cellules (appelé après rendu)
function attachDragEvents() {
    const cells = document.querySelectorAll('#emploiBody td');
    cells.forEach(td => {
        td.draggable = true;
        td.addEventListener('dragstart', onDragStart);
        td.addEventListener('dragover', onDragOver);
        td.addEventListener('drop', onDrop);
        td.addEventListener('dragend', onDragEnd);
        // Double-clic pour éditer
        td.addEventListener('dblclick', function() {
            const day = this.dataset.day;
            const hour = this.dataset.hour;
            if (day && hour) openEditModal(day, hour);
        });
    });
}