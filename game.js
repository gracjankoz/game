let mapData = null;
let tilesetImg = null;
let tileWidth = 16;
let tileHeight = 16;
let columns = 1;
let gameWin = false;

async function loadMap() {
    const mapRes = await fetch('mapa/mapa.json');
    mapData = await mapRes.json();

    const tsxRes = await fetch('mapa/floor.tsx');
    const tsxText = await tsxRes.text();
    const parser = new DOMParser();
    const tsxXml = parser.parseFromString(tsxText, "application/xml");
    const imageElem = tsxXml.querySelector('image');
    tileWidth = parseInt(tsxXml.querySelector('tileset').getAttribute('tilewidth'));
    tileHeight = parseInt(tsxXml.querySelector('tileset').getAttribute('tileheight'));
    columns = parseInt(tsxXml.querySelector('tileset').getAttribute('columns'));
    const imageSource = imageElem.getAttribute('source');

    tilesetImg = new Image();
    tilesetImg.src = 'mapa/' + imageSource;
}

function drawMap() {
    if (!mapData || !tilesetImg) return;
    const layer = mapData.layers.find(l => l.type === 'tilelayer');
    for (let i = 0; i < layer.data.length; i++) {
        const gid = layer.data[i];
        if (gid === 0) continue;
        const tileIndex = gid - 1;
        const sx = (tileIndex % columns) * tileWidth;
        const sy = Math.floor(tileIndex / columns) * tileHeight;
        const dx = (i % mapData.width) * tileWidth;
        const dy = Math.floor(i / mapData.width) * tileHeight;
        ctx.drawImage(
            tilesetImg,
            sx, sy, tileWidth, tileHeight,
            dx, dy, tileWidth, tileHeight
        );
    }
}

const enemyImgs = [];
for (let i = 1; i <= 12; i++) {
    const img = new Image();
    img.src = `mapa/Enemy_${i}.png`;
    enemyImgs.push(img);
}


let gameOver = false;
let selectedTower = null;
const canvas = document.getElementById('canvas');
canvas.width = 1008;
canvas.height = 608;
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
    {x: 937, y: 608}
];

// Monety
let money = 200;
const TOWER_COST = 100;
const ENEMY_REWARD = 15;

function drawMoney() {
    ctx.fillStyle = 'gold';
    ctx.font = '24px Arial';
    ctx.fillText(`Monety: ${money}`, 20, 60);
}

let hp = 10;
let spawnTimer = 0;
const enemies = []; 

// Parametry przeciwnika
const enemySpeed = 0.001;
// Parametry gry
const spawnInterval = 7000;
let enemiesKilled = 0;
function updateEnemy() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
  
      if (enemy.hp <= 0) {
        enemies.splice(i, 1);
        money += ENEMY_REWARD;
        enemiesKilled++;
  
        if(enemiesKilled == 200)
            gameWin = true;

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

        ctx.drawImage(enemyImgs[enemy.spriteIndex], x - 16, y - 16, 32, 32);
    });
}

