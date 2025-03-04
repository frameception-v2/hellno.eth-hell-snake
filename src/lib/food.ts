export const getNewFoodPosition = (
  snake: { x: number; y: number }[],
  currentFood: { x: number; y: number }
): { x: number; y: number } => {
  let newFood: { x: number; y: number };
  const gridSize = 20;
  
  // Generate new positions until we find one that's valid
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (
    // Check if new position collides with snake
    snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
    // Check if position matches current food location
    (newFood.x === currentFood.x && newFood.y === currentFood.y)
  );

  return newFood;
};
