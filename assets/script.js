// Global configuration values for the game
const CONFIG = {
    GRID_SIZE: 12,          // Number of rows and columns (12x12 grid)
    DEFAULT_LENGTH: 8,      // Default length of the path to memorize
    DISPLAY_TIME: 2000,     // How long the path is shown (in milliseconds)
    CELL_COUNT: 144         // Total number of tiles (12 * 12)
};

// DOM elements
const grid = document.getElementById('grid');
const startBtn = document.getElementById('start-btn');
const statusMsg = document.getElementById('status-message');

// Game state variables
let gamePath = [];         // The randomly generated correct path
let userPath = [];         // The path entered by the user
let tiles = [];            // Array holding all tile elements
let isShowingPath = false; // Prevents clicking while the path is displayed

// Creates the grid and initializes each tile
function createGrid() {
    grid.innerHTML = '';   // Clear any existing tiles
    tiles = [];            // Reset tile array

    for (let i = 0; i < CONFIG.CELL_COUNT; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');   // Apply tile styling
        tile.dataset.index = i;       // Store tile index for reference

        // Handle user clicking a tile
        tile.addEventListener('click', () => handleTileClick(i));

        grid.appendChild(tile);
        tiles.push(tile);
    }
}

// Generates a random valid path through neighboring tiles
function generatePath(length = CONFIG.DEFAULT_LENGTH) {
    const path = [];

    // Choose a random starting tile
    let current = Math.floor(Math.random() * CONFIG.CELL_COUNT);
    path.push(current);

    // Continue adding neighboring tiles until path reaches desired length
    while (path.length < length) {
        const neighbors = getValidNeighbors(current);

        // Randomly select a valid neighbor
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        path.push(next);
        current = next;
    }

    return path;
}

// Returns valid neighboring tile indices (up, down, left, right)
function getValidNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / CONFIG.GRID_SIZE);
    const col = index % CONFIG.GRID_SIZE;

    // Check each direction while staying inside the grid
    if (row > 0) neighbors.push(index - CONFIG.GRID_SIZE);                 // Up
    if (row < CONFIG.GRID_SIZE - 1) neighbors.push(index + CONFIG.GRID_SIZE); // Down
    if (col > 0) neighbors.push(index - 1);                                // Left
    if (col < CONFIG.GRID_SIZE - 1) neighbors.push(index + 1);             // Right

    return neighbors;
}

// Starts a new game round
async function startGame() {
    userPath = [];   // Reset user input

    // Remove any previous visual indicators
    tiles.forEach(t => t.classList.remove('active', 'wrong'));

    // Generate a new path (use input length or default)
    gamePath = generatePath(
        parseInt(document.getElementById('length').value) || CONFIG.DEFAULT_LENGTH
    );

    // Display the full path to the player
    await showPathAllAtOnce();
}

// Shows the entire path at once for memorization
async function showPathAllAtOnce() {
    isShowingPath = true;
    statusMsg.innerText = "Memorize the path!";

    // Highlight all tiles in the path
    gamePath.forEach(index => tiles[index].classList.add('active'));

    // Wait for the display duration
    await new Promise(r => setTimeout(r, CONFIG.DISPLAY_TIME));

    // Remove highlights
    gamePath.forEach(index => tiles[index].classList.remove('active'));

    isShowingPath = false;
    statusMsg.innerText = "Your turn! Replicate the sequence.";
}

// Handles user clicking a tile
function handleTileClick(index) {
    // Ignore clicks while showing path or if no game is active
    if (isShowingPath || gamePath.length === 0) return;

    // Determine the expected next tile in the sequence
    const expectedIndex = gamePath[userPath.length];

    if (index === expectedIndex) {
        // Correct tile clicked
        tiles[index].classList.add('active');
        userPath.push(index);

        // Check if the full path has been successfully completed
        if (userPath.length === gamePath.length) {
            statusMsg.innerText = "Success! Path completed.";
        }
    } else {
        // Incorrect tile clicked
        tiles[index].classList.add('wrong');
        statusMsg.innerText = "Incorrect sequence. Try again!";
        gamePath = []; // End the current game
    }
}

// Start button event listener
startBtn.addEventListener('click', startGame);

// Initialize the grid on page load
createGrid();
