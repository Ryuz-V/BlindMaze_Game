// Game State
const gameState = {
    username: '',
    stage: 1,
    lives: 3,
    score: 0,
    isPlaying: false,
    isMemorizing: true,
    memorizingTime: 5,
    movingTime: 15,
    currentTime: 5,
    timerInterval: null,
    playerPosition: { row: 0, col: 0 },
    startPosition: { row: 0, col: 0 },
    finishPosition: { row: 0, col: 0 },
    maze: [],
    walls: [],
    hintUsed: false,
    gameOver: false,
    mazeSize: 12,
    wallPercentage: 0.45,
    moveCount: 0
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

// Tambahkan di bagian awal script.js setelah gameState
const backgroundMusic = document.getElementById('background-music');

// Tambahkan event listener untuk Play button
playBtn.addEventListener('click', function() {
    startGame();
    // Coba mainkan musik setelah user interaction
    playBackgroundMusic();
});

// Fungsi untuk memainkan musik
function playBackgroundMusic() {
    // Reset musik ke awal
    backgroundMusic.currentTime = 0;
    
    // Coba play
    const playPromise = backgroundMusic.play();
    
    // Handle autoplay restrictions
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay prevented:", error);
            // Tampilkan instruksi untuk user
            alert("Music autoplay was blocked. Click anywhere on the page to enable music, then start the game again.");
            
            // Tambahkan event listener untuk interaksi user
            document.addEventListener('click', enableMusicOnInteraction, { once: true });
        });
    }
}

// Fungsi untuk mengaktifkan musik setelah interaksi
function enableMusicOnInteraction() {
    backgroundMusic.play().then(() => {
        console.log("Music enabled after user interaction");
    }).catch(error => {
        console.log("Still cannot play music:", error);
    });
}

// Tambahkan juga di startGame function
function startGame() {
    if (!gameState.username) return;
    
    // Coba mainkan musik lagi
    playBackgroundMusic();
    
    // ... kode yang ada ...
}

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
    gameState.moveCount = 0;
    
    // Buat maze 12x12
    for (let row = 0; row < gameState.mazeSize; row++) {
        gameState.maze[row] = [];
        for (let col = 0; col < gameState.mazeSize; col++) {
            gameState.maze[row][col] = {
                isWall: false,
                isStart: false,
                isFinish: false,
                isPlayer: false,
            };
        }
    }
    
    // Generate start position - tidak selalu di kolom pertama
    const startCol = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 3);
    const startRow = Math.floor(Math.random() * gameState.mazeSize);
    gameState.startPosition = { row: startRow, col: startCol };
    gameState.maze[startRow][startCol].isStart = true;
    
    // Generate finish position - tidak selalu di kolom terakhir
    const finishCol = Math.random() < 0.7 ? gameState.mazeSize - 1 : 
                     gameState.mazeSize - 1 - Math.floor(Math.random() * 3);
    const finishRow = Math.floor(Math.random() * gameState.mazeSize);
    gameState.finishPosition = { row: finishRow, col: finishCol };
    gameState.maze[finishRow][finishCol].isFinish = true;

    // Set player position
    gameState.playerPosition = { row: startRow, col: startCol };
    gameState.maze[startRow][startCol].isPlayer = true;

    // Generate banyak dinding (45%)
    const totalCells = gameState.mazeSize * gameState.mazeSize;
    const wallCount = Math.floor(totalCells * gameState.wallPercentage);
    generateValidWalls(startRow, startCol, finishRow, finishCol, wallCount);

    // Render maze
    renderMaze();
}

// Generate walls that don't block the path
function generateValidWalls(startRow, startCol, finishRow, finishCol, wallCount) {
    // Create a copy of maze for pathfinding
    const tempMaze = JSON.parse(JSON.stringify(gameState.maze));
    
    // First, ensure a clear path exists (simple algorithm)
    // Create a winding path from start to finish
    let currentRow = startRow;
    let currentCol = startCol;
    const path = [];
    
    // First move from start column to column 9 (mendekati finish)
    while (currentCol < 9) {
        path.push({ row: currentRow, col: currentCol });
        
        // Sometimes move vertically to create a winding path
        if (Math.random() < 0.3 && currentRow > 0 && currentRow < gameState.mazeSize - 1) {
            currentRow += Math.random() < 0.5 ? 1 : -1;
        } else {
            currentCol++;
        }
    }
    
    // Then move vertically to finish row
    while (currentRow !== finishRow) {
        path.push({ row: currentRow, col: currentCol });
        if (currentRow < finishRow) currentRow++;
        else if (currentRow > finishRow) currentRow--;
    }
    
    // Finally move to finish column
    while (currentCol !== finishCol) {
        path.push({ row: currentRow, col: currentCol });
        if (currentCol < finishCol) currentCol++;
        else if (currentCol > finishCol) currentCol--;
    }
    
    path.push({ row: finishRow, col: finishCol });
    
    // Mark path cells as non-walls in temp maze
    for (const cell of path) {
        tempMaze[cell.row][cell.col].isWall = false;
    }
    
    // Now add random walls, avoiding the path
    let wallsAdded = 0;
    while (wallsAdded < wallCount) {
        const row = Math.floor(Math.random() * gameState.mazeSize);
        const col = Math.floor(Math.random() * gameState.mazeSize);
        
        // Jangan tempatkan dinding di jalur, start, atau finish
        if ((row === startRow && col === startCol) || 
            (row === finishRow && col === finishCol) ||
            path.some(cell => cell.row === row && cell.col === col)) {
            continue;
        }

        gameState.maze[row][col].isWall = true;
        gameState.walls.push({ row, col });
        wallsAdded++;
    }
}

