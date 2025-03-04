export function checkCollision(
  snake: { x: number; y: number }[],
  gridSize: number
): boolean {
  const head = snake[0];
  
  // Wall collision
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    return true;
  }

  // Self-collision
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}
