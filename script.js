const ROWS = 17;
const COLS = 17;
const START = { x: 0, y: 0 };
const GOAL = { x: 16, y: 16 };
let maze, player, path, moveCount, hasWon, optimalMoves, isPathVisible;

const mazeElement = document.getElementById('maze');
const moveCounterElement = document.getElementById('move-counter');
const playAgainButton = document.getElementById('play-again');

function initGame() {
  maze = generateMaze(ROWS, COLS);
  player = { ...START };
  path = [];
  moveCount = 0;
  hasWon = false;
  isPathVisible = false;
  optimalMoves = bfs(maze, START, GOAL).length - 1;

  renderMaze();
  updateMoveCounter();
}

function renderMaze() {
  mazeElement.innerHTML = '';
  maze.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cellElement = document.createElement('div');
      cellElement.className = 'cell';
      cellElement.style.borderTop = cell.top ? '2px solid #333' : 'none';
      cellElement.style.borderRight = cell.right ? '2px solid #333' : 'none';
      cellElement.style.borderBottom = cell.bottom ? '2px solid #333' : 'none';
      cellElement.style.borderLeft = cell.left ? '2px solid #333' : 'none';

      if (path.some(p => p.x === x && p.y === y)) {
        cellElement.classList.add('path');
      }

      if (x === GOAL.x && y === GOAL.y) {
        cellElement.classList.add('goal');
      }

      mazeElement.appendChild(cellElement);
    });
  });

  const playerElement = document.createElement('div');
  playerElement.className = 'player';
  playerElement.style.transform = `translate(${player.x * 32 + 6}px, ${player.y * 32 + 6}px)`;
  mazeElement.appendChild(playerElement);
}

function movePlayer(dx, dy) {
  if (hasWon) return;

  const { x, y } = player;
  const newX = x + dx;
  const newY = y + dy;

  if (
    newX >= 0 && newY >= 0 &&
    newX < COLS && newY < ROWS
  ) {
    const currentCell = maze[y][x];
    if (
      (dx === 1 && !currentCell.right) ||
      (dx === -1 && !currentCell.left) ||
      (dy === 1 && !currentCell.bottom) ||
      (dy === -1 && !currentCell.top)
    ) {
      player = { x: newX, y: newY };
      moveCount++;
      updateMoveCounter();

      if (newX === GOAL.x && newY === GOAL.y) {
        showWinningScreen();
        return;
      }

      if (isPathVisible) {
        path = bfs(maze, player, GOAL);
        if (path.length > 0) path.pop();
      }

      renderMaze();
    }
  }
}

function updateMoveCounter() {
  moveCounterElement.textContent = `Moves: ${moveCount}`;
}

function togglePath() {
  isPathVisible = !isPathVisible;
  if (isPathVisible) {
    path = bfs(maze, player, GOAL);
    if (path.length > 0) path.pop(); // Remove goal
  } else {
    path = [];
  }
  renderMaze();
}

function showWinningScreen() {
  hasWon = true;
  const url = `win.html?player=${moveCount}&optimal=${optimalMoves !== null ? optimalMoves : '-'}`;
  window.location.href = url;
}
