export function initializeGame(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set up crisp pixel rendering
  ctx.imageSmoothingEnabled = false;
  
  // Set up 20x20 grid coordinate system
  const scale = canvas.width / 20;
  ctx.scale(scale, scale);
  
  // Set initial background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 20, 20);
}
