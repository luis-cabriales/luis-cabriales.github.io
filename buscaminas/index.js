// Selección de elementos HTML
const selectDificultad = document.getElementById("dificultad");
const contenerTablero = document.getElementById("contener-tablero");
const contadorBanderas = document.getElementById("contador-banderas");

// Variables del juego
let tablero = [];
let filas = 0;
let columnas = 0;
let minas = 0;
let banderas = 0;
let primerMovimiento = false;
let celdasReveladas = 0;

// Función para configurar la dificultad
function configurarDificultad() {
  const dificultad = selectDificultad.value;

  switch (dificultad) {
    case "Facil":
      filas = 9;
      columnas = 9;
      minas = 10;
      break;

    case "Medio":
      filas = 16;
      columnas = 16;
      minas = 40;
      break;

    case "Dificil":
      filas = 16;
      columnas = 30;
      minas = 99;
      break;

    case "MuyDificil":
      filas = 18;
      columnas = 30;
      minas = 105;
      break;

    case "Hardcore":
      filas = 24;
      columnas = 24;
      minas = 110;
      break;

    case "Leyenda":
      filas = 30;
      columnas = 30;
      minas = 180;
      break;

    case "Personalizado":
      let validInput = false;
      while (!validInput) {
        filas = parseInt(prompt("Introduce el número de filas (5-30):"));
        columnas = parseInt(prompt("Introduce el número de columnas (5-30):"));
        minas = parseInt(
          prompt(
            `Introduce el número de minas (máximo: ${Math.floor(
              (filas * columnas) / 2
            )}):`
          )
        );

        if (isNaN(filas) || isNaN(columnas) || isNaN(minas)) {
          alert("Por favor, ingresa valores numéricos.");
          continue;
        }
        if (filas < 5 || filas > 30 || columnas < 5 || columnas > 30) {
          alert("El tamaño del tablero debe estar entre 5x5 y 30x30.");
        } else if (minas < 1 || minas > Math.floor((filas * columnas) / 2)) {
          alert(
            `El número de minas debe estar entre 1 y ${Math.floor(
              (filas * columnas) / 2
            )}.`
          );
        } else {
          validInput = true;
        }
      }
      break;
  }

  banderas = minas; // Inicializar el contador de banderas igual a la cantidad de minas
  contadorBanderas.textContent = banderas; // Actualizar el número de banderas
  crearTablero(filas, columnas);
  renderizarTablero(); // Renderiza el tablero en el HTML
  primerMovimiento = false;
  celdasReveladas = 0;
}

// Crear el tablero como una matriz vacía
function crearTablero(filas, columnas) {
  tablero = Array.from({ length: filas }, () =>
    Array.from({ length: columnas }, () => ({
      revelada: false,
      mina: false,
      bandera: false,
    }))
  );
}

// Renderizar el tablero en el HTML
function renderizarTablero() {
  contenerTablero.innerHTML = ""; // Limpiar el tablero existente

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const celda = document.createElement("div");
      celda.classList.add("celda");
      celda.dataset.fila = i;
      celda.dataset.columna = j;
      celda.addEventListener("click", manejarPrimerMovimiento);
      celda.addEventListener("contextmenu", manejarBandera);
      contenerTablero.appendChild(celda);
    }
  }
  // Ajuste de tamaño del grid
  contenerTablero.style.gridTemplateRows = `repeat(${filas}, 1fr)`;
  contenerTablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
}

// Manejador de clic derecho para colocar/quitar banderas
function manejarBandera(event) {
  event.preventDefault();

  const fila = parseInt(event.target.dataset.fila);
  const columna = parseInt(event.target.dataset.columna);
  const celda = tablero[fila][columna];

  if (!celda.revelada) {
    // Solo permitir colocar banderas en celdas no reveladas
    if (!celda.bandera && banderas > 0) {
      // Colocar bandera
      celda.bandera = true;
      event.target.classList.add("bandera");
      banderas--;
    } else if (celda.bandera) {
      // Quitar bandera
      celda.bandera = false;
      event.target.classList.remove("bandera");
      banderas++;
    }

    // Actualizar el contador de banderas en el HTML
    contadorBanderas.textContent = banderas;
  }
}

