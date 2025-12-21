// Game State
const gameState = {
    username: '',
    stage: 1,
    lives: 5,
    score: 0,
    isPlaying: false,
    isMemorizing: true,
    memorizingTime: 10,
    movingTime: 20,
    currentTime: 10,
    timerInterval: null,
    playerPosition: { row: 0, col: 0 },
    startPosition: { row: 0, col: 0 },
    finishPosition: { row: 0, col: 0 },
    maze: [],
    walls: [],
    hintUsed: false,
    gameOver: false
};

// DOM Elements
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username');
const playBtn = document.getElementById('play-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const instructionsModal = document.getElementById('instructions-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
const gameOverModal = document.getElementById('game-over-modal');
const playerNameDisplay = document.getElementById('player-name-display');
const livesDisplay = document.getElementById('lives');
const stageDisplay = document.getElementById('stage');
const timerLabel = document.getElementById('timer-label');
const timerDisplay = document.getElementById('timer');
const gameBoard = document.getElementById('game-board');
const hintBtn = document.getElementById('hint-btn');
const saveScoreBtn = document.getElementById('save-score-btn');
const restartBtn = document.getElementById('restart-btn');
const goUsername = document.getElementById('go-username');
const goStage = document.getElementById('go-stage');
const leaderboardBody = document.getElementById('leaderboard-body');
const emptyLeaderboard = document.getElementById('empty-leaderboard');

// Close buttons for modals
const closeButtons = document.querySelectorAll('.close-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Username input validation
    usernameInput.addEventListener('input', function() {
        gameState.username = this.value.trim();
        playBtn.disabled = !gameState.username;
    });
    
    // Play button
    playBtn.addEventListener('click', startGame);
    
    // Instructions button
    instructionsBtn.addEventListener('click', function() {
        instructionsModal.classList.add('active');
    });
    
    // Leaderboard button
    leaderboardBtn.addEventListener('click', function() {
        showLeaderboard();
        leaderboardModal.classList.add('active');
    });
    
    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            instructionsModal.classList.remove('active');
            leaderboardModal.classList.remove('active');
        });
    });
    
    // Hint button
    hintBtn.addEventListener('click', useHint);
    
    // Save score button
    saveScoreBtn.addEventListener('click', saveScore);
    
    // Restart button
    restartBtn.addEventListener('click', restartGame);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === instructionsModal) {
            instructionsModal.classList.remove('active');
        }
        if (event.target === leaderboardModal) {
            leaderboardModal.classList.remove('active');
        }
        if (event.target === gameOverModal) {
            gameOverModal.classList.remove('active');
        }
    });
    
    // Initialize leaderboard display
    showLeaderboard();
});

// Start the game
function startGame() {
    if (!gameState.username) return;
    
    // Update display
    playerNameDisplay.textContent = gameState.username;
    livesDisplay.textContent = gameState.lives;
    stageDisplay.textContent = `Stage ${gameState.stage}`;
    
    // Switch screens
    titleScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    // Initialize game state
    gameState.isPlaying = true;
    gameState.isMemorizing = true;
    gameState.hintUsed = false;
    gameState.currentTime = gameState.memorizingTime;
    timerLabel.textContent = 'Memorizing';
    timerDisplay.textContent = gameState.currentTime;
    hintBtn.disabled = true;
    hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Hint (1 left)';
    
    // Generate maze
    generateMaze();
    
    // Start memorizing phase
    startTimer();
}

// Generate maze with walls
function generateMaze() {
    // Clear game board
    gameBoard.innerHTML = '';
    gameState.maze = [];
    gameState.walls = [];
    
    // Create empty 10x10 maze
    for (let row = 0; row < 10; row++) {
        gameState.maze[row] = [];
        for (let col = 0; col < 10; col++) {
            gameState.maze[row][col] = {
                isWall: false,
                isStart: false,
                isFinish: false,
                isPlayer: false
            };
        }
    }
    
    // Generate random start position (leftmost column)
    const startRow = Math.floor(Math.random() * 10);
    gameState.startPosition = { row: startRow, col: 0 };
    gameState.maze[startRow][0].isStart = true;
    
    // Generate random finish position (rightmost column)
    const finishRow = Math.floor(Math.random() * 10);
    gameState.finishPosition = { row: finishRow, col: 9 };
    gameState.maze[finishRow][9].isFinish = true;
    
    // Set player position to start
    gameState.playerPosition = { row: startRow, col: 0 };
    gameState.maze[startRow][0].isPlayer = true;
    
    // Generate walls (30-40% of cells)
    const totalCells = 100;
    const wallCount = Math.floor(totalCells * (0.3 + Math.random() * 0.1));
    
    // Generate random walls, ensuring a path exists
    generateValidWalls(startRow, finishRow, wallCount);
    
    // Render the maze
    renderMaze();
}

