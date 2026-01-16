export const drawVinyl = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 100, size / 100);
    ctx.translate(-50, -50);
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(50, 50, 40, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "black";
    ctx.beginPath(); ctx.arc(50, 50, 15, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};