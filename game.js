const canvas = document.getElementById('canvas');
canvas.width = 1000;
canvas.height = 600;
const ctx = canvas.getContext('2d');

// Punkty trasy
const pathPoints = [
    {x: 0, y: 550},
    {x: 187, y: 550},
    {x: 187, y: 130},
    {x: 375, y: 130},
    {x: 375, y: 450},
    {x: 562, y: 450},
    {x: 562, y: 50},
    {x: 750, y: 50},
    {x: 750, y: 150},
    {x: 937, y: 150},
    {x: 937, y: 600}
];

// Funkcja rysująca trasę
function drawPath() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for(let i = 1; i < pathPoints.length; i++) {
        ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.stroke();
}

let hp = 20;
let spawnTimer = 0;
const enemies = []; // Teraz przechowujemy wszystkich przeciwników w tablicy

// Parametry przeciwnika
let enemyPos = 0;
let enemyProgress = 0;
const enemySpeed = 0.001;
// Parametry gry
const spawnInterval = 10000; // Co 2 sekundy nowy przeciwnik (w ms)

// Funkcja tworząca nowego przeciwnika
function spawnEnemy() {
    enemies.push({
        pos: 0,
        progress: 0
    });
}

// Modyfikacja funkcji updateEnemy
function updateEnemy() {
  for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      if (enemy.pos >= pathPoints.length - 1) {
          hp--;
          enemies.splice(i, 1);
          continue;
      }
      const start = pathPoints[enemy.pos];
      const end = pathPoints[enemy.pos + 1];
      enemy.progress += enemySpeed;
      if (enemy.progress >= 1) {
          enemy.pos++;
          enemy.progress = 0;
      }
  }
}


// Modyfikacja funkcji drawEnemy
function drawEnemy() {
    enemies.forEach(enemy => {
        const start = pathPoints[enemy.pos];
        const end = pathPoints[Math.min(enemy.pos + 1, pathPoints.length - 1)];
        
        const x = start.x + (end.x - start.x) * enemy.progress;
        const y = start.y + (end.y - start.y) * enemy.progress;
        
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Nowa funkcja do rysowania HP
function drawHP() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`HP: ${hp}`, 20, 30);
}

//Śledzenie myszy
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

const towers = [];
let spacePressed = false;

// Nasłuchiwanie klawiszy
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') spacePressed = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') spacePressed = false;
});

// Nasłuchiwanie ruchu myszy
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Nasłuchiwanie kliknięcia myszą (tylko gdy trzymana jest spacja)
canvas.addEventListener('click', (e) => {
    if (spacePressed) {
        towers.push({ x: mouseX, y: mouseY });
    }
});


// Rysowanie wież
function drawTowers() {
  towers.forEach(tower => {
      ctx.fillStyle = 'blue';
      ctx.fillRect(tower.x - 15, tower.y - 15, 30, 30); // Kwadrat 30x30px, środek w miejscu kliknięcia
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(tower.x - 15, tower.y - 15, 30, 30);
  });
}

//Podgląd gdzie będzie wieża
function drawTowerPreview() {
  if (!spacePressed) return;
  
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'blue';
  ctx.fillRect(mouseX - 15, mouseY - 15, 30, 30);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.strokeRect(mouseX - 15, mouseY - 15, 30, 30);
  ctx.restore();
}


// Modyfikacja głównej pętli gry
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sprawdź czy trzeba dodać nowego przeciwnika
    spawnTimer += 16; // Zakładamy ~60 klatek/sek (16ms na klatkę)
    if (spawnTimer >= spawnInterval) {
        spawnEnemy();
        spawnTimer = 0;
    }
    
    drawPath();
    updateEnemy();
    drawEnemy();
    drawTowerPreview()
    drawTowers();
    drawHP();
    
    // Sprawdź przegraną
    if (hp <= 0) {
      ctx.fillStyle = 'red';
      ctx.font = '48px Arial';
      ctx.fillText('PRZEGRANA!', canvas.width/2 - 120, canvas.height/2);
  
      // Pokaż przycisk restartu
      document.getElementById('restartBtn').style.display = 'block';
      return;
  }
  
    
    requestAnimationFrame(gameLoop);
}

// Uruchomienie gry
gameLoop();

document.getElementById('restartBtn').addEventListener('click', resetGame)