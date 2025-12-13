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

/* --- SETTINGS --- */
let paddleHeight = 90, paddleWidth = 12, ballRadius = 8;
let paddleSpeed = 5, baseBallSpeed = 4.2, ballAccel = 0.15;
let player1Y, player2Y, ballX, ballY, ballDX, ballDY;
let score1 = 0, score2 = 0, maxScore = parseInt(maxScoreSelect.value);
let gamePaused = false;
let mode = parseInt(modeSelect.value);
let difficulty = difficultySelect.value;
let theme = themeSelect.value;

function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.95;
    canvas.width = Math.min(600, maxWidth);
    canvas.height = canvas.width * 2/3;
    player1Y = canvas.height / 2 - paddleHeight / 2;
    player2Y = canvas.height / 2 - paddleHeight / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* --- SETTINGS PANEL --- */
settingsBtn.addEventListener('click', () => settingsSidebar.classList.toggle('show'));
speedInput.addEventListener('input', () => paddleSpeed = parseInt(speedInput.value));
modeSelect.addEventListener('change', () => mode = parseInt(modeSelect.value));
themeSelect.addEventListener('change', () => {
    theme = themeSelect.value;
    document.body.setAttribute("data-theme", theme);
});
maxScoreSelect.addEventListener('change', () => maxScore = parseInt(maxScoreSelect.value));
difficultySelect.addEventListener('change', () => difficulty = difficultySelect.value);
pauseBtn.addEventListener('click', () => gamePaused = !gamePaused);

/* --- TOUCH INPUT --- */
let touchUp1 = false, touchDown1 = false, touchUp2 = false, touchDown2 = false;
[ [btnUp, 'Up1'], [btnDown, 'Down1'], [btnUp2, 'Up2'], [btnDown2, 'Down2'] ].forEach(([btn, name]) => {
    btn.addEventListener('touchstart', () => window['touch'+name] = true);
    btn.addEventListener('touchend', () => window['touch'+name] = false);
    btn.addEventListener('mousedown', () => btn.classList.add('active'));
    btn.addEventListener('mouseup', () => btn.classList.remove('active'));
});

/* --- KEYBOARD INPUT --- */
let upPressed=false, downPressed=false, wPressed=false, sPressed=false;
document.addEventListener("keydown", e=>{
    if(e.key==="ArrowUp") upPressed=true;
    if(e.key==="ArrowDown") downPressed=true;
    if(e.key==="w"||e.key==="W") wPressed=true;
    if(e.key==="s"||e.key==="S") sPressed=true;
});
document.addEventListener("keyup", e=>{
    if(e.key==="ArrowUp") upPressed=false;
    if(e.key==="ArrowDown") downPressed=false;
    if(e.key==="w"||e.key==="W") wPressed=false;
    if(e.key==="s"||e.key==="S") sPressed=false;
});

/* --- RESET BALL --- */
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballDX = baseBallSpeed * (Math.random()<0.5?1:-1);
    ballDY = baseBallSpeed * (Math.random()<0.5?1:-1);
}

/* --- UPDATE --- */
function update() {
    if(gamePaused) return;

    // Player 1
    if(upPressed||touchUp1) player1Y -= paddleSpeed;
    if(downPressed||touchDown1) player1Y += paddleSpeed;

    // Player 2 / AI
    if(mode===2){
        if(wPressed||touchUp2) player2Y -= paddleSpeed;
        if(sPressed||touchDown2) player2Y += paddleSpeed;
    } else {
        let aiSpeed = paddleSpeed * (difficulty==="easy"?0.45:difficulty==="hard"?0.9:0.65);
        if(ballY<player2Y+paddleHeight/2) player2Y -= aiSpeed;
        if(ballY>player2Y+paddleHeight/2) player2Y += aiSpeed;
    }

    // Clamp paddles
    player1Y = Math.max(0, Math.min(canvas.height - paddleHeight, player1Y));
    player2Y = Math.max(0, Math.min(canvas.height - paddleHeight, player2Y));

    // Ball movement
    ballX += ballDX; ballY += ballDY;
    if(ballY<ballRadius||ballY>canvas.height-ballRadius) ballDY*=-1;

    // Paddle collision
    if(ballX-ballRadius<paddleWidth && ballY>player1Y && ballY<player1Y+paddleHeight) {
        ballDX = Math.abs(ballDX)+ballAccel;
        ballDY += (ballY-(player1Y+paddleHeight/2))*0.04;
    }
    if(ballX+ballRadius>canvas.width-paddleWidth && ballY>player2Y && ballY<player2Y+paddleHeight) {
        ballDX = -Math.abs(ballDX)-ballAccel;
        ballDY += (ballY-(player2Y+paddleHeight/2))*0.04;
    }

    // Score
    if(ballX<0){ score2++; score2El.textContent=score2; resetBall(); }
    if(ballX>canvas.width){ score1++; score1El.textContent=score1; resetBall(); }

    if(score1>=maxScore||score2>=maxScore){
        gamePaused=true;
        alert(`${score1>=maxScore?"Player 1":"Player 2"} Wins!`);
        score1=score2=0; score1El.textContent=0; score2El.textContent=0;
        resetBall();
    }
}

/* --- DRAW --- */
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    switch(theme){
        case "gameboy": ctx.fillStyle="#9bbc0f"; break;
        case "green": ctx.fillStyle="#003300"; break;
        case "neon": ctx.fillStyle="black"; break;
        default: ctx.fillStyle="black"; break;
    }
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="white"; ctx.fillRect(canvas.width/2-1,0,2,canvas.height);

    // Paddles
    if(theme==="redblue"){
        ctx.fillStyle="red"; ctx.fillRect(0,player1Y,paddleWidth,paddleHeight);
        ctx.fillStyle="blue"; ctx.fillRect(canvas.width-paddleWidth,player2Y,paddleWidth,paddleHeight);
    } else if(theme==="neon"){
        ctx.shadowBlur=20; ctx.shadowColor="cyan"; ctx.fillStyle="cyan"; ctx.fillRect(0,player1Y,paddleWidth,paddleHeight);
        ctx.shadowColor="magenta"; ctx.fillStyle="magenta"; ctx.fillRect(canvas.width-paddleWidth,player2Y,paddleWidth,paddleHeight);
        ctx.shadowBlur=0;
    } else {
        ctx.fillStyle="white"; ctx.fillRect(0,player1Y,paddleWidth,paddleHeight);
        ctx.fillRect(canvas.width-paddleWidth,player2Y,paddleWidth,paddleHeight);
    }

    // Ball
    ctx.fillStyle=(theme==="redblue")?(Date.now()%200<100?"red":"blue"):(theme==="neon"?(ctx.shadowBlur=25,ctx.shadowColor="cyan","white"):"white");
    ctx.beginPath();
    ctx.arc(ballX,ballY,ballRadius,0,Math.PI*2);
    ctx.fill(); ctx.shadowBlur=0;
}

/* --- GAME LOOP --- */
function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
