const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const DIRECTIONS = [
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: -1 },
  { row: 0, col: -1 },
  { row: -1, col: 0 },
  { row: -1, col: -1 },
  { row: -1, col: 1 },
];

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomLetter() {
  return LETTERS[randomInt(LETTERS.length)];
}

export function createEmptyGrid(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "")
  );
}

function isInside(grid, row, col) {
  return row >= 0 && row < grid.length && col >= 0 && col < grid.length;
}

function canPlaceWord(grid, word, startRow, startCol, direction) {
  for (let i = 0; i < word.length; i += 1) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;

    if (!isInside(grid, row, col)) return false;

    const current = grid[row][col];
    if (current && current !== word[i]) return false;
  }

  return true;
}

function placeWord(grid, word, startRow, startCol, direction) {
  const cells = [];

  for (let i = 0; i < word.length; i += 1) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;
    grid[row][col] = word[i];
    cells.push({ row, col });
  }

  return cells;
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function coordsToKey(cells) {
  return cells
    .map(({ row, col }) => `${row}-${col}`)
    .sort()
    .join("|");
}

export function buildFoundMap(placements) {
  const map = new Map();

  Object.entries(placements).forEach(([word, cells]) => {
    map.set(coordsToKey(cells), word);
  });

  return map;
}

export function generateWordSearch(level) {
  const size = level.size ?? 10;
  const words = level.words.map((word) => word.toUpperCase());
  const grid = createEmptyGrid(size);
  const placements = {};

  const orderedWords = shuffleArray(words).sort((a, b) => b.length - a.length);

  for (const word of orderedWords) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 500) {
      attempts += 1;

      const direction = DIRECTIONS[randomInt(DIRECTIONS.length)];
      const startRow = randomInt(size);
      const startCol = randomInt(size);

      if (canPlaceWord(grid, word, startRow, startCol, direction)) {
        placements[word] = placeWord(grid, word, startRow, startCol, direction);
        placed = true;
      }
    }

    if (!placed) {
      throw new Error(`Unable to place word: ${word}`);
    }
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!grid[row][col]) {
        grid[row][col] = randomLetter();
      }
    }
  }

  return {
    size,
    words,
    grid,
    placements,
  };
}

export function getCellsInLine(startCell, endCell) {
  if (!startCell || !endCell) return [];

  const rowDiff = endCell.row - startCell.row;
  const colDiff = endCell.col - startCell.col;

  const stepRow = Math.sign(rowDiff);
  const stepCol = Math.sign(colDiff);

  const absRow = Math.abs(rowDiff);
  const absCol = Math.abs(colDiff);

  const isHorizontal = rowDiff === 0 && colDiff !== 0;
  const isVertical = colDiff === 0 && rowDiff !== 0;
  const isDiagonal = absRow === absCol && absRow !== 0;
  const isSingle = rowDiff === 0 && colDiff === 0;

  if (!(isHorizontal || isVertical || isDiagonal || isSingle)) {
    return [];
  }

  const length = Math.max(absRow, absCol) + 1;
  const cells = [];

  for (let i = 0; i < length; i += 1) {
    cells.push({
      row: startCell.row + stepRow * i,
      col: startCell.col + stepCol * i,
    });
  }

  return cells;
}

export function selectionToWord(grid, cells) {
  return cells.map(({ row, col }) => grid[row][col]).join("");
}