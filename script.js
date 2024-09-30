let canMine = true; // Track if the player can mine coins
let totalCoins = 0;
let coinsMined = 0;
let totalMinedCoins = 0; // New variable to keep track of total mined coins from all activities
let invitationsSent = 0;
let tasksCompleted = 0;
let score = 0;
let level = 1;
let timer = 60;
let powerUpActive = false;
let powerUpDuration = 5000; // 5 seconds
const invitedFriends = [];

// Load saved game state
function loadGameState() {
    const savedState = JSON.parse(localStorage.getItem('errorCoinGameState'));
    if (savedState) {
        coinsMined = savedState.coinsMined;
        totalMinedCoins = savedState.totalMinedCoins; // Load total mined coins
        invitationsSent = savedState.invitationsSent;
        tasksCompleted = savedState.tasksCompleted;
        score = savedState.score;
        level = savedState.level;
        timer = savedState.timer;
        powerUpActive = savedState.powerUpActive;
        invitedFriends.push(...savedState.invitedFriends || []);
    }
}

// Save game state
function saveGameState() {
    const gameState = {
        coinsMined,
        totalMinedCoins, // Save total mined coins
        invitationsSent,
        tasksCompleted,
        score,
        level,
        timer,
        powerUpActive,
        invitedFriends
    };
    localStorage.setItem('errorCoinGameState', JSON.stringify(gameState));
}

// Call loadGameState on start
loadGameState();

const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const coinsMinedElement = document.getElementById('coins-mined');
const tasksCompletedElement = document.getElementById('tasks-completed');
const levelElement = document.getElementById('level');
const powerUpMessage = document.getElementById('power-up-message');
const obstacleElement = document.getElementById('obstacle');
const totalMinedElement = document.getElementById('total-mined-coins');

// Update total mined coins on the UI
function updateTotalMinedCoins() {
    totalMinedElement.innerText = totalMinedCoins;
}

// Mining functionality
document.getElementById('mine-button').addEventListener('click', () => {
    let coins = 1;

    // Apply power-up if active
    if (powerUpActive) {
        coins *= 2;
        powerUpMessage.innerText = "Power-Up Active! Double Coins!";
    } else {
        powerUpMessage.innerText = "";
    }

    // Introduce obstacles
    if (Math.random() < 0.3) {
        obstacleElement.classList.remove('hidden');
        setTimeout(() => {
            obstacleElement.classList.add('hidden');
        }, 2000); // Obstacle appears for 2 seconds
    } else {
        coinsMined += coins;
        totalMinedCoins += coins; // Increment total mined coins
        score += coins * 10; // Increment score for each coin mined
        updateScore();
        coinsMinedElement.innerText = coinsMined;
        updateTotalMinedCoins();

        // Random chance to get a power-up
        if (Math.random() < 0.2) {
            activatePowerUp();
        }

        // Check level up
        if (coinsMined >= level * 15) { // Increase coins needed to level up
            level++;
            levelElement.innerText = level;
            // Reduce time limit for higher levels
            timer = Math.max(30, timer - 5); // Min time limit is 30 seconds
        }
    }
    saveGameState(); // Save game state after mining
});

// Invitation functionality
document.getElementById('invite-button').addEventListener('click', () => {
    const friendName = prompt("Enter your friend's name:");
    if (friendName) {
        // Increment invitations sent
        invitationsSent++;
        document.getElementById('invitations-sent').innerText = invitationsSent;

        // Create an invitation link
        const invitationLink = `https://ErrorCoin/invite?ref=${generateInviteCode()}`;
        
        // Display the invitation link
        alert(`Invite your friend using this link: ${invitationLink}`);

        // Add to invited friends list
        invitedFriends.push(friendName);
        updateInvitedFriendsList();

        // Update score and mined coins for each invitation sent
        let inviteCoins = 5; // Earn 5 coins per invitation
        totalMinedCoins += inviteCoins;
        score += inviteCoins * 10; // Increment score for each invitation sent
        updateScore();
        updateTotalMinedCoins(); // Update total mined coins
        saveGameState(); // Save game state after inviting
    }
});

// Function to generate a unique invitation code
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 10); // Generate a random string as an invite code
}

// Update invited friends list
function updateInvitedFriendsList() {
    const list = document.getElementById('invited-friends-list');
    list.innerHTML = ''; // Clear current list
    invitedFriends.forEach(friend => {
        const listItem = document.createElement('li');
        listItem.textContent = friend;
        list.appendChild(listItem);
    });
}


