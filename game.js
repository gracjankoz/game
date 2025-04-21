const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Czyść canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Punkty trasy (długa, zakręcona ścieżka)
const pathPoints = [
    {x: 50, y: 550},
    {x: 150, y: 550},
    {x: 150, y: 450},
    {x: 300, y: 450},
    {x: 300, y: 350},
    {x: 450, y: 350},
    {x: 450, y: 250},
    {x: 600, y: 250},
    {x: 600, y: 150},
    {x: 750, y: 150}
];

// Rysowanie cienkiej linii trasy
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
for(let i = 1; i < pathPoints.length; i++) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
}
ctx.stroke();
