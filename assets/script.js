// Get references to important DOM elements
const grid = document.getElementById('grid');
const startBtn = document.getElementById('start-btn');
const modeSelect = document.getElementById('mode');
const lengthSlider = document.getElementById('length');
const diffVal = document.getElementById('diff-val');
const statusMsg = document.getElementById('status-message');

// Grid is 12x12 = 144 tiles
const GRID_SIZE = 12;

// Arrays to store tile elements, the generated path, and the user's clicks
let tiles = [];
let gamePath = [];
let userPath = [];

// Prevents clicking while the path is being shown
let isShowingPath = false;


// -----------------------------
// CREATE THE 12x12 GRID
// -----------------------------
function createGrid() {
    grid.innerHTML = '';   // Clear existing tiles
    tiles = [];

    // Create 144 tiles
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.index = i; // Store tile index for reference

        // When clicked, check if it's the correct tile
        tile.addEventListener('click', () => handleTileClick(i));

        grid.appendChild(tile);
        tiles.push(tile);
    }
}


// -----------------------------
// GENERATE A PATH (SET OR RANDOM)
// -----------------------------
function generatePath() {
    const length = parseInt(lengthSlider.value);
    const path = [];
    
    // "Set" mode: straight upward path starting from tile 133
    if (modeSelect.value === 'set') {
        const start = 133;
        for (let i = 0; i < length; i++) {
            path.push(start - (i * GRID_SIZE)); // Move upward by 12 each step
        }

    // "Random" mode: random walk through adjacent tiles
    } else {
        let current = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
        path.push(current);

        // Keep adding neighbors until path reaches desired length
        while (path.length < length) {
            const neighbors = getNeighbors(current);

            // Pick a random neighbor
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];

            path.push(next);
            current = next;
        }
    }

    return path;
}


// -----------------------------
// GET VALID NEIGHBORING TILES
// -----------------------------
function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;

    // Up
    if (row > 0) neighbors.push(index - GRID_SIZE);
    // Down
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
    // Left
    if (col > 0) neighbors.push(index - 1);
    // Right
    if (col < GRID_SIZE - 1) neighbors.push(index + 1);
    
    return neighbors;
}


// -----------------------------
// SHOW THE PATH TO THE PLAYER
// -----------------------------
async function showPath() {
    isShowingPath = true;
    statusMsg.innerText = "Watch carefully...";

    // 1. Light up all tiles in the path at once
    gamePath.forEach(index => {
        tiles[index].classList.add('active');
    });

    // 2. Wait for a set amount of time (e.g., 2000ms = 2 seconds)
    const displayTime = 2000; 
    await new Promise(r => setTimeout(r, displayTime));

    // 3. Turn them all off at once
    gamePath.forEach(index => {
        tiles[index].classList.remove('active');
    });

    isShowingPath = false;
    statusMsg.innerText = "Your turn!";
}


// -----------------------------
// HANDLE PLAYER CLICKS
// -----------------------------
function handleTileClick(index) {
    // Ignore clicks while path is playing or if game hasn't started
    if (isShowingPath || gamePath.length === 0) return;

    const expectedIndex = gamePath[userPath.length]; // Next correct tile

    // Correct tile clicked
    if (index === expectedIndex) {
        tiles[index].classList.add('active');
        userPath.push(index);

        // Player completed the whole sequence
        if (userPath.length === gamePath.length) {
            statusMsg.innerText = "Perfect! Try again?";
            gamePath = []; // Reset game
        }

    // Wrong tile clicked
    } else {
        tiles[index].classList.add('wrong');
        statusMsg.innerText = "Game Over! Try again.";
        gamePath = [];

        // Remove red highlight after a moment
        setTimeout(() => tiles[index].classList.remove('wrong'), 500);
    }
}


// -----------------------------
// UPDATE SLIDER DISPLAY
// -----------------------------
lengthSlider.oninput = () => diffVal.innerText = lengthSlider.value;


// -----------------------------
// START BUTTON LOGIC
// -----------------------------
startBtn.addEventListener('click', () => {
    // Reset tile colors
    tiles.forEach(t => t.classList.remove('active', 'wrong'));

    userPath = [];
    gamePath = generatePath(); // Create new path
    showPath();                // Show it to the player
});


// -----------------------------
// INITIALIZE GAME GRID
// -----------------------------
createGrid();
