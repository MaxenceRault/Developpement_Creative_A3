export const drawHeadphones = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 100, size / 100);
    ctx.translate(-50, -50);
    ctx.strokeStyle = "black"; ctx.fillStyle = color; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(20, 60); ctx.quadraticCurveTo(20, 15, 50, 15); ctx.quadraticCurveTo(80, 15, 80, 60); ctx.stroke();
    ctx.fillRect(15, 60, 15, 25); ctx.strokeRect(15, 60, 15, 25);
    ctx.fillRect(70, 60, 15, 25); ctx.strokeRect(70, 60, 15, 25);
    ctx.restore();
};