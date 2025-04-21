const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ścieżka wrogów
const path = [
  { x: 0, y: 200 },
  { x: 800, y: 200 }
];

// Klasa wroga
class Enemy {
  constructor() {
    this.x = path[0].x;
    this.y = path[0].y;
    this.speed = 1;
    this.health = 100;
    this.maxHealth = 100;
    this.alive = true;
  }
  move() {
    this.x += this.speed;
    if (this.x > path[1].x) {
      this.alive = false; // Wróg dotarł do końca
    }
  }
  draw() {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    // Pasek zdrowia
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x - 10, this.y - 15, 20 * (this.health / this.maxHealth), 3);
  }
}

// Klasa wieży
class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.range = 100;
    this.damage = 10;
    this.fireRate = 30; // klatek
    this.counter = 0;
  }
  shoot(enemies) {
    this.counter++;
    if (this.counter < this.fireRate) return;
    this.counter = 0;
    for (let enemy of enemies) {
      if (enemy.alive && this.inRange(enemy)) {
        enemy.health -= this.damage;
        if (enemy.health <= 0) enemy.alive = false;
        break;
      }
    }
  }
  inRange(enemy) {
    const dx = enemy.x - this.x;
    const dy = enemy.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.range;
  }
  draw() {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Zmienne gry
let enemies = [];
let towers = [new Tower(400, 200)];
let frameCount = 0;

function gameLoop() {
  frameCount++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dodawanie wrogów co 120 klatek
  if (frameCount % 120 === 0) {
    enemies.push(new Enemy());
  }

  // Ruch i rysowanie wrogów
  for (let enemy of enemies) {
    if (enemy.alive) {
      enemy.move();
      enemy.draw();
    }
  }

  // Strzelanie i rysowanie wież
  for (let tower of towers) {
    tower.shoot(enemies);
    tower.draw();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