// Generate walls that don't block the path
function generateValidWalls(startRow, finishRow, wallCount) {
    // Create a copy of maze for pathfinding
    const tempMaze = JSON.parse(JSON.stringify(gameState.maze));
    
    // First, ensure a clear path exists (simple algorithm)
    // Create a winding path from start to finish
    let currentRow = startRow;
    let currentCol = 0;
    const path = [];
    
    while (currentCol < 9 || currentRow !== finishRow) {
        path.push({ row: currentRow, col: currentCol });
        
        // Move toward finish
        if (currentCol < 9) {
            // Sometimes move vertically to create a winding path
            if (Math.random() < 0.3 && currentRow > 0 && currentRow < 9) {
                currentRow += Math.random() < 0.5 ? 1 : -1;
            } else {
                currentCol++;
            }
        } else {
            // We're in the last column, move vertically to finish row
            if (currentRow < finishRow) currentRow++;
            else if (currentRow > finishRow) currentRow--;
        }
    }
    
    path.push({ row: finishRow, col: 9 });
    
    // Mark path cells as non-walls in temp maze
    for (const cell of path) {
        tempMaze[cell.row][cell.col].isWall = false;
    }
    
    // Now add random walls, avoiding the path
    let wallsAdded = 0;
    while (wallsAdded < wallCount) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        
        // Don't place walls on start, finish, or path cells
        if ((row === startRow && col === 0) || 
            (row === finishRow && col === 9) ||
            path.some(cell => cell.row === row && cell.col === col)) {
            continue;
        }
        
        // Check if adding this wall would block the path
        tempMaze[row][col].isWall = true;
        gameState.walls.push({ row, col });
        wallsAdded++;
    }
    
    // Update the actual maze with walls
    for (const wall of gameState.walls) {
        gameState.maze[wall.row][wall.col].isWall = true;
    }
}

// Render maze to the game board
function renderMaze() {
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const cellData = gameState.maze[row][col];
            
            if (cellData.isStart) {
                cell.classList.add('start');
            } else if (cellData.isFinish) {
                cell.classList.add('finish');
            } else if (cellData.isPlayer) {
                cell.classList.add('player');
            } else if (cellData.isWall && gameState.isMemorizing) {
                cell.classList.add('wall');
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

// Start the timer
function startTimer() {
    clearInterval(gameState.timerInterval);
    
    gameState.timerInterval = setInterval(function() {
        gameState.currentTime--;
        timerDisplay.textContent = gameState.currentTime;
        
        if (gameState.currentTime <= 0) {
            clearInterval(gameState.timerInterval);
            
            if (gameState.isMemorizing) {
                // Switch to moving phase
                gameState.isMemorizing = false;
                gameState.currentTime = gameState.movingTime;
                timerLabel.textContent = 'Moving';
                timerDisplay.textContent = gameState.currentTime;
                hintBtn.disabled = false;
                
                // Hide walls
                updateMazeDisplay();
                
                // Start moving timer
                startTimer();
            } else {
                // Time's up in moving phase
                handleGameLoss('Time\'s up!');
            }
        }
    }, 1000);
}

// Update maze display (hide/show walls)
function updateMazeDisplay() {
    const cells = document.querySelectorAll('.cell');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Reset classes
        cell.className = 'cell';
        
        const cellData = gameState.maze[row][col];
        
        if (cellData.isStart) {
            cell.classList.add('start');
        } else if (cellData.isFinish) {
            cell.classList.add('finish');
        } else if (cellData.isPlayer) {
            cell.classList.add('player');
        } else if (cellData.isWall && gameState.isMemorizing) {
            cell.classList.add('wall');
        }
    });
}

// Handle keyboard input
function handleKeyPress(event) {
    if (!gameState.isPlaying || gameState.isMemorizing || gameState.gameOver) return;
    
    let newRow = gameState.playerPosition.row;
    let newCol = gameState.playerPosition.col;
    
    switch(event.key) {
        case 'ArrowUp':
            if (newRow > 0) newRow--;
            break;
        case 'ArrowDown':
            if (newRow < 9) newRow++;
            break;
        case 'ArrowLeft':
            if (newCol > 0) newCol--;
            break;
        case 'ArrowRight':
            if (newCol < 9) newCol++;
            break;
        default:
            return; // Ignore other keys
    }
    
    // Check if move is valid
    if (gameState.maze[newRow][newCol].isWall) {
        handleGameLoss('You hit a wall!');
        return;
    }
    
    // Update player position
    gameState.maze[gameState.playerPosition.row][gameState.playerPosition.col].isPlayer = false;
    gameState.playerPosition = { row: newRow, col: newCol };
    gameState.maze[newRow][newCol].isPlayer = true;
    
    // Check if player reached finish
    if (newRow === gameState.finishPosition.row && newCol === gameState.finishPosition.col) {
        handleStageComplete();
        return;
    }
    
    // Update display
    updateMazeDisplay();
}