function renderMaze() {
    // Atur grid untuk 12x12
    gameBoard.style.gridTemplateColumns = `repeat(${gameState.mazeSize}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${gameState.mazeSize}, 1fr)`;
    gameBoard.style.width = '480px'; // 12 * 40px
    gameBoard.style.height = '480px';
    
    for (let row = 0; row < gameState.mazeSize; row++) {
        for (let col = 0; col < gameState.mazeSize; col++) {
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
        
        // Efek visual saat waktu hampir habis
        if (gameState.currentTime <= 5) {
            timerDisplay.style.color = '#ff4d6d';
            timerDisplay.style.animation = 'pulse 0.5s infinite';
        } else {
            timerDisplay.style.color = '#fff';
            timerDisplay.style.animation = 'none';
        }
        
        if (gameState.currentTime <= 0) {
            clearInterval(gameState.timerInterval);
            
            if (gameState.isMemorizing) {
                // Switch to moving phase
                gameState.isMemorizing = false;
                gameState.currentTime = gameState.movingTime;
                timerLabel.textContent = 'Moving';
                timerDisplay.textContent = gameState.currentTime;
                timerDisplay.style.color = '#fff';
                timerDisplay.style.animation = 'none';
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
            if (newRow < gameState.mazeSize - 1) newRow++;
            break;
        case 'ArrowLeft':
            if (newCol > 0) newCol--;
            break;
        case 'ArrowRight':
            if (newCol < gameState.mazeSize - 1) newCol++;
            break;
        default:
            return;
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
    gameState.moveCount++;
    
    // Check win condition
    if (newRow === gameState.finishPosition.row && newCol === gameState.finishPosition.col) {
        handleStageComplete();
        return;
    }
    
    updateMazeDisplay();
}

// Handle stage completion
function handleStageComplete() {
    clearInterval(gameState.timerInterval);
    
    // Tampilkan statistik
    const efficiency = Math.floor((gameState.mazeSize * 2) / gameState.moveCount * 100);
    alert(`Stage Complete!\nMoves: ${gameState.moveCount}\nEfficiency: ${efficiency}%`);
    
    // Naikkan stage
    gameState.stage++;
    stageDisplay.textContent = `Stage ${gameState.stage}`;
    
    // Naikkan kesulitan sedikit
    if (gameState.stage % 3 === 0) {
        gameState.mazeSize = Math.min(gameState.mazeSize + 1, 15);
        gameState.wallPercentage = Math.min(gameState.wallPercentage + 0.02, 0.5);
        gameState.memorizingTime = Math.max(gameState.memorizingTime - 1, 3);
        gameState.movingTime = Math.max(gameState.movingTime - 2, 8);
    }
    
    // Reset untuk stage berikutnya
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
    gameState.lives = 3; // Diubah menjadi 3 sesuai dengan awal game
    gameState.score = 0;
    gameState.isPlaying = false;
    gameState.isMemorizing = true;
    gameState.memorizingTime = 5;
    gameState.movingTime = 15;
    gameState.currentTime = 5;
    gameState.mazeSize = 12;
    gameState.wallPercentage = 0.45;
    gameState.playerPosition = { row: 0, col: 0 };
    gameState.startPosition = { row: 0, col: 0 };
    gameState.finishPosition = { row: 0, col: 0 };
    gameState.maze = [];
    gameState.walls = [];
    gameState.hintUsed = false;
    gameState.gameOver = false;
    gameState.moveCount = 0;
    
    // Clear interval if exists
    clearInterval(gameState.timerInterval);
    
    // Reset UI
    usernameInput.value = '';
    playBtn.disabled = true;
}