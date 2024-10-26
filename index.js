// Variables para almacenar el estado del juego
let gameBoard = ['', '', '', '', '', '', '', '', ''];  // Representa las celdas del tablero
let currentPlayer = 'X';  // El jugador comienza
let gameActive = true;  // Controla si el juego está en marcha
let timer;  // Controla el cronómetro
let startTime;  // Almacena el tiempo de inicio del juego

// Referencias al DOM
const cells = document.querySelectorAll('.cell');
const timerDisplay = document.getElementById('timer');
const leaderboardBody = document.getElementById('leaderboard-body');
const resetButton = document.getElementById('reset-btn'); // Botón de reinicio
const playerXDisplay = document.getElementById('player-x'); // Elemento para X
const playerODisplay = document.getElementById('player-o'); // Elemento para O

// Deshabilita el botón de reinicio al comienzo del juego
resetButton.disabled = true;

// Inicia el juego y escucha eventos de clic
cells.forEach(cell => {
  cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', resetGame); // Evento para el botón de reinicio

// Resalta el turno actual
function highlightTurn() {
  if (currentPlayer === 'X') {
    playerXDisplay.classList.add('highlight-x');
    playerODisplay.classList.remove('highlight-o');
  } else {
    playerODisplay.classList.add('highlight-o');
    playerXDisplay.classList.remove('highlight-x');
  }
}

// Llama a highlightTurn() inicialmente
highlightTurn();

function handleCellClick(event) {
  const clickedCell = event.target;
  const cellIndex = clickedCell.getAttribute('data-index');

  // Verifica si la celda ya está ocupada o si el juego ha terminado
  if (gameBoard[cellIndex] !== '' || !gameActive) {
    return;
  }

  // Marca el movimiento del jugador
  if (currentPlayer === 'X') {
    playerMove(cellIndex, clickedCell);
  }
}

// Marca el movimiento del jugador
function playerMove(index, cell) {
    gameBoard[index] = 'X';
    cell.textContent = 'X';
    cell.classList.add('player-x'); // Añadir clase para X
  
    // Iniciar cronómetro en el primer movimiento
    if (!startTime) {
      startTime = Date.now();
      timer = setInterval(updateTimer, 1000);
    }
  
    // Revisa si el jugador ha ganado
    if (checkWin('X')) {
      endGame('Jugador');
      return;
    }
  
    // Cambia el turno a la IA
    currentPlayer = 'O';
    highlightTurn(); // Actualiza el resalte del turno
    setTimeout(computerMove, 500);  // La IA juega después de un pequeño retraso
  }
  
// Movimiento de la IA (aleatorio)
function computerMove() {
    let availableCells = gameBoard
      .map((cell, index) => (cell === '' ? index : null))
      .filter(index => index !== null);
  
    if (availableCells.length === 0) {
      endGame('Empate');
      return;
    }
  
    // Selecciona una celda aleatoria para la IA
    const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    gameBoard[randomIndex] = 'O';
    cells[randomIndex].textContent = 'O';
    cells[randomIndex].classList.add('player-o'); // Añadir clase para O
  
    // Revisa si la IA ha ganado
    if (checkWin('O')) {
      endGame('IA');
      return;
    }
  
    // Cambia el turno de vuelta al jugador
    currentPlayer = 'X';
    highlightTurn(); // Actualiza el resalte del turno
  }

// Actualiza el cronómetro
function updateTimer() {
  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);
  timerDisplay.textContent = `Tiempo: ${elapsedTime}s`;
}

// Valida las combinaciones ganadoras
function checkWin(player) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Filas
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columnas
    [0, 4, 8], [2, 4, 6]              // Diagonales
  ];

  return winningCombinations.some(combination =>
    combination.every(index => gameBoard[index] === player)
  );
}

// Termina el juego y determina el ganador
function endGame(winner) {
  gameActive = false;
  clearInterval(timer);  // Detiene el cronómetro
  resetButton.disabled = false; // Habilita el botón de reinicio

  if (winner === 'Jugador') {
    const playerName = prompt('¡Ganaste! Ingresa tu nombre:');
    if (playerName) {
      const timeElapsed = parseInt(timerDisplay.textContent.split(': ')[1]);
      saveTime(playerName, timeElapsed);
      updateLeaderboard();
    }
  } else if (winner === 'IA') {
    alert('La IA ha ganado, mejor suerte la próxima vez.');
  } else {
    alert('Empate, intenta de nuevo.');
  }
}

// Guarda el tiempo del jugador en LocalStorage
function saveTime(playerName, timeElapsed) {
    const bestTimes = JSON.parse(localStorage.getItem('bestTimes')) || [];
    const newRecord = {
      name: playerName,
      time: timeElapsed,
      // Usamos toLocaleString() para obtener tanto la fecha como la hora
      date: new Date().toLocaleString('es-MX', { hour12: true })  // Formato con hora y AM/PM
    };
  
    bestTimes.push(newRecord);
    bestTimes.sort((a, b) => a.time - b.time);  // Ordena por tiempo ascendente
    if (bestTimes.length > 10) {
      bestTimes.pop();  // Mantiene solo los 10 mejores tiempos
    }
  
    localStorage.setItem('bestTimes', JSON.stringify(bestTimes));
  }  

// Actualiza la tabla de mejores tiempos
function updateLeaderboard() {
  const bestTimes = JSON.parse(localStorage.getItem('bestTimes')) || [];
  leaderboardBody.innerHTML = '';  // Limpia la tabla

  bestTimes.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.name}</td>
      <td>${record.time}s</td>
      <td>${record.date}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

// Reinicia el juego
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    startTime = null;
    timerDisplay.textContent = 'Tiempo: 0s';
    
    cells.forEach(cell => {
      cell.textContent = '';  // Limpia el tablero
      cell.classList.remove('player-x', 'player-o');  // Elimina las clases de color
    });
  
    currentPlayer = "X";
    highlightTurn();
    resetButton.disabled = true;  // Deshabilita el botón de reinicio nuevamente
    clearInterval(timer);  // Reinicia el cronómetro
  }

// Carga los mejores tiempos al iniciar la página
updateLeaderboard();