function drawEnemiesKilled() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Zabitych: ${enemiesKilled}/200`, 20, 90);
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
        this.level = 1;
        this.upgradeCost = 80;
        this.damage = 1;
    }

    upgrade() {
        if (money >= this.upgradeCost) {
            money -= this.upgradeCost;
            this.level++;
            this.range += 15;
            this.fireRate += 0.03;
            this.damage += 0.8;
            this.upgradeCost = Math.floor(this.upgradeCost * 1.5);
        }
    }
}


let enemiesSpawned = 0;
function spawnEnemy() {
    let color = "red";
    let hp = 1;
    enemiesSpawned++;
    let spriteIndex = 0;

   if (enemiesSpawned == 200) {
        color = "pink";
        hp = 80;
        spriteIndex = 11; // boss
    } else if (enemiesSpawned >= 180) {
        color = "cyan";
        hp = 36;
        spriteIndex = 10;
    } else if (enemiesSpawned >= 160) {
        color = "lime";
        hp = 30;
        spriteIndex = 9;
    } else if (enemiesSpawned >= 140) {
        color = "brown";
        hp = 26;
        spriteIndex = 8;
    } else if (enemiesSpawned >= 120) {
        color = "navy";
        hp = 22;
        spriteIndex = 7;
    } else if (enemiesSpawned >= 100) {
        color = "gold";
        hp = 18;
        spriteIndex = 6;
    } else if (enemiesSpawned >= 80) {
        color = "orange";
        hp = 14;
        spriteIndex = 5;
    } else if (enemiesSpawned >= 60) {
        color = "blue";
        hp = 10;
        spriteIndex = 4;
    } else if (enemiesSpawned >= 45) {
        color = "black";
        hp = 8;
        spriteIndex = 3;
    } else if (enemiesSpawned >= 30) {
        color = "green";
        hp = 4;
        spriteIndex = 2;
    } else if (enemiesSpawned >= 15) {
        color = "purple";
        hp = 2;
        spriteIndex = 1;
    } else {
        color = "gray";
        hp = 1;
        spriteIndex = 0;
    }
    enemies.push({
        pos: 0,
        progress: 0,
        hp: hp,
        color: color,
        spriteIndex: spriteIndex
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
                target: target,
                fromTower: tower
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

    if (projectile.progress >= 1) {
        // Dodatkowe sprawdzenie, czy target jest obiektem i ma hp
        if (
            projectile.target &&
            typeof projectile.target.hp === 'number' &&
            enemies.includes(projectile.target) &&
            projectile.target.hp > 0
        ) {
            projectile.target.hp -= projectile.fromTower ? projectile.fromTower.damage : 1;
        }
        // Usuwamy pocisk niezależnie od trafienia
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

canvas.addEventListener('click', (e) => {

    if (spacePressed && money >= TOWER_COST) {
        towers.push(new Tower(mouseX, mouseY));
        money -= TOWER_COST;
    }

    if (spacePressed && money >= TOWER_COST) {
        towers.push(new Tower(mouseX, mouseY));
        selectedTower = null;
        return;
    }
    if (!spacePressed) {
        // Sprawdź, czy kliknięto w wieżę
        selectedTower = null;
        towers.forEach(tower => {
            if (Math.abs(mouseX - tower.x) < 20 && Math.abs(mouseY - tower.y) < 20) {
                selectedTower = tower;
            }
        });
    }
});

function updateUpgradePanel() {
    const panel = document.getElementById('upgradePanel');
    const stats = document.getElementById('towerStats');
    if (selectedTower) {
        panel.style.display = 'block';
        stats.innerText = `Poziom: ${selectedTower.level} | Zasięg: ${selectedTower.range} | Szybkostrzelność: ${selectedTower.fireRate.toFixed(2)} | Obrażenia: ${selectedTower.damage} | Ulepszenie: ${selectedTower.upgradeCost} monet`;
        document.getElementById('upgradeBtn').disabled = money < selectedTower.upgradeCost;
    } else {
        panel.style.display = 'none';
    }
}

document.getElementById('upgradeBtn').onclick = function() {
    if (selectedTower) selectedTower.upgrade();
    updateUpgradePanel();
};

// Nasłuchiwanie ruchu myszy
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Rysowanie wież

const towerImg = new Image();
towerImg.src = 'mapa/Tower_Blue.png';

function drawTowers() {
  towers.forEach(tower => {
     ctx.drawImage(towerImg, tower.x - 15, tower.y - 30, 30, 60);
     if (tower === selectedTower) {
          ctx.save();
          ctx.strokeStyle = 'gold';
          ctx.lineWidth = 3;
          ctx.strokeRect(tower.x - 15, tower.y - 30, 30, 60);
          ctx.restore();
     }
  });
}


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
  ctx.drawImage(towerImg, mouseX - 15, mouseY - 30, 30, 60);
  ctx.restore();
}



function gameLoop(timestamp) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    

    spawnTimer += 16; 
    if (spawnTimer >= spawnInterval && enemiesSpawned < 200) {
        spawnEnemy();
        spawnTimer = 0;
    }

    
    drawMap();
    drawMoney();
    updateEnemy();
    drawEnemy();
    drawEnemiesKilled();
    drawTowerPreview();
    updateTowers();
    updateProjectiles();
    drawProjectiles();
    drawTowers();
    updateUpgradePanel();
    drawHP();
    

    if (gameWin) {
        ctx.font = "bold 48px Arial";
        ctx.lineWidth = 6; 
        ctx.strokeStyle = "black";
        ctx.strokeText("WYGRAŁEŚ!", 350, 300);
        ctx.fillStyle = "green";
        ctx.fillText("WYGRAŁEŚ!", 350, 300);

        document.getElementById('restartBtn').style.display = 'block';
    return;
    }

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
loadMap();
// Uruchomienie gry
gameLoop();

document.getElementById('restartBtn').addEventListener('click', () => {
  window.location.reload();
})