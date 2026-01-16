export const drawBolt = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 100, size / 100);
    ctx.translate(-50, -50);
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(40, 10); ctx.lineTo(30, 50); ctx.lineTo(50, 50); ctx.lineTo(40, 90);
    ctx.lineTo(70, 40); ctx.lineTo(50, 40); ctx.lineTo(60, 10);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
};