// Task completion functionality
document.querySelectorAll('.complete-task-button').forEach(button => {
    button.addEventListener('click', () => {
        // Redirect to the specified URL
        const taskUrl = button.getAttribute('data-url');
        if (taskUrl) {
            window.location.href = taskUrl;
        }

        // Increment task count and coins
        tasksCompleted++;
        tasksCompletedElement.innerText = tasksCompleted;

        // Add points/coins for completing tasks
        let coinsForTask = 10; // Define how many coins are earned per task
        coinsMined += coinsForTask;
        totalMinedCoins += coinsForTask;
        coinsMinedElement.innerText = coinsMined;

        // Disable the button after completion
        button.disabled = true;
        
        // Update score
        score += coinsForTask;
        updateScore();
        saveGameState(); // Save game state after task completion
    });
});

const TASK_COOLDOWN_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Load saved task state and disable buttons if necessary
function loadTaskCompletionState() {
    document.querySelectorAll('.complete-task-button').forEach(button => {
        const taskKey = button.getAttribute('data-task');
        const lastCompletedTime = localStorage.getItem(`taskCompleted_${taskKey}`);
        
        if (lastCompletedTime) {
            const timeElapsed = Date.now() - parseInt(lastCompletedTime, 10);
            if (timeElapsed < TASK_COOLDOWN_TIME) {
                // Disable the button if 24 hours have not passed
                button.disabled = true;
                const remainingTime = Math.ceil((TASK_COOLDOWN_TIME - timeElapsed) / 3600000); // Remaining hours
                button.innerText = `Complete (New in ${remainingTime} hours)`;
            }
        }
    });
}

// Save task completion time in localStorage
function saveTaskCompletion(taskKey) {
    localStorage.setItem(`taskCompleted_${taskKey}`, Date.now().toString());
}

// Event listeners for task completion
document.querySelectorAll('.complete-task-button').forEach(button => {
    button.addEventListener('click', () => {
        const taskUrl = button.getAttribute('data-url');
        const taskKey = button.getAttribute('data-task');
        
        // Redirect to task URL
        if (taskUrl) {
            window.location.href = taskUrl;
        }

        // Add points for completing task
        tasksCompleted++;
        tasksCompletedElement.innerText = tasksCompleted;
        let coinsForTask = 10;
        coinsMined += coinsForTask;
        totalMinedCoins += coinsForTask;
        coinsMinedElement.innerText = coinsMined;
        score += coinsForTask;
        updateScore();

        // Disable the button and save completion time
        button.disabled = true;
        saveTaskCompletion(taskKey);
        button.innerText = "Complete (Available in 24 hours)";
        saveGameState(); // Save game state after task completion
    });
});

// Call this function when the page loads
loadTaskCompletionState();



// Update invited friends list
// function updateInvitedFriendsList() {
//     const list = document.getElementById('invited-friends-list');
//     list.innerHTML = ''; // Clear current list
//     invitedFriends.forEach(friend => {
//         const listItem = document.createElement('li');
//         listItem.textContent = friend;
//         list.appendChild(listItem);
//     });
// }

// Show the updated total mined coins on page load
updateTotalMinedCoins();

// Other functions related to game logic (e.g., updateScore, timer, etc.) remain unchanged


document.getElementById('mine-nav').addEventListener('click', () => {
    showPage('mine');
});

document.getElementById('invite-nav').addEventListener('click', () => {
    showPage('invitation');
});

document.getElementById('tasks-nav').addEventListener('click', () => {
    showPage('tasks');
});

document.getElementById('leaderboard-nav').addEventListener('click', () => {
    showPage('leaderboard');
    updateLeaderboard();
});

function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        p.style.display = 'none';
    });
    document.getElementById(page).style.display = 'block';
}

function updateScore() {
    scoreElement.innerText = score;
}

function updateInvitedFriendsList() {
    const list = document.getElementById('invited-friends-list');
    list.innerHTML = ''; // Clear current list
    invitedFriends.forEach(friend => {
        const listItem = document.createElement('li');
        listItem.textContent = friend;
        list.appendChild(listItem);
    });
}

function activatePowerUp() {
    powerUpActive = true;
    powerUpMessage.innerText = "Power-Up Activated! Double Coins!";
    setTimeout(() => {
        powerUpActive = false;
        powerUpMessage.innerText = "";
    }, powerUpDuration);
}

