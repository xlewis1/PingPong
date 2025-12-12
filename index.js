const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');

const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnUp2 = document.getElementById('btnUp2');
const btnDown2 = document.getElementById('btnDown2');

const settingsBtn = document.querySelector('.settings-btn');
const settingsSidebar = document.querySelector('.settings-sidebar');
const pauseBtn = document.getElementById('pauseBtn');

const speedInput = document.getElementById('speed');
const modeSelect = document.getElementById('mode');
const themeSelect = document.getElementById('theme');
const maxScoreSelect = document.getElementById('maxScore');
const difficultySelect = document.getElementById('difficulty');

// ------------------------------------------------------
// GAME SETTINGS (BALANCED SPEEDS)
// ------------------------------------------------------
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;

let paddleHeight = 90;
let paddleWidth = 12;
let ballRadius = 8;

// Balanced speeds
let paddleSpeed = 5;
let baseBallSpeed = 4.2;
let ballAccel = 0.15;

let player1Y = canvasHeight / 2 - paddleHeight / 2;
let player2Y = canvasHeight / 2 - paddleHeight / 2;

let ballX = canvasWidth / 2;
let ballY = canvasHeight / 2;
let ballDX = baseBallSpeed * (Math.random() < 0.5 ? 1 : -1);
let ballDY = baseBallSpeed * (Math.random() < 0.5 ? 1 : -1);

let score1 = 0;
let score2 = 0;
let maxScore = parseInt(maxScoreSelect.value);

let gamePaused = false;
let mode = parseInt(modeSelect.value);
let difficulty = difficultySelect.value;

let theme = themeSelect.value;

// touch flags
let touchUp1 = false, touchDown1 = false;
let touchUp2 = false, touchDown2 = false;

// keyboard flags
let upPressed = false, downPressed = false;
let wPressed = false, sPressed = false;


// ------------------------------------------------------
// SETTINGS PANEL
// ------------------------------------------------------
settingsBtn.addEventListener('click', () => {
    settingsSidebar.classList.toggle('show');
});

speedInput.addEventListener('input', () => {
    paddleSpeed = parseInt(speedInput.value);
});

modeSelect.addEventListener('change', () => mode = parseInt(modeSelect.value));

themeSelect.addEventListener('change', () => {
    theme = themeSelect.value;
    document.body.setAttribute("data-theme", theme);
});

maxScoreSelect.addEventListener('change', () => {
    maxScore = parseInt(maxScoreSelect.value);
});

difficultySelect.addEventListener('change', () => {
    difficulty = difficultySelect.value;
});

pauseBtn.addEventListener('click', () => gamePaused = !gamePaused);


// ------------------------------------------------------
// TOUCH CONTROLS
// ------------------------------------------------------
btnUp.addEventListener("touchstart", () => touchUp1 = true);
btnUp.addEventListener("touchend", () => touchUp1 = false);
btnDown.addEventListener("touchstart", () => touchDown1 = true);
btnDown.addEventListener("touchend", () => touchDown1 = false);

btnUp2.addEventListener("touchstart", () => touchUp2 = true);
btnUp2.addEventListener("touchend", () => touchUp2 = false);
btnDown2.addEventListener("touchstart", () => touchDown2 = true);
btnDown2.addEventListener("touchend", () => touchDown2 = false);

[btnUp, btnDown, btnUp2, btnDown2].forEach(btn => {
    btn.addEventListener("mousedown", () => btn.classList.add("active"));
    btn.addEventListener("mouseup", () => btn.classList.remove("active"));
});


// ------------------------------------------------------
// KEYBOARD INPUT
// ------------------------------------------------------
document.addEventListener("keydown", e => {
    if(e.key === "ArrowUp") upPressed = true;
    if(e.key === "ArrowDown") downPressed = true;
    if(e.key === "w" || e.key === "W") wPressed = true;
    if(e.key === "s" || e.key === "S") sPressed = true;
});

document.addEventListener("keyup", e => {
    if(e.key === "ArrowUp") upPressed = false;
    if(e.key === "ArrowDown") downPressed = false;
    if(e.key === "w" || e.key === "W") wPressed = false;
    if(e.key === "s" || e.key === "S") sPressed = false;
});


// ------------------------------------------------------
// RESET BALL
// ------------------------------------------------------
function resetBall() {
    ballX = canvasWidth / 2;
    ballY = canvasHeight / 2;
    ballDX = baseBallSpeed * (Math.random() < 0.5 ? 1 : -1);
    ballDY = baseBallSpeed * (Math.random() < 0.5 ? 1 : -1);
}


