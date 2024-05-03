// Elementi dell'interfaccia utente e configurazioni iniziali
const canvas = document.getElementById("canvas");
const colorPicker = document.getElementById("colorPicker");
let pencilSize = parseInt(document.getElementById("pencilSize").value);
let isDrawing = false;
let currentTool = "pencil"; 
const canvasBackgroundColor = "white";
let undoStack = []; 
let currentUndoBatch = []; 

// Creazione della tela e inizializzazione della griglia
function createCanvas(gridSize) {
    canvas.innerHTML = "";
    canvas.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    canvas.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    for (let i = 0; i < gridSize ** 2; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.addEventListener("mousedown", startDrawing);
        cell.addEventListener("mouseup", stopDrawing);
        cell.addEventListener("mouseover", draw);
        canvas.appendChild(cell);
    }
}

// Gestione degli eventi di disegno
function startDrawing(event) {
    isDrawing = true;
    drawWithSize(event.target);
}

function stopDrawing() {
    isDrawing = false;
}

function draw(event) {
    if (isDrawing) {
        drawWithSize(event.target);
    }
}

// Applicazione del colore e memorizzazione delle modifiche
function applyTool(target, color) {
    currentUndoBatch.push({ cell: target, prevColor: target.style.backgroundColor });
    target.style.backgroundColor = color;
}

function drawWithSize(target) {
    const color = currentTool === "pencil" ? colorPicker.value : (currentTool === "eraser" ? canvasBackgroundColor : target.style.backgroundColor);
    let cellsAffected = [];
    const targetIndex = Array.from(canvas.children).indexOf(target);

    for (let i = 0; i < pencilSize; i++) {
        for (let j = 0; j < pencilSize; j++) {
            const adjacentIndex = targetIndex + i * 64 + j;
            if (adjacentIndex < canvas.children.length) {
                cellsAffected.push(canvas.children[adjacentIndex]);
            }
        }
    }

    cellsAffected.forEach(cell => applyTool(cell, color));
    undoStack.push(currentUndoBatch);
    currentUndoBatch = [];
}

// Gestione del riempimento e della cancellazione
function fillCanvas() {
    const selectedColor = colorPicker.value;
    document.querySelectorAll(".grid-cell").forEach(cell => {
        currentUndoBatch.push({ cell: cell, prevColor: cell.style.backgroundColor });
        cell.style.backgroundColor = selectedColor;
    });
    undoStack.push(currentUndoBatch);
    currentUndoBatch = [];
}

function clearCanvas() {
    const confirmation = confirm("Sei sicuro di voler cancellare tutto?");
    if (confirmation) {
        document.querySelectorAll(".grid-cell").forEach(cell => cell.style.backgroundColor = canvasBackgroundColor);
    }
}

// Gestione dell'undo e shortcut da tastiera
function undoLastAction() {
    if (undoStack.length > 0) {
        const lastChanges = undoStack.pop();
        lastChanges.forEach(change => {
            change.cell.style.backgroundColor = change.prevColor;
        });
    }
}

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        undoLastAction();
        event.preventDefault();
    }
});

// Funzioni aggiuntive per la manipolazione della tela
function toggleGrid() {
    document.querySelectorAll(".grid-cell").forEach(cell => cell.classList.toggle("show-grid"));
}

function downloadCanvas() {
    html2canvas(canvas).then((canvasSnapshot) => {
        const link = document.createElement("a");
        link.download = "pixel_art.png";
        link.href = canvasSnapshot.toDataURL("image/png");
        link.click();
    });
}

// Event listeners per gli strumenti dell'interfaccia Utente
document.getElementById("undoButton").addEventListener("click", undoLastAction);
document.getElementById("download").addEventListener("click", downloadCanvas);
document.getElementById("pencil").addEventListener("click", () => currentTool = "pencil");
document.getElementById("eraser").addEventListener("click", () => currentTool = "eraser");
document.getElementById("fill").addEventListener("click", fillCanvas);
document.getElementById("toggleGrid").addEventListener("click", toggleGrid);
document.getElementById("clearCanvas").addEventListener("click", clearCanvas);
document.getElementById("pencilSize").addEventListener("input", (e) => pencilSize = parseInt(e.target.value));
document.querySelectorAll(".color-box").forEach(box => box.addEventListener("click", () => colorPicker.value = box.getAttribute("data-color")));

// Inizializzazione della canvas e impostazione dei valori predefiniti
createCanvas(64);
document.getElementById("colorPicker").value = "#333";
document.getElementById("pencil").click(); 
