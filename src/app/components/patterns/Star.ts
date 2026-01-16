export const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 100, size / 100);
    ctx.translate(-50, -50);
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(50, 10); ctx.lineTo(60, 40); ctx.lineTo(95, 40); ctx.lineTo(65, 60);
    ctx.lineTo(75, 90); ctx.lineTo(50, 70); ctx.lineTo(20, 90); ctx.lineTo(35, 60);
    ctx.lineTo(5, 40); ctx.lineTo(40, 40);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
};