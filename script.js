const numbers = {};
let selectedNumbers = [];

function initNumberGrid() {
    const grid = document.getElementById('number-grid');
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('number-cell');
        cell.textContent = i.toString().padStart(2, '0');
        cell.dataset.number = i.toString().padStart(2, '0');
        cell.onclick = () => toggleNumberSelection(i.toString().padStart(2, '0'));
        grid.appendChild(cell);
    }
}

function toggleNumberSelection(number) {
    const cell = document.querySelector(`.number-cell[data-number="${number}"]`);
    
    // Check if the number is already reserved
    if (numbers[number]) {
        alert('Este número já foi reservado');
        return;
    }

    // Toggle selection
    const index = selectedNumbers.indexOf(number);
    if (index > -1) {
        selectedNumbers.splice(index, 1);
        cell.classList.remove('selected');
    } else {
        selectedNumbers.push(number);
        cell.classList.add('selected');
    }

    // Update selected numbers display
    updateSelectedNumbersDisplay();

    // Show/hide reserve button
    document.getElementById('reserve-button').style.display = 
        selectedNumbers.length > 0 ? 'inline-block' : 'none';
}

function updateSelectedNumbersDisplay() {
    const display = document.getElementById('selected-numbers-list');
    display.textContent = selectedNumbers.join(', ');
}

function openReservationModal() {
    document.getElementById('reservation-modal').style.display = 'block';
}

function reserveSelectedNumbers() {
    const name = document.getElementById('name-input').value.trim();

    if (!name) {
        alert('Por favor, preencha seu nome');
        return;
    }

    // Check if any selected number is already reserved
    const reservedNumbers = selectedNumbers.filter(num => numbers[num]);
    if (reservedNumbers.length > 0) {
        alert(`Os números ${reservedNumbers.join(', ')} já foram reservados`);
        return;
    }

    // Reserve each selected number
    selectedNumbers.forEach(number => {
        numbers[number] = { 
            name, 
            paid: false 
        };
    });

    // Update localStorage
    localStorage.setItem('rifaNumbers', JSON.stringify(numbers));

    // Update grid and reset selection
    updateNumberGrid();
    resetNumberSelection();

    // Close modal
    document.getElementById('reservation-modal').style.display = 'none';
}

function resetNumberSelection() {
    // Remove selected class from all cells
    document.querySelectorAll('.number-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });

    // Clear selected numbers
    selectedNumbers = [];
    updateSelectedNumbersDisplay();
    document.getElementById('reserve-button').style.display = 'none';
    document.getElementById('name-input').value = '';
}

function updateNumberGrid() {
    const cells = document.querySelectorAll('.number-cell');
    cells.forEach(cell => {
        const number = cell.dataset.number;
        if (numbers[number]) {
            cell.classList.add('reserved');
            cell.textContent = `${number} - ${numbers[number].name}`;
            
            if (numbers[number].paid) {
                cell.classList.remove('reserved');
                cell.classList.add('paid');
            }
        } else {
            cell.classList.remove('reserved', 'paid');
            cell.textContent = number;
        }
    });
}

function showAdminLogin() {
    document.getElementById('client-area').style.display = 'none';
    document.getElementById('admin-area').style.display = 'block';
}

async function loginAdmin() {
    const password = document.getElementById('admin-password').value;

    try {
        const response = await fetch('http://localhost:3000/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            loadReservedNumbersByName();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Erro ao conectar ao servidor.');
        console.error(error);
    }
}

function logoutAdmin() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-area').style.display = 'none';
    document.getElementById('client-area').style.display = 'block';
    document.getElementById('admin-password').value = '';
}

function loadReservedNumbersByName() {
    const list = document.getElementById('reserved-numbers-list-by-name');
    list.innerHTML = '';

    // Group numbers by name
    const numbersByName = {};
    Object.entries(numbers).forEach(([number, details]) => {
        if (!numbersByName[details.name]) {
            numbersByName[details.name] = [];
        }
        numbersByName[details.name].push({ number, paid: details.paid });
    });

    // Create groups for each name
    Object.entries(numbersByName).forEach(([name, numberList]) => {
        const nameGroup = document.createElement('div');
        nameGroup.classList.add('name-group');

        const nameHeader = document.createElement('h4');
        nameHeader.textContent = name;
        nameGroup.appendChild(nameHeader);

        numberList.forEach(({ number, paid }) => {
            const item = document.createElement('div');
            item.classList.add('number-item', paid ? 'paid-number' : 'unpaid-number');
            
            const numberText = document.createElement('span');
            numberText.textContent = number;
            
            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('admin-buttons');

            const markPaidBtn = document.createElement('button');
            markPaidBtn.textContent = 'Pago';
            markPaidBtn.onclick = () => markAsPaid(number);

            const markUnpaidBtn = document.createElement('button');
            markUnpaidBtn.textContent = 'Não Pago';
            markUnpaidBtn.onclick = () => markAsUnpaid(number);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.onclick = () => deleteNumber(number);

            buttonsContainer.appendChild(markPaidBtn);
            buttonsContainer.appendChild(markUnpaidBtn);
            buttonsContainer.appendChild(deleteBtn);

            item.appendChild(numberText);
            item.appendChild(buttonsContainer);
            
            nameGroup.appendChild(item);
        });

        list.appendChild(nameGroup);
    });
}

function deleteNumber(number) {
    // Remove the number from the numbers object
    delete numbers[number];
    
    // Update localStorage
    localStorage.setItem('rifaNumbers', JSON.stringify(numbers));
    
    // Refresh the grid and admin list
    updateNumberGrid();
    loadReservedNumbersByName();
}

function markAsPaid(number) {
    numbers[number].paid = true;
    localStorage.setItem('rifaNumbers', JSON.stringify(numbers));
    updateNumberGrid();
    loadReservedNumbersByName();
}

function markAsUnpaid(number) {
    numbers[number].paid = false;
    localStorage.setItem('rifaNumbers', JSON.stringify(numbers));
    updateNumberGrid();
    loadReservedNumbersByName();
}

function clearAllNumbers() {
    // Confirm before clearing all numbers
    const confirmation = confirm('Tem certeza que deseja excluir TODOS os números da rifa? Esta ação não pode ser desfeita.');
    
    if (confirmation) {
        // Clear the numbers object
        for (let key in numbers) {
            delete numbers[key];
        }
        
        // Clear localStorage
        localStorage.removeItem('rifaNumbers');
        
        // Update the grid and admin view
        updateNumberGrid();
        loadReservedNumbersByName();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initNumberGrid();

    // Close modal when clicking on close button
    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('reservation-modal').style.display = 'none';
        resetNumberSelection();
    };

    // Close modal when clicking outside of it
    window.onclick = (event) => {
        const modal = document.getElementById('reservation-modal');
        if (event.target == modal) {
            modal.style.display = 'none';
            resetNumberSelection();
        }
    };

    // Carregar números salvos
    const savedNumbers = localStorage.getItem('rifaNumbers');
    if (savedNumbers) {
        Object.assign(numbers, JSON.parse(savedNumbers));
        updateNumberGrid();
    }
});
