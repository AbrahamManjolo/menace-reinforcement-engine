// Streamlined MENACE State Engine (1st, 3rd, 5th, 7th move matchboxes only)
var menace = {
    "boxes": {},
    "start": [8, 4, 2, 1], // Default starting beads for 1st, 3rd, 5th, 7th moves
    "incentives": [2, 4, -2], // Draw, Win, Lose incentives
    "moves": [] // Moves committed during the active game round
};

var gameMode = "play"; // default mode
var wins_each = [0, 0, 0]; // Draws, MENACE Wins, Opponent Wins
var board = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0=Empty, 1=MENACE(O), 2=Opponent(X)
var no_winner = true;
var pieces = ["", "◯", "×"];
var said = [];

// Win Conditions
var pwns = [
    [0,1,2], [3,4,5], [6,7,8], // Rows
    [0,3,6], [1,4,7], [2,5,8], // Columns
    [0,4,8], [6,4,2]           // Diagonals
];

// Board Rotations for Symmetry Configuration
var rotations = [
    [0,1,2,3,4,5,6,7,8], [0,3,6,1,4,7,2,5,8], [6,3,0,7,4,1,8,5,2],
    [6,7,8,3,4,5,0,1,2], [8,7,6,5,4,3,2,1,0], [8,5,2,7,4,1,6,3,0],
    [2,5,8,1,4,7,0,3,6], [2,1,0,5,4,3,8,7,6]
];

// Global Tracking Variables for Analytics
var gameHistoryCounter = 0;
var graphInstance = null;
var chartDataX = [0]; // Games Played
var chartDataY = [0]; // Bead balance value tracking
var recentResults = []; // Stores recent form array

// Initialize and Setup on window execution
window.onload = function() {
    initializeMatchboxes();
    initializeProgressChart(); // Set up Chart.js instance
    resetGame();
};

function setMode(mode) {
    gameMode = mode;
    var speedDiv = document.getElementById("speeddiv");
    if (mode === "train") {
        speedDiv.style.display = "block";
        if (no_winner) playOpponent();
    } else {
        speedDiv.style.display = "none";
    }
}

function initializeMatchboxes() {
    // Generates standard game states observed within your fixed 2x2 layout blocks
    const targetStates = ["000000000", "120000000", "100020000", "110022000", "210020121"];
    targetStates.forEach(state => {
        let depth = Math.floor((10 - state.split('0').length + 1) / 2);
        let defaultBeads = menace.start[depth] || 1;
        
        let boxData = Array(9).fill(defaultBeads);
        for(let i=0; i<9; i++) {
            if(state[i] !== "0") boxData[i] = 0; // Filter illegal moves
        }
        menace.boxes[state] = boxData;
        updateMatchboxUI(state);
    });
}

function resetGame() {
    menace.moves = [];
    board = Array(9).fill(0);
    no_winner = true;
    
    // Reset Board Grid Interactivity
    for (let i = 0; i < 9; i++) {
        let cell = document.getElementById("pos" + i);
        if (cell) {
            cell.innerHTML = `<form onsubmit="playHuman(${i}); return false;"><input type="submit" value=" " style="width:100%; height:100%; border:none; background:transparent; font-size:24px; cursor:pointer;"></form>`;
        }
    }
    playMenace();
}

function playMenace() {
    if (!no_winner) return;

    let emptyCount = board.filter(v => v === 0).length;
    let where = 0;

    if (emptyCount === 1) {
        where = board.indexOf(0);
    } else {
        let posStr = board.join("");
        let rotationIdx = findRotation(posStr);
        let alignedPos = applyRotation(posStr, rotations[rotationIdx]);
        
        if (!menace.boxes[alignedPos]) {
            // Safe fallback generation if new random patterns surface during training loops
            let depth = Math.floor((9 - emptyCount) / 2);
            menace.boxes[alignedPos] = Array(9).fill(menace.start[depth] || 1);
            for(let i=0; i<9; i++) if(alignedPos[i] !== "0") menace.boxes[alignedPos][i] = 0;
        }

        let plays = menace.boxes[alignedPos];
        let choice = makeWeightedChoice(plays);

        if (choice === "resign") {
            announce("MENACE Resigned.");
            handleWin(2);
            return;
        }

        // Highlight active bead pathway chosen
        let beadElement = document.getElementById(`${alignedPos}-${choice}`);
        if(beadElement) beadElement.style.color = "#FF0000";

        where = rotations[rotationIdx][choice];
        menace.moves.push([alignedPos, choice]);
    }

    board[where] = 1;
    let targetCell = document.getElementById("pos" + where);
    if(targetCell) targetCell.innerHTML = pieces[1];
    
    checkGameStatus();
    if (no_winner) playOpponent();
}

