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

function bfs(maze, start, goal) {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));

  const queue = [start];
  visited[start.y][start.x] = true;

  const directions = [
    { dx: 0, dy: -1, dir: 'top', opp: 'bottom' },
    { dx: 1, dy: 0, dir: 'right', opp: 'left' },
    { dx: 0, dy: 1, dir: 'bottom', opp: 'top' },
    { dx: -1, dy: 0, dir: 'left', opp: 'right' },
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.x === goal.x && current.y === goal.y) break;

    for (const { dx, dy, dir, opp } of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (
        nx >= 0 && ny >= 0 &&
        nx < cols && ny < rows &&
        !visited[ny][nx] &&
        !maze[current.y][current.x][dir] && !maze[ny][nx][opp]
      ) {
        visited[ny][nx] = true;
        parent[ny][nx] = current;
        queue.push({ x: nx, y: ny });
      }
    }
  }

  const path = [];
  let curr = goal;
  while (curr && !(curr.x === start.x && curr.y === start.y)) {
    path.unshift(curr);
    curr = parent[curr.y][curr.x];
  }
  if (curr) path.unshift(start);

  return path;
}

function generateMaze(rows, cols) {
  const maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
    }))
  );

  const directions = [
    { dx: 0, dy: -1, dir: 'top', opp: 'bottom' },
    { dx: 1, dy: 0, dir: 'right', opp: 'left' },
    { dx: 0, dy: 1, dir: 'bottom', opp: 'top' },
    { dx: -1, dy: 0, dir: 'left', opp: 'right' },
  ];

  function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < cols && y < rows;
  }

  function carve(x, y) {
    maze[y][x].visited = true;
    const shuffled = directions.sort(() => Math.random() - 0.5);
    for (const { dx, dy, dir, opp } of shuffled) {
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny) && !maze[ny][nx].visited) {
        maze[y][x][dir] = false;
        maze[ny][nx][opp] = false;
        carve(nx, ny);
      }
    }
  }

  carve(0, 0);
  return maze;
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      movePlayer(0, -1);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      movePlayer(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      movePlayer(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      movePlayer(1, 0);
      break;
    case ' ':
      e.preventDefault();
      togglePath();
      break;
    default:
      break;
  }
});

initGame();
