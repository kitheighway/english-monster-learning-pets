import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, Sparkles, Trophy, RotateCcw, Eraser } from "lucide-react";
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
  const [feedback, setFeedback] = useState("Drag across the letters to find a word!");
  const [celebrating, setCelebrating] = useState(false);

  const level = wordSearchLevels[levelIndex];

  const puzzle = useMemo(() => generateWordSearch(level), [level, refreshSeed]);
  const foundLookup = useMemo(() => buildFoundMap(puzzle.placements), [puzzle.placements]);

  const selectionCells = useMemo(() => {
    return getCellsInLine(startCell, hoverCell);
  }, [startCell, hoverCell]);

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
    setFeedback(level.instruction || "Find all the hidden words!");
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
      setFeedback("Oops! That line is not one of the hidden words.");
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
      setFeedback(`YES! You found ${matchedWord}!`);
    } else {
      setFeedback(`Great job! ${matchedWord} is complete!`);
    }

    clearSelection();

    if (nextWords.length === puzzle.words.length) {
      setCelebrating(true);
      setFeedback("AMAZING! You found every hidden word!");
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
    <>
      <div className="sparkles" />

      <section className="wrap wsPage">
        <div className="homeHeader">
          <div className="brandRow">
            <div className="badgeMark" aria-hidden="true" />
            <div>
              <h1 className="brandTitle">Word Search Quest</h1>
              <p className="brandSub">
                Find the hidden words. Big fun round the page. Clean modern puzzle in the middle.
              </p>
            </div>
          </div>

          <div className="homeActions">
            <button type="button" className="btnGhost" onClick={onBack}>
              <ArrowLeft size={18} />
              Back home
            </button>
          </div>
        </div>

        <div className="wsTopRow">
          <div className="pillMini">
            <Search size={16} />
            Word Search
          </div>

          <div className="pillMini">
            <Sparkles size={16} />
            +{level.rewardXp} XP
          </div>

          <div className="pillMini">
            <Trophy size={16} />
            {foundWords.length}/{puzzle.words.length} found
          </div>
        </div>

        <div className="wsLayout">
          <div className="panelCard wsBoardPanel">
            <div className="panelTitle">
              <Search size={18} />
              {level.title}
            </div>

            <div className="note wsSubtitle">{level.subtitle}</div>

            <div className="xpBox wsProgressBox">
              <div className="xpTop">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="track">
                <div className="fill" style={{ "--pct": `${progress}%` }} />
              </div>
            </div>

            <div className={`toast ${celebrating ? "good" : ""} wsToast`}>
              <span>{feedback}</span>
              <span className="toastRight">{isComplete ? "DONE!" : "KEEP GOING"}</span>
            </div>

            <div className="wsGridWrap">
              <div
                className="wsGrid"
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
                          "wsCell",
                          isSelected ? "is-selected" : "",
                          isFound ? "is-found" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onPointerDown={() => beginSelection(rowIndex, colIndex)}
                        onPointerEnter={() => extendSelection(rowIndex, colIndex)}
                        aria-label={`Letter ${letter}`}
                      >
                        {letter}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="ctaStack wsActionStack">
              <button type="button" className="smallCta" onClick={playAgain}>
                <RotateCcw size={18} />
                New puzzle
              </button>

              <button type="button" className="smallCta" onClick={clearSelection}>
                <Eraser size={18} />
                Clear line
              </button>
            </div>
          </div>

          <div className="wsSideCol">
            <div className="panelCard wsWordsPanel">
              <div className="panelTitle">
                <Sparkles size={18} />
                Find these words
              </div>

              <div className="wsWordList">
                {puzzle.words.map((word) => {
                  const done = foundWords.includes(word);

                  return (
                    <div key={word} className={`wsWordChip ${done ? "done" : ""}`}>
                      <span>{word}</span>
                      <span>{done ? "✓" : "•"}</span>
                    </div>
                  );
                })}
              </div>

              <div className="note">Words can go across, down, or diagonal.</div>
            </div>

            <div className="panelCard wsHowPanel">
              <div className="panelTitle">
                <Search size={18} />
                How to play
              </div>

              <div className="wsHowList">
                <div className="wsHowItem">1. Press a letter to start.</div>
                <div className="wsHowItem">2. Drag in a straight line.</div>
                <div className="wsHowItem">3. Let go to check your word.</div>
              </div>
            </div>

            {celebrating && (
              <div className="panelCard wsWinPanel">
                <div className="panelTitle">
                  <Trophy size={18} />
                  You did it!
                </div>

                <div className="note">You found every hidden word in this puzzle.</div>

                <div className="ctaStack">
                  <button type="button" className="bigCta" onClick={goNextLevel}>
                    <Sparkles size={18} />
                    {levelIndex < wordSearchLevels.length - 1 ? "NEXT PUZZLE" : "PLAY AGAIN"}
                  </button>

                  <button type="button" className="smallCta" onClick={onBack}>
                    <ArrowLeft size={18} />
                    BACK HOME
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}