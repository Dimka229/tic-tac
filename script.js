let size = 3;               // текущий размер поля (3,4,5,6)
let boardData = [];        // двумерный массив: 'X', 'O' или ''
let currentPlayer = 'X';   // X всегда начинает
let gameActive = true;
let winCells = [];         // массив победных ячеек [{row, col}]

// ----- DOM элементы -----
const boardDiv = document.getElementById('board');
const turnSpan = document.getElementById('turnText');
const msgSpan = document.getElementById('msgText');
const resetBtn = document.getElementById('resetGame');
const sizeBtns = document.querySelectorAll('.size-btn');

// ----- Обновление текста статуса (кто ходит / победа / ничья) -----
function updateUI() {
    if (!gameActive) {
        if (winCells.length > 0) {
            // Определяем победителя: берём значение из первой победной ячейки
            const winnerSymbol = boardData[winCells[0].row][winCells[0].col];
            turnSpan.innerText = ` Победил: ${winnerSymbol === 'X' ? '' : ''}`;
            msgSpan.innerText = `Игрок ${winnerSymbol} выиграл!`;
        } else {
            turnSpan.innerText = ` Ничья`;
            msgSpan.innerText = `Ничья! Начните заново.`;
        }
        return;
    }
    // Игра активна
    turnSpan.innerText = `Ход: ${currentPlayer === 'X' ? '' : ''}`;
    msgSpan.innerText = `ходит ${currentPlayer === 'X' ? 'крестик' : 'нолик'}`;
}

// ----- Проверка победителя, возвращает массив победных ячеек [{row,col}] -----
function checkWinner() {
    // 1) Проверка строк
    for (let i = 0; i < size; i++) {
        const first = boardData[i][0];
        if (first !== '') {
            let allSame = true;
            for (let j = 1; j < size; j++) {
                if (boardData[i][j] !== first) {
                    allSame = false;
                    break;
                }
            }
            if (allSame) {
                const cells = [];
                for (let j = 0; j < size; j++) cells.push({ row: i, col: j });
                return cells;
            }
        }
    }

    // 2) Проверка столбцов
    for (let j = 0; j < size; j++) {
        const first = boardData[0][j];
        if (first !== '') {
            let allSame = true;
            for (let i = 1; i < size; i++) {
                if (boardData[i][j] !== first) {
                    allSame = false;
                    break;
                }
            }
            if (allSame) {
                const cells = [];
                for (let i = 0; i < size; i++) cells.push({ row: i, col: j });
                return cells;
            }
        }
    }

    // 3) Главная диагональ (сверху-слева направо-вниз)
    const firstDiag = boardData[0][0];
    if (firstDiag !== '') {
        let winDiag = true;
        for (let i = 1; i < size; i++) {
            if (boardData[i][i] !== firstDiag) {
                winDiag = false;
                break;
            }
        }
        if (winDiag) {
            const cells = [];
            for (let i = 0; i < size; i++) cells.push({ row: i, col: i });
            return cells;
        }
    }

    // 4) Побочная диагональ (сверху-справа вниз-влево)
    const firstAnti = boardData[0][size - 1];
    if (firstAnti !== '') {
        let winAnti = true;
        for (let i = 1; i < size; i++) {
            if (boardData[i][size - 1 - i] !== firstAnti) {
                winAnti = false;
                break;
            }
        }
        if (winAnti) {
            const cells = [];
            for (let i = 0; i < size; i++) cells.push({ row: i, col: size - 1 - i });
            return cells;
        }
    }

    return []; // нет победителя
}

// ----- Проверка ничьи -----
function isDraw() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (boardData[i][j] === '') return false;
        }
    }
    return true;
}

// ----- состояния после хода (победа / ничья / продолжение) -----
function evaluateAfterMove() {
    const winnerCellsArr = checkWinner();
    if (winnerCellsArr.length > 0) {
        gameActive = false;
        winCells = winnerCellsArr;
        updateUI();
        renderBoard();
        return;
    }
    if (isDraw()) {
        gameActive = false;
        winCells = [];
        updateUI();
        renderBoard();
        return;
    }
    // Игра продолжается
    winCells = [];
    updateUI();
    renderBoard();
}

// ----- Обработчик клика по клетке -----
function cellClick(row, col) {
    if (!gameActive) return;
    if (boardData[row][col] !== '') return;

    // Ставим текущего игрока
    boardData[row][col] = currentPlayer;

    // Проверяем победу или ничью после хода
    const winnerAfter = checkWinner();
    if (winnerAfter.length > 0) {
        gameActive = false;
        winCells = winnerAfter;
        updateUI();
        renderBoard();
        return;
    }
    if (isDraw()) {
        gameActive = false;
        winCells = [];
        updateUI();
        renderBoard();
        return;
    }

    // Смена игрока
    currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
    updateUI();
    renderBoard();
}

// ----- Отрисовка игрового поля -----
function renderBoard() {
    // Настройка сетки CSS
    boardDiv.style.display = 'grid';
    boardDiv.style.gridTemplateColumns = `repeat(${size}, minmax(65px, 85px))`;
    boardDiv.style.gap = '8px';
    boardDiv.innerHTML = '';

    // Создаём Set для быстрой проверки победных клеток
    const winSet = new Set();
    if (winCells.length > 0) {
        for (let cell of winCells) {
            winSet.add(`${cell.row},${cell.col}`);
        }
    }

    // Заполняем ячейки
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const value = boardData[i][j];
            const cell = document.createElement('div');
            cell.className = 'cell';

            // Отображаем символ
            if (value === 'X') cell.innerText = '❌';
            else if (value === 'O') cell.innerText = '⭕';
            else cell.innerText = '';

            // Подсвечиваем победные ячейки
            if (winSet.has(`${i},${j}`)) {
                cell.classList.add('win');
            }

            // Блокировка, если игра окончена или клетка занята
            if (!gameActive || value !== '') {
                cell.classList.add('disabled');
            } else {
                cell.style.cursor = 'pointer';
                // Добавляем обработчик клика
                cell.addEventListener('click', (function(r, c) {
                    return function() { cellClick(r, c); };
                })(i, j));
            }
            boardDiv.appendChild(cell);
        }
    }
}

// ----- Полный сброс игры -----
function resetGame() {
    // Создаём пустую доску size x size
    boardData = Array(size).fill().map(() => Array(size).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    winCells = [];
    updateUI();
    renderBoard();
}

// ----- Изменить размер поля и перезапустить игру -----
function setNewSize(newSize) {
    if (newSize === size && boardData.length === size) {
        resetGame();  // если тот же размер – просто сброс
        return;
    }
    size = newSize;
    boardData = Array(size).fill().map(() => Array(size).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    winCells = [];
    updateUI();
    renderBoard();
}

// ----- Инициализация кнопок выбора размера -----
function initSizeButtons() {
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const newSize = parseInt(btn.getAttribute('data-size'), 10);
            if (isNaN(newSize)) return;
            // Обновить активный класс
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setNewSize(newSize);
        });
    });
}

// ----- Обработчик кнопки "Новая игра" -----
resetBtn.addEventListener('click', () => {
    resetGame();
});

// ----- Старт игры -----
function init() {
    initSizeButtons();
    size = 3;
    boardData = Array(3).fill().map(() => Array(3).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    winCells = [];
    updateUI();
    renderBoard();
}

// Запускаем игру после полной загрузки DOM
document.addEventListener('DOMContentLoaded', init);
