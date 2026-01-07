// Centralized game settings for easy tuning
const CONFIG = {
  GRID_SIZE: 12, // Number of cells per row/column (12x12 grid)
  DEFAULT_LENGTH: 8, // Default length of the generated path
  DISPLAY_TIME: 2000, // Time (ms) the full path remains visible
  CELL_COUNT: 144, // Total number of cells (GRID_SIZE * GRID_SIZE)
};

// ===============================
// DOM element references
// ===============================
const grid = document.getElementById("grid");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn"); // Reference for Reset Button
const statusMsg = document.getElementById("status-message");
const grid = document.getElementById('grid');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn'); // Reference for Reset Button
const statusMsg = document.getElementById('status-message');
const modal = document.getElementById("instructions-modal");
const instBtn = document.getElementById("instructions-btn");
const closeBtn = document.querySelector(".close-btn");

// ===============================
// Game state variables
// ===============================
let gamePath = []; // Stores the correct path the user must memorize
let userPath = []; // Stores the user's input path
let tiles = []; // Holds references to all grid tiles
let isShowingPath = false; // True while the path animation is playing
let isPlayerTurn = false; // True when it is specifically the user's turn to play

// Timer variables
let secondsElapsed = 0;
let timerInterval = null;

// ===============================
// Grid creation
// ===============================
function createGrid() {
  // Clear any existing grid content
  grid.innerHTML = "";
  tiles = [];

  // Create each tile dynamically
  for (let i = 0; i < CONFIG.CELL_COUNT; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");

    // Store tile index for reference
    tile.dataset.index = i;

    // Attach click handler for user interaction
    tile.addEventListener("click", () => handleTileClick(i));

    // Add tile to the grid and local array
    grid.appendChild(tile);
    tiles.push(tile);
  }
}

// ===============================
// Path generation logic
// ===============================
function generatePath(length = CONFIG.DEFAULT_LENGTH) {
  const path = [];

  // Start from a random cell within the grid
  let current = 137;
  path.push(current);

  // Continue until desired path length is reached
  while (path.length < length) {
    // Get all valid adjacent cells
    const neighbors = getValidNeighbors(current);

    // Randomly select one neighboring cell
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];

    path.push(next);
    current = next;
  }

  return path;
}

// Returns valid neighboring cells (up, down, left, right)
function getValidNeighbors(index) {
  const neighbors = [];

  // Convert linear index into row/column coordinates
  const row = Math.floor(index / CONFIG.GRID_SIZE);
  const col = index % CONFIG.GRID_SIZE;

  // Check boundaries before adding neighbors
  if (row > 0) neighbors.push(index - CONFIG.GRID_SIZE); // Up
  if (row < CONFIG.GRID_SIZE - 1) neighbors.push(index + CONFIG.GRID_SIZE); // Down
  if (col > 0) neighbors.push(index - 1); // Left
  if (col < CONFIG.GRID_SIZE - 1) neighbors.push(index + 1); // Right

  return neighbors;
}

// ===============================
// Timer Logic
// ===============================
function startTimer() {
  stopTimer(); // Ensure no duplicate timers
  secondsElapsed = 0;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    // Optional: Update a UI timer element here if desired
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ===============================
// Game start logic
// ===============================
async function startGame() {
  // Reset user progress and timer
  stopTimer();
  userPath = [];
  isPlayerTurn = false;
  grid.classList.remove("disabled"); // Ensure grid is clickable

  // Clear any previous visual states
  tiles.forEach((t) => t.classList.remove("active", "wrong"));

  // Get desired path length from user input (fallback to default)
  const lengthInput = document.getElementById("length").value;
  gamePath = generatePath(parseInt(lengthInput) || CONFIG.DEFAULT_LENGTH);

  // Show the generated path to the user
  await showPathToMemorise();
}

// ===============================
// Path display animation
// ===============================
async function showPathToMemorise() {
  isShowingPath = true;
  isPlayerTurn = false; // Ensure player cannot click during animation
  statusMsg.innerText = "Memorize the sequence...";

  // Highlight each tile in sequence with a staggered delay
  for (let i = 0; i < gamePath.length; i++) {
    setTimeout(() => {
      tiles[gamePath[i]].classList.add("active");
    }, i * 100);
  }

  // Total time = animation duration + fixed display time
  const totalWaitTime = gamePath.length * 100 + CONFIG.DISPLAY_TIME;

  // Pause execution until the path display finishes
  await new Promise((resolve) => setTimeout(resolve, totalWaitTime));

  // Remove all highlights after display ends (Reset to neutral state)
  gamePath.forEach((index) => tiles[index].classList.remove("active"));

  // Enable user interaction and start timer
  isShowingPath = false;
  isPlayerTurn = true;
  statusMsg.innerText = "Your turn! Time is ticking...";
  startTimer();
}

// ===============================
// User input handling
// ===============================
function handleTileClick(index) {
  // Ignore clicks if it's not the player's turn or path is showing
  if (!isPlayerTurn || isShowingPath) return;

  // Determine the expected tile for the current step
  const expectedIndex = gamePath[userPath.length];

  if (index === expectedIndex) {
    // Correct selection: Clicking a cell adds the next step
    tiles[index].classList.add("active"); // Selected cells show a visible trail
    userPath.push(index); // Input order is tracked

    // Check if user has completed the entire sequence
    if (userPath.length === gamePath.length) {
      stopTimer();
      statusMsg.innerText = `Perfect! Finished in ${secondsElapsed} seconds.`;
      isPlayerTurn = false;
      grid.classList.add("disabled"); // Disable clicking once complete
    }
  } else {
    // Incorrect selection
    stopTimer();
    tiles[index].classList.add("wrong");
    statusMsg.innerText = "Incorrect! Press 'Reset Attempt' or 'Start Game'.";
    isPlayerTurn = false;
    grid.classList.add("disabled"); // Disable clicking once attempt is complete
  }
}

// ===============================
// Reset Attempt Logic
// ===============================
function resetAttempt() {
  // Player can reset the current attempt without restarting the entire game
  userPath = [];
  isPlayerTurn = true;
  grid.classList.remove("disabled");
  statusMsg.innerText = "Attempt reset! Try again...";

  // Clear visual trail and errors
  tiles.forEach((t) => t.classList.remove("active", "wrong"));

  // Restart the timer for the new attempt
  startTimer();
}

// ===============================
// Modal Logic
// ===============================
instBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
}

// ===============================
// Initialization
// ===============================
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetAttempt); // Listener for Reset Attempt
createGrid();