// ------------------------------------------------------
// UPDATE
// ------------------------------------------------------
function update() {
    if(gamePaused) return;

    // PLAYER 1
    if(upPressed || touchUp1) player1Y -= paddleSpeed;
    if(downPressed || touchDown1) player1Y += paddleSpeed;

    // PLAYER 2 OR AI
    if(mode === 2) {
        if(wPressed || touchUp2) player2Y -= paddleSpeed;
        if(sPressed || touchDown2) player2Y += paddleSpeed;
    } else {
        let aiSpeed = paddleSpeed * 0.65;
        if(difficulty === "easy") aiSpeed = paddleSpeed * 0.45;
        if(difficulty === "hard") aiSpeed = paddleSpeed * 0.9;

        if(ballY < player2Y + paddleHeight/2) player2Y -= aiSpeed;
        if(ballY > player2Y + paddleHeight/2) player2Y += aiSpeed;
    }

    // Clamp paddles
    player1Y = Math.max(0, Math.min(canvasHeight - paddleHeight, player1Y));
    player2Y = Math.max(0, Math.min(canvasHeight - paddleHeight, player2Y));

    // Ball move
    ballX += ballDX;
    ballY += ballDY;

    // Wall bounce
    if(ballY < ballRadius || ballY > canvasHeight - ballRadius) ballDY *= -1;

    // Paddle collision + gradual speed increase
    if(ballX - ballRadius < paddleWidth &&
       ballY > player1Y && ballY < player1Y + paddleHeight) {
        ballDX = Math.abs(ballDX) + ballAccel;
        ballDY += (ballY - (player1Y + paddleHeight / 2)) * 0.04;
    }

    if(ballX + ballRadius > canvasWidth - paddleWidth &&
       ballY > player2Y && ballY < player2Y + paddleHeight) {
        ballDX = -Math.abs(ballDX) - ballAccel;
        ballDY += (ballY - (player2Y + paddleHeight / 2)) * 0.04;
    }

    // Score
    if(ballX < 0) {
        score2++;
        score2El.textContent = score2;
        resetBall();
    }
    if(ballX > canvasWidth) {
        score1++;
        score1El.textContent = score1;
        resetBall();
    }

    // Win
    if(score1 >= maxScore || score2 >= maxScore) {
        gamePaused = true;
        alert(`${score1 >= maxScore ? "Player 1" : "Player 2"} Wins!`);
        score1 = score2 = 0;
        score1El.textContent = 0;
        score2El.textContent = 0;
        resetBall();
    }
}


// ------------------------------------------------------
// DRAW
// ------------------------------------------------------
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // THEMES
    switch(theme) {
        case "gameboy":
            ctx.fillStyle = "#9bbc0f";
            break;
        case "green":
            ctx.fillStyle = "#003300";
            break;
        case "neon":
            ctx.fillStyle = "black";
            break;
        default:
            ctx.fillStyle = "black";
            break;
    }

    ctx.fillRect(0,0,canvasWidth,canvasHeight);

    // Middle line
    ctx.fillStyle = "white";
    ctx.fillRect(canvasWidth/2 - 1, 0, 2, canvasHeight);

    // Paddles
    if(theme === "redblue") {
        ctx.fillStyle = "red";
        ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);

        ctx.fillStyle = "blue";
        ctx.fillRect(canvasWidth - paddleWidth, player2Y, paddleWidth, paddleHeight);
    }
    else if(theme === "neon") {
        ctx.shadowBlur = 20;
        ctx.shadowColor = "cyan";
        ctx.fillStyle = "cyan";
        ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);

        ctx.shadowColor = "magenta";
        ctx.fillStyle = "magenta";
        ctx.fillRect(canvasWidth - paddleWidth, player2Y, paddleWidth, paddleHeight);

        ctx.shadowBlur = 0;
    }
    else {
        ctx.fillStyle = "white";
        ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);
        ctx.fillRect(canvasWidth - paddleWidth, player2Y, paddleWidth, paddleHeight);
    }

    // Ball
    if(theme === "redblue") {
        ctx.fillStyle = (Date.now() % 200 < 100) ? "red" : "blue";
    } else if(theme === "neon") {
        ctx.shadowBlur = 25;
        ctx.shadowColor = "cyan";
        ctx.fillStyle = "white";
    } else {
        ctx.fillStyle = "white";
    }

    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
    ctx.fill();

    ctx.shadowBlur = 0;
}


// ------------------------------------------------------
// GAME LOOP
// ------------------------------------------------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();

