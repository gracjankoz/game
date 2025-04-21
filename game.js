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

// Parametry przeciwnika
let enemyPos = 0;
let enemyProgress = 0;
const enemySpeed = 0.001;

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

// Funkcja aktualizująca pozycję przeciwnika
function updateEnemy() {
    if (enemyPos >= pathPoints.length - 1) return; // Jeśli doszedł do końca
    
    const start = pathPoints[enemyPos];
    const end = pathPoints[enemyPos + 1];
    
    // Oblicz aktualną pozycję
    const currentX = start.x + (end.x - start.x) * enemyProgress;
    const currentY = start.y + (end.y - start.y) * enemyProgress;
    
    // Zwiększ postęp
    enemyProgress += enemySpeed;
    
    // Przejdź do następnego segmentu trasy
    if (enemyProgress >= 1) {
        enemyPos++;
        enemyProgress = 0;
    }
}

// Funkcja rysująca przeciwnika
function drawEnemy() {
    const start = pathPoints[enemyPos];
    const end = pathPoints[Math.min(enemyPos + 1, pathPoints.length - 1)];
    
    const x = start.x + (end.x - start.x) * enemyProgress;
    const y = start.y + (end.y - start.y) * enemyProgress;
    
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Główna pętla gry
function gameLoop() {
    // Czyszczenie ekranu
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rysowanie elementów
    drawPath();
    updateEnemy();
    drawEnemy();
    
    // Następna klatka animacji
    requestAnimationFrame(gameLoop);
}

// Uruchomienie gry
gameLoop();
