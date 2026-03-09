import { useEffect, useMemo, useState } from "react";
import { wordSearchLevels } from "../data/wordSearchLevels";
import {
  buildFoundMap,
  coordsToKey,
  generateWordSearch,
  getCellsInLine,
  selectionToWord,
} from "../lib/wordSearchUtils";

function getCellId(row, col) {
  return `${row}-${col}`;
}

export default function WordSearchGame({
  onBack,
  onComplete,
  initialLevelIndex = 0,
}) {
  const [levelIndex, setLevelIndex] = useState(initialLevelIndex);
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [feedback, setFeedback] = useState("Let’s find the hidden words!");
  const [celebrating, setCelebrating] = useState(false);

  const level = wordSearchLevels[levelIndex];

  const puzzle = useMemo(() => {
    return generateWordSearch(level);
  }, [level, refreshSeed]);

  const foundLookup = useMemo(() => buildFoundMap(puzzle.placements), [puzzle]);
  const selectionCells = useMemo(
    () => getCellsInLine(startCell, hoverCell),
    [startCell, hoverCell]
  );

  const foundCellIds = useMemo(() => {
    const ids = new Set();

    foundWords.forEach((word) => {
      const cells = puzzle.placements[word] || [];
      cells.forEach((cell) => ids.add(getCellId(cell.row, cell.col)));
    });

    return ids;
  }, [foundWords, puzzle.placements]);

  const selectionIds = useMemo(() => {
    const ids = new Set();
    selectionCells.forEach((cell) => ids.add(getCellId(cell.row, cell.col)));
    return ids;
  }, [selectionCells]);

  const progress = Math.round((foundWords.length / puzzle.words.length) * 100);
  const isComplete = foundWords.length === puzzle.words.length;

  useEffect(() => {
    function handleGlobalPointerUp() {
      if (!dragging) return;
      finishSelection();
    }

    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  });

  useEffect(() => {
    setDragging(false);
    setStartCell(null);
    setHoverCell(null);
    setFoundWords([]);
    setFeedback(level.instruction || "Find all the hidden words.");
    setCelebrating(false);
  }, [levelIndex, refreshSeed, level.instruction]);

  function clearSelection() {
    setDragging(false);
    setStartCell(null);
    setHoverCell(null);
  }

  function beginSelection(row, col) {
    if (isComplete) return;
    setDragging(true);
    setStartCell({ row, col });
    setHoverCell({ row, col });
  }

  function extendSelection(row, col) {
    if (!dragging || isComplete) return;
    setHoverCell({ row, col });
  }

  function finishSelection() {
    if (!startCell || !hoverCell) {
      clearSelection();
      return;
    }

    const cells = getCellsInLine(startCell, hoverCell);
    const selectionKey = coordsToKey(cells);
    const matchedWord = foundLookup.get(selectionKey);
    const selectedWord = selectionToWord(puzzle.grid, cells);
    const reversedWord = selectedWord.split("").reverse().join("");

    if (!matchedWord) {
      setFeedback("Nice try! That one isn’t a hidden word.");
      clearSelection();
      return;
    }

    if (foundWords.includes(matchedWord)) {
      setFeedback(`You already found ${matchedWord}!`);
      clearSelection();
      return;
    }

    const nextWords = [...foundWords, matchedWord];
    setFoundWords(nextWords);

    if (selectedWord === matchedWord || reversedWord === matchedWord) {
      setFeedback(`Brilliant! You found ${matchedWord}!`);
    } else {
      setFeedback(`Great spotting! You found ${matchedWord}!`);
    }

    clearSelection();

    if (nextWords.length === puzzle.words.length) {
      setCelebrating(true);
      setFeedback("Amazing! You found every word!");
      onComplete?.({
        game: "wordsearch",
        levelId: level.id,
        rewardXp: level.rewardXp,
        wordsFound: nextWords.length,
      });
    }
  }

  function playAgain() {
    setRefreshSeed((value) => value + 1);
  }

  function goNextLevel() {
    if (levelIndex < wordSearchLevels.length - 1) {
      setLevelIndex((value) => value + 1);
    } else {
      playAgain();
    }
  }

  return (
    <section className="ws-game">
      <div className="ws-shell">
        <header className="ws-hero">
          <div className="ws-hero__left">
            <div className="ws-badges">
              <span className="ws-pill ws-pill--lime">Word Search</span>
              <span className="ws-pill ws-pill--gold">+{level.rewardXp} XP</span>
            </div>

            <h1 className="ws-title">{level.title}</h1>
            <p className="ws-subtitle">{level.subtitle}</p>

            <div className="ws-progressBlock">
              <div className="ws-progressMeta">
                <span>Progress</span>
                <strong>
                  {foundWords.length}/{puzzle.words.length}
                </strong>
              </div>
              <div className="ws-progressBar" aria-hidden="true">
                <div
                  className="ws-progressBar__fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="ws-hero__right">
            <button type="button" className="ws-btn ws-btn--ghost" onClick={onBack}>
              Back
            </button>
          </div>
        </header>

        <div className="ws-layout">
          <div className="ws-boardCard">
            <div className="ws-helper">
              <span className="ws-helper__emoji">🔎</span>
              <p>{feedback}</p>
            </div>

            <div
              className="ws-grid"
              style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
              role="grid"
              aria-label="Word search grid"
            >
              {puzzle.grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const id = getCellId(rowIndex, colIndex);
                  const isSelected = selectionIds.has(id);
                  const isFound = foundCellIds.has(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      className={[
                        "ws-cell",
                        isSelected ? "is-selected" : "",
                        isFound ? "is-found" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onPointerDown={() => beginSelection(rowIndex, colIndex)}
                      onPointerEnter={() => extendSelection(rowIndex, colIndex)}
                      aria-label={`Letter ${letter}`}
                    >
                      <span>{letter}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="ws-actions">
              <button type="button" className="ws-btn ws-btn--soft" onClick={playAgain}>
                New puzzle
              </button>
              <button type="button" className="ws-btn ws-btn--soft" onClick={clearSelection}>
                Clear
              </button>
            </div>
          </div>

          <aside className="ws-side">
            <div className="ws-card">
              <h2 className="ws-card__title">Find these words</h2>
              <ul className="ws-wordList">
                {puzzle.words.map((word) => {
                  const done = foundWords.includes(word);

                  return (
                    <li key={word} className={done ? "is-done" : ""}>
                      <span>{word}</span>
                      <span className="ws-wordList__icon">{done ? "✓" : "•"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="ws-card ws-card--tip">
              <h2 className="ws-card__title">How to play</h2>
              <p>{level.instruction}</p>
              <p>Words can go across, down, or diagonal.</p>
            </div>

            {celebrating && (
              <div className="ws-card ws-card--success">
                <div className="ws-successBurst">🎉</div>
                <h2 className="ws-card__title">You did it!</h2>
                <p>You found every hidden word in this puzzle.</p>

                <div className="ws-successActions">
                  <button
                    type="button"
                    className="ws-btn ws-btn--primary"
                    onClick={goNextLevel}
                  >
                    {levelIndex < wordSearchLevels.length - 1 ? "Next puzzle" : "Play again"}
                  </button>

                  <button
                    type="button"
                    className="ws-btn ws-btn--ghost"
                    onClick={onBack}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}