// Timer function
const timerInterval = setInterval(() => {
    if (timer > 0) {
        timer--;
        timerElement.innerText = timer;
    } else {
        alert('Time is up! Your total mined coins: ' + coinsMined + ' | Your score is: ' + score);
        resetGame(); // Reset other game states but keep coinsMined
    }
}, 1000);

// Reset game
function resetGame() {
    invitationsSent = 0;
    tasksCompleted = 0;
    score = 0;
    level = 1;
    timer = 60;
    powerUpActive = false;

    tasksCompletedElement.innerText = tasksCompleted;
    scoreElement.innerText = score;
    levelElement.innerText = level;
    timerElement.innerText = timer;

    invitedFriends.length = 0; // Clear the invited friends list
    updateInvitedFriendsList(); // Refresh the display

    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        p.style.display = 'none';
    });
    document.getElementById('mine').style.display = 'block';

    // Clear saved game state except coinsMined
    const savedState = JSON.parse(localStorage.getItem('errorCoinGameState'));
    if (savedState) {
        coinsMined = savedState.coinsMined; // Retain coins mined
    } else {
        coinsMined = 0; // Reset only if there is no saved state
    }
    coinsMinedElement.innerText = coinsMined;
}


// Update leaderboard
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = ''; // Clear the list
    leaderboardScores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Player ${index + 1}: ${score}`;
        leaderboardList.appendChild(listItem);
    });
}

// Initialize game
showPage('mine');
coinsMinedElement.innerText = coinsMined;
tasksCompletedElement.innerText = tasksCompleted;
scoreElement.innerText = score;
levelElement.innerText = level;
timerElement.innerText = timer;



document.getElementById('mine-button').addEventListener('click', () => {
    if (!canMine) {
        alert('You hit an obstacle! Wait for the next turn to mine.');
        return; // Prevent mining if the player hit an obstacle
    }

    let coins = 1;

    // Apply power-up if active
    if (powerUpActive) {
        coins *= 2;
        powerUpMessage.innerText = "Power-Up Active! Double Coins!";
    } else {
        powerUpMessage.innerText = "";
    }

    // Introduce obstacles
    if (Math.random() < 0.3) { // 30% chance to hit an obstacle
        canMine = false; // Player can't mine this turn
        obstacleElement.classList.remove('hidden');
        obstacleElement.classList.add('visible'); // Make it visible
        setTimeout(() => {
            obstacleElement.classList.remove('visible'); // Hide obstacle
            obstacleElement.classList.add('hidden'); // Mark as hidden for future use
            canMine = true; // Player can mine again after obstacle disappears
        }, 2000); // Obstacle appears for 2 seconds
    } else {
        coinsMined += coins;
        totalMinedCoins += coins; // Increment total mined coins
        score += coins * 10; // Increment score for each coin mined
        updateScore();
        coinsMinedElement.innerText = coinsMined;

        // Random chance to get a power-up
        if (Math.random() < 0.2) {
            activatePowerUp();
        }

        // Check level up
        if (coinsMined >= level * 15) { // Increase coins needed to level up
            level++;
            levelElement.innerText = level;
            // Reduce time limit for higher levels
            timer = Math.max(30, timer - 5); // Min time limit is 30 seconds
        }
    }
    saveGameState(); // Save game state after mining
});


// task management system
// Initialize variables for tracking tasks and coins

// Get references to the DOM elements
const tasksList = document.getElementById('tasks-list');
const tasksCompletedDisplay = document.getElementById('tasks-completed');
const totalCoinsDisplay = document.getElementById('total-coins');

// Add an event listener to the task list to handle button clicks
tasksList.addEventListener('click', function(event) {
    if (event.target.classList.contains('complete-task-button')) {
        // Check if the task button has been clicked and if it's not already completed
        const button = event.target;

        // Prevent completing the same task multiple times
        if (!button.disabled) {
            // Mark the task as completed
            button.textContent = 'Completed';
            button.disabled = true;
            
            // Get the number of points/coins assigned to this task
            const points = parseInt(button.getAttribute('data-points'));
            
            // Update the total coins and completed tasks
            tasksCompleted++;
            totalCoins += points;

            // Update the DOM with the new values
            tasksCompletedDisplay.textContent = tasksCompleted;
            totalCoinsDisplay.textContent = totalCoins;
        }
    }
});
