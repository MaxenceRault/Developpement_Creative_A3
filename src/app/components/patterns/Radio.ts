export const drawRadio = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 100, size / 100);
    ctx.translate(-50, -50);
    ctx.fillStyle = color; ctx.strokeStyle = "black"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.rect(10, 35, 80, 30); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillRect(20, 42, 35, 16); ctx.fillRect(65, 42, 15, 6); ctx.fillRect(65, 52, 15, 6);
    ctx.restore();
};