// Handle stage completion
function handleStageComplete() {
    clearInterval(gameState.timerInterval);
    
    alert(`Congratulations! You completed Stage ${gameState.stage}!`);
    
    // Move to next stage
    gameState.stage++;
    stageDisplay.textContent = `Stage ${gameState.stage}`;
    
    // Reset for next stage
    gameState.isMemorizing = true;
    gameState.currentTime = gameState.memorizingTime;
    timerLabel.textContent = 'Memorizing';
    timerDisplay.textContent = gameState.currentTime;
    gameState.hintUsed = false;
    hintBtn.disabled = true;
    hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Hint (1 left)';
    
    // Generate new maze
    generateMaze();
    
    // Start timer
    startTimer();
}

// Handle game loss (hit wall or timeout)
function handleGameLoss(message) {
    clearInterval(gameState.timerInterval);
    
    alert(`${message} You lost a life.`);
    
    // Reduce lives
    gameState.lives--;
    livesDisplay.textContent = gameState.lives;
    
    if (gameState.lives <= 0) {
        // Game over
        gameOver();
    } else {
        // Restart current stage
        gameState.isMemorizing = true;
        gameState.currentTime = gameState.memorizingTime;
        timerLabel.textContent = 'Memorizing';
        timerDisplay.textContent = gameState.currentTime;
        gameState.hintUsed = false;
        hintBtn.disabled = true;
        hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Hint (1 left)';
        
        // Regenerate maze for current stage
        generateMaze();
        
        // Start timer
        startTimer();
    }
}

// Use hint
function useHint() {
    if (gameState.hintUsed || gameState.isMemorizing) return;
    
    gameState.hintUsed = true;
    hintBtn.disabled = true;
    hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Hint (used)';
    
    // Show walls for 1 second
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (gameState.maze[row][col].isWall) {
            cell.classList.add('wall');
        }
    });
    
    // Hide walls after 1 second
    setTimeout(() => {
        if (!gameState.isMemorizing) {
            updateMazeDisplay();
        }
    }, 1000);
}

// Game over
function gameOver() {
    gameState.isPlaying = false;
    gameState.gameOver = true;
    
    // Update game over modal
    goUsername.textContent = gameState.username;
    goStage.textContent = `Stage ${gameState.stage}`;
    
    // Show game over modal
    gameOverModal.classList.add('active');
}

// Save score to leaderboard
function saveScore() {
    const scores = JSON.parse(localStorage.getItem('blindMazeScores')) || [];
    
    const newScore = {
        username: gameState.username,
        stage: gameState.stage,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().getTime()
    };
    
    scores.push(newScore);
    
    // Sort by stage (descending) and then by date
    scores.sort((a, b) => {
        if (b.stage !== a.stage) return b.stage - a.stage;
        return b.timestamp - a.timestamp;
    });
    
    // Keep only top 10 scores
    const topScores = scores.slice(0, 10);
    
    localStorage.setItem('blindMazeScores', JSON.stringify(topScores));
    
    // Update leaderboard display
    showLeaderboard();
    
    // Close game over modal
    gameOverModal.classList.remove('active');
    
    // Return to title screen
    gameScreen.classList.remove('active');
    titleScreen.classList.add('active');
    
    // Reset game state
    resetGameState();
}

// Show leaderboard
function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('blindMazeScores')) || [];
    
    if (scores.length === 0) {
        emptyLeaderboard.style.display = 'block';
        leaderboardBody.innerHTML = '';
    } else {
        emptyLeaderboard.style.display = 'none';
        
        let leaderboardHTML = '';
        scores.forEach((score, index) => {
            leaderboardHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${score.username}</td>
                    <td>${score.stage}</td>
                    <td>${score.date}</td>
                </tr>
            `;
        });
        
        leaderboardBody.innerHTML = leaderboardHTML;
    }
}

// Restart game
function restartGame() {
    gameOverModal.classList.remove('active');
    gameScreen.classList.remove('active');
    titleScreen.classList.add('active');
    
    // Reset game state
    resetGameState();
}

// Reset game state
function resetGameState() {
    gameState.username = '';
    gameState.stage = 1;
    gameState.lives = 5;
    gameState.score = 0;
    gameState.isPlaying = false;
    gameState.isMemorizing = true;
    gameState.currentTime = 10;
    gameState.playerPosition = { row: 0, col: 0 };
    gameState.startPosition = { row: 0, col: 0 };
    gameState.finishPosition = { row: 0, col: 0 };
    gameState.maze = [];
    gameState.walls = [];
    gameState.hintUsed = false;
    gameState.gameOver = false;
    
    // Clear interval if exists
    clearInterval(gameState.timerInterval);
    
    // Reset UI
    usernameInput.value = '';
    playBtn.disabled = true;
}