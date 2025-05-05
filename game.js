//  TODO:
//  utrudnianie w późniejszej fazie gry (więcej przeciwników, więcej HP enemies)
//  ulepszanie wieży
//  cennik jak i sterownie (instrukcja na boku po lewo i po prawo)
//  koniec gry (np. po zabiciu 1000 przeciwnikow)

//  OPCJONALNE:
//  mapa
//  animacja i grafika przeciwników jak i wieży

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

// Monety
let money = 200;
const TOWER_COST = 100;
const ENEMY_REWARD = 20;

function drawMoney() {
    ctx.fillStyle = 'gold';
    ctx.font = '24px Arial';
    ctx.fillText(`Monety: ${money}`, 20, 60);
}

let hp = 20;
let spawnTimer = 0;
const enemies = []; // Teraz przechowujemy wszystkich przeciwników w tablicy

// Parametry przeciwnika
const enemySpeed = 0.001;
// Parametry gry
const spawnInterval = 5000; // Co 2 sekundy nowy przeciwnik (w ms)

function updateEnemy() {

  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    
    if (enemy.hp <= 0) {
        enemies.splice(i, 1);
        money += ENEMY_REWARD;
        enemiesKilled++;
        continue;
    }
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


function drawEnemy() {
    enemies.forEach(enemy => {
        const start = pathPoints[enemy.pos];
        const end = pathPoints[Math.min(enemy.pos + 1, pathPoints.length - 1)];
        
        const x = start.x + (end.x - start.x) * enemy.progress;
        const y = start.y + (end.y - start.y) * enemy.progress;
        
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemiesKilled() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Zabitych: ${enemiesKilled}`, 20, 90);
}

function drawHP() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`HP: ${hp}`, 20, 30);
}

const towers = [];
let spacePressed = false;

class Tower {
  constructor(x, y) {
      this.x = x;
      this.y = y;
      this.range = 80; 
      this.cooldown = 0;
      this.fireRate = 0.1; 
      this.projectiles = [];
  }
}

let enemiesKilled = 0;
function spawnEnemy() {
    let color = "red";
    let hp = 1;

    if (enemiesKilled >= 45) {
        color = "black";
        hp = 8;
    } else if (enemiesKilled >= 30) {
        color = "green";
        hp = 4;
    } else if (enemiesKilled >= 15) {
        color = "purple";
        hp = 2;
    }
    enemies.push({
        pos: 0,
        progress: 0,
        hp: hp,
        color: color
    });
}



// Tablica pocisków
const projectiles = [];

function updateTowers() {
  towers.forEach(tower => {
      tower.cooldown = Math.max(0, tower.cooldown - 1);
      
      // Szukaj celu w zasięgu
      if (tower.cooldown <= 0) {
          let target = null;
          let furthestProgress = -1;
          
          enemies.forEach(enemy => {
              const enemyPos = getEnemyPosition(enemy);
              const dx = enemyPos.x - tower.x;
              const dy = enemyPos.y - tower.y;
              const distance = Math.sqrt(dx*dx + dy*dy);
              
              if (distance <= tower.range && enemy.pos > furthestProgress) {
                  target = enemy;
                  furthestProgress = enemy.pos;
              }
          });
          
        
          if (target) {
              const targetPos = getEnemyPosition(target);
              projectiles.push({
                  from: {x: tower.x, y: tower.y},
                  to: {x: targetPos.x, y: targetPos.y},
                  progress: 0,
                  speed: 0.1,
                  target: target
              });
              tower.cooldown = 60 / tower.fireRate; // 60 klatek/sek
          }
      }
  });
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      projectile.progress += projectile.speed;
      
      // Sprawdź trafienie
      if (projectile.progress >= 1) {
          projectile.target.hp -= 1;
          projectiles.splice(i, 1);
      }
  }
}

// Pomocnicza funkcja do pobierania pozycji przeciwnika
function getEnemyPosition(enemy) {
  const start = pathPoints[enemy.pos];
  const end = pathPoints[Math.min(enemy.pos + 1, pathPoints.length - 1)];
  return {
      x: start.x + (end.x - start.x) * enemy.progress,
      y: start.y + (end.y - start.y) * enemy.progress
  };
}

// Rysowanie pocisków
function drawProjectiles() {
  projectiles.forEach(projectile => {
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(projectile.from.x, projectile.from.y);
      const currentX = projectile.from.x + (projectile.to.x - projectile.from.x) * projectile.progress;
      const currentY = projectile.from.y + (projectile.to.y - projectile.from.y) * projectile.progress;
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
  });
}

// Nasłuchiwanie klawiszy
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') spacePressed = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') spacePressed = false;
});

// Nasłuchiwanie ruchu myszy
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Nasłuchiwanie kliknięcia myszą (tylko gdy trzymana jest spacja)
canvas.addEventListener('click', (e) => {
    if (spacePressed && money >= TOWER_COST) {
        towers.push(new Tower(mouseX, mouseY));
        money -= TOWER_COST;
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
    
  const previewRange = new Tower(0,0).range; 

  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, previewRange, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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
    drawMoney()
    updateEnemy();
    drawEnemy();
    drawEnemiesKilled()
    drawTowerPreview();
    updateTowers();
    updateProjectiles();
    drawProjectiles();
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

document.getElementById('restartBtn').addEventListener('click', () => {
  window.location.reload();
})