function playHuman(cellIndex) {
    if (gameMode !== "play" || board[cellIndex] !== 0 || !no_winner) return;
    executeOpponentMove(cellIndex);
}

function playOpponent() {
    if (!no_winner) return;
    if (gameMode === "play") return; // Awaiting human mouse interaction

    // Automatic Training Engine Strategy: Pure Random
    let emptyIndices = [];
    for (let i = 0; i < 9; i++) if (board[i] === 0) emptyIndices.push(i);
    
    if (emptyIndices.length > 0) {
        let randomChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        let delay = -parseInt(document.getElementById("speed_slider").value);
        setTimeout(() => { executeOpponentMove(randomChoice); }, delay / 5);
    }
}

function executeOpponentMove(index) {
    board[index] = 2;
    let cell = document.getElementById("pos" + index);
    if(cell) cell.innerHTML = pieces[2];
    
    checkGameStatus();
    if (no_winner) {
        let delay = -parseInt(document.getElementById("speed_slider").value);
        setTimeout(playMenace, gameMode === "train" ? delay / 5 : 400);
    }
}

function checkGameStatus() {
    let status = evalWinner(board);
    if (status !== false) {
        no_winner = false;
        if (status === 0) announce("It's a draw.");
        if (status === 1) announce("MENACE wins.");
        if (status === 2) announce("Opponent wins.");
        handleWin(status);
    }
}

function handleWin(result) {
    // Reward or Reinforce Path Behaviours
    menace.moves.forEach(move => {
        let [pos, choice] = move;
        let change = menace.incentives[result];
        menace.boxes[pos][choice] = Math.max(0, menace.boxes[pos][choice] + change);
        updateMatchboxUI(pos);
    });

    // Tracking Metrics
    wins_each[result]++;
    document.getElementById("dis" + result).innerHTML = wins_each[result];

    // Trigger Visual Metrics Logs
    logLearningMetrics(); 
    trackRecentForm(result);

    let delay = -parseInt(document.getElementById("speed_slider").value);
    setTimeout(resetGame, gameMode === "train" ? delay : 1200);
}

// Logic / Math Helpers
function makeWeightedChoice(weights) {
    let sum = weights.reduce((a, b) => a + b, 0);
    if (sum === 0) return "resign";
    let rand = Math.floor(Math.random() * sum);
    let runningSum = 0;
    for (let i = 0; i < weights.length; i++) {
        runningSum += weights[i];
        if (rand < runningSum) return i;
    }
    return "resign";
}

function evalWinner(b) {
    for (let i = 0; i < pwns.length; i++) {
        if (b[pwns[i][0]] !== 0 && b[pwns[i][0]] === b[pwns[i][1]] && b[pwns[i][1]] === b[pwns[i][2]]) {
            return b[pwns[i][0]];
        }
    }
    if (b.filter(v => v === 0).length === 0) return 0; // Draw
    return false;
}

function applyRotation(pos, rot) {
    let out = "";
    for (let i = 0; i < 9; i++) out += pos[rot[i]];
    return out;
}

function findRotation(pos) {
    let maxStr = "-1";
    let matchedIndex = 0;
    for (let i = 0; i < rotations.length; i++) {
        let candidate = applyRotation(pos, rotations[i]);
        if (candidate > maxStr) {
            maxStr = candidate;
            matchedIndex = i;
        }
    }
    return matchedIndex;
}

function announce(msg) {
    said.unshift(msg);
    if (said.length > 5) said.pop();
    document.getElementById("list_here").innerHTML = said.join("<br />");
}

function updateMatchboxUI(key) {
    let container = document.getElementById("board" + key);
    if (!container) return;
    
    let html = `<center><table class="board">`;
    for (let i = 0; i < 9; i++) {
        if (i % 3 === 0) html += `<tr>`;
        if (key[i] === "0") {
            html += `<td id="${key}-${i}" class="p${i} num">${menace.boxes[key][i]}</td>`;
        } else {
            html += `<td class="p${i}">${pieces[parseInt(key[i])]}</td>`;
        }
        if (i % 3 === 2) html += `</tr>`;
    }
    html += `</table></center>`;
    container.innerHTML = html;
}