// Colocar minas aleatoriamente después del primer clic
function colocarMinas(excluirFila, excluirColumna) {
  let minasColocadas = 0;

  while (minasColocadas < minas) {
    const filaAleatoria = Math.floor(Math.random() * filas);
    const columnaAleatoria = Math.floor(Math.random() * columnas);

    // Evitar colocar una mina en la posición inicial del primer clic y alrededor (3x3)
    if (
      filaAleatoria >= excluirFila - 1 && filaAleatoria <= excluirFila + 1 &&
      columnaAleatoria >= excluirColumna - 1 && columnaAleatoria <= excluirColumna + 1
    ) {
      continue; // Saltar la colocación de la mina en esta posición
    }

    if (!tablero[filaAleatoria][columnaAleatoria].mina) {
      tablero[filaAleatoria][columnaAleatoria].mina = true;
      minasColocadas++;
    }
  }
}


// Manejador del primer movimiento
function manejarPrimerMovimiento(event) {
  const fila = parseInt(event.target.dataset.fila);
  const columna = parseInt(event.target.dataset.columna);

  if (!primerMovimiento) {
    colocarMinas(fila, columna);
    primerMovimiento = true;
  }

  // Llamar a revelarCelda con las coordenadas de fila y columna
  revelarCelda(fila, columna);
}

// Función para revelar la celda
function revelarCelda(fila, columna) {
  if (tablero[fila][columna].revelada || tablero[fila][columna].bandera) return; // No revelar si tiene una bandera

  const celda = document.querySelector(
    `[data-fila="${fila}"][data-columna="${columna}"]`
  );

  if (tablero[fila][columna].mina) {
    perderJuego();
    return;
  }

  tablero[fila][columna].revelada = true;
  celda.classList.add("abierta");

  const minasAlrededor = contarMinasAlrededor(fila, columna);
  if (minasAlrededor > 0) {
    celda.textContent = minasAlrededor;
  } else {
    revelarCeldasVacias(fila, columna);
  }

  celdasReveladas++;
  verificarVictoria();
}

// Función para manejar la derrota del jugador
function perderJuego() {
  // Revelar todas las minas en el tablero
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const celda = document.querySelector(
        `[data-fila="${i}"][data-columna="${j}"]`
      );

      // Revelar minas y desactivar celdas
      if (tablero[i][j].mina) {
        celda.classList.add("mina");
      }

      // Quitar todas las banderas y desactivar clics en las celdas no reveladas
      celda.classList.remove("bandera");
      celda.removeEventListener("click", manejarPrimerMovimiento); // Desactivar clics en celdas
      celda.removeEventListener("contextmenu", manejarBandera); // Desactivar clic derecho para banderas
    }
  }

  alert("¡Has perdido! Tocaste una mina.");
}

// Función para contar las minas alrededor de una celda específica
function contarMinasAlrededor(fila, columna) {
  let contador = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const nuevaFila = fila + i;
      const nuevaColumna = columna + j;
      if (
        nuevaFila >= 0 &&
        nuevaFila < filas &&
        nuevaColumna >= 0 &&
        nuevaColumna < columnas &&
        tablero[nuevaFila][nuevaColumna].mina
      ) {
        contador++;
      }
    }
  }
  return contador;
}

// Función para revelar celdas vacías adyacentes
function revelarCeldasVacias(fila, columna) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const nuevaFila = fila + i;
      const nuevaColumna = columna + j;
      if (
        nuevaFila >= 0 &&
        nuevaFila < filas &&
        nuevaColumna >= 0 &&
        nuevaColumna < columnas &&
        !tablero[nuevaFila][nuevaColumna].revelada
      ) {
        revelarCelda(nuevaFila, nuevaColumna);
      }
    }
  }
}

// Verificar si el jugador ha ganado
function verificarVictoria() {
  const totalCeldas = filas * columnas;
  const celdasSinMinas = totalCeldas - minas;
  if (celdasReveladas === celdasSinMinas) {
    alert("¡Felicidades! Has ganado el juego.");

    // Desactivar todas las celdas y remover banderas
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        const celda = document.querySelector(
          `[data-fila="${i}"][data-columna="${j}"]`
        );

        // Remover banderas y desactivar eventos
        celda.classList.remove("bandera");
        celda.removeEventListener("click", manejarPrimerMovimiento);
        celda.removeEventListener("contextmenu", manejarBandera);
      }
    }
  }
}

// Event Listener para el cambio de dificultad
selectDificultad.addEventListener("change", configurarDificultad);