// Initialize the visual graph canvas structure
function initializeProgressChart() {
    var ctx = document.getElementById('plot_here').getContext('2d');
    graphInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartDataX,
            datasets: [{
                label: "Opening Box Bead Delta",
                data: chartDataY,
                borderColor: '#0284c7',
backgroundColor: 'rgba(2, 132, 199, 0.05)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: function(context) {
                    return context.chart.data.labels.length > 100 ? 0 : 2;
                }
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Number of Games Played' } },
                y: { title: { display: true, text: 'Bead Delta Balance (First Box)' } }
            }
        }
    });
}

function logLearningMetrics() {
    gameHistoryCounter++;
    
    let totalOpeningBeads = 0;
    if (menace.boxes["000000000"]) {
        totalOpeningBeads = menace.boxes["000000000"].reduce((a, b) => a + b, 0);
    }
    
    let beadDeltaValue = totalOpeningBeads - 72;

    chartDataX.push(gameHistoryCounter);
    chartDataY.push(beadDeltaValue);

    if (graphInstance) {
        graphInstance.update('none');
    }
    
    updateDifficultyBadge();
}

function updateDifficultyBadge() {
    let badge = document.getElementById("ai-rank");
    if (!badge) return;
    
    if (gameHistoryCounter <= 25) {
        badge.innerHTML = "Rank: 👶 Clueless beginner";
        badge.style.backgroundColor = "#95a5a6";
    } else if (gameHistoryCounter <= 75) {
        badge.innerHTML = "Rank: 👦 Schoolyard Amateur";
        badge.style.backgroundColor = "#e67e22";
    } else if (gameHistoryCounter <= 150) {
        badge.innerHTML = "Rank: ⚔️ Defensive ";
        badge.style.backgroundColor = "#d35400";
    } else if (gameHistoryCounter <= 300) {
        badge.innerHTML = "Rank: 🦾 Strategic Competitor";
        badge.style.backgroundColor = "#3498db";
    } else if (gameHistoryCounter <= 500) {
        badge.innerHTML = "Rank: 🎴 Tactical";
        badge.style.backgroundColor = "#2980b9";
    } else if (gameHistoryCounter <= 800) {
        badge.innerHTML = "Rank: 👑 Calculated Monarch";
        badge.style.backgroundColor = "#9b59b6";
    } else {
        badge.innerHTML = "Rank: 🧠 Master";
        badge.style.backgroundColor = "#f1c40f";
    }
}

function trackRecentForm(result) {
    let performanceScore = (result === 1 || result === 0) ? 1 : 0;
    
    recentResults.push(performanceScore);
    if (recentResults.length > 20) {
        recentResults.shift();
    }
    
    let optimalGames = recentResults.reduce((a, b) => a + b, 0);
    let masterEfficiency = Math.round((optimalGames / recentResults.length) * 100);
    
    let efficiencyEl = document.getElementById("efficiency-rating");
    if (efficiencyEl) {
        efficiencyEl.innerHTML = `AI Efficiency: ${masterEfficiency}%`;
    }
}
// Toggle Visibility Handler for the Top Right Context Panel
function toggleAboutDropdown() {
    var dropdownPanel = document.getElementById("project-about-dropdown");
    if (!dropdownPanel) return;
    
    // Toggle the hidden panel class
    dropdownPanel.classList.toggle("hidden-panel");
}
// Specialized Visual Toggle Manager for Glass Button Segments
function switchEngineMode(targetMode) {
    // 1. Fire original state adjustments
    setMode(targetMode);
    
    // 2. Refresh active class tags
    let playLabel = document.getElementById("label-play");
    let trainLabel = document.getElementById("label-train");
    
    if(targetMode === "play") {
        playLabel.classList.add("active-mode");
        trainLabel.classList.remove("active-mode");
    } else {
        trainLabel.classList.add("active-mode");
        playLabel.classList.remove("active-mode");
    }
}
// Dynamic loading sequence execution controller
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        let loadingOverlay = document.getElementById("loading-screen");
        
        if (loadingOverlay) {
            // Apply fluid fade transitions
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.pointerEvents = 'none';
            
            // Allow the overlay element to fade completely before dropping visibility
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                
                // Unveil normal interaction dashboard configurations safely
                document.querySelectorAll('.hidden-content').forEach(element => {
                    element.classList.add('visible-content');
                });
            }, 600);
        }
    }, 5000); // 5000ms matching your target scale requirements
});