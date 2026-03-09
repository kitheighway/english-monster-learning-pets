// src/components/WordleGame.jsx

import React, { useState, useEffect } from "react";

import { WORDLE_WORDS } from "../data/wordleWords.js";

const MAX_ATTEMPTS = 6;

const WordleGame = () => {
  const [targetWord, setTargetWord] = useState("");
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);
  const [guessCount, setGuessCount] = useState(0);

  // Select a random word from the list
  useEffect(() => {
    const randomWord = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
    setTargetWord(randomWord);
  }, []);

  // Check guess and provide feedback
  const checkGuess = () => {
    if (guess.length !== targetWord.length) return;

    const feedback = guess.split("").map((letter, index) => {
      if (letter === targetWord[index]) {
        return "green"; // Correct letter, correct position
      } else if (targetWord.includes(letter)) {
        return "yellow"; // Correct letter, wrong position
      } else {
        return "gray"; // Incorrect letter
      }
    });

    setAttempts((prev) => [...prev, { guess, feedback }]);
    setGuessCount((prev) => prev + 1);

    if (guess === targetWord) {
      setGameStatus("won");
    } else if (guessCount === MAX_ATTEMPTS - 1) {
      setGameStatus("lost");
    }

    setGuess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkGuess();
  };

  return (
    <div className="wordle-game">
      <h2>Wordle Challenge</h2>
      <p>Guess the word from the Year 6 curriculum!</p>

      {/* Game Status */}
      {gameStatus === "won" && <div>Congrats! You guessed the word!</div>}
      {gameStatus === "lost" && (
        <div>Sorry! You lost. The word was {targetWord}.</div>
      )}

      {/* Word Guesses */}
      <div className="guess-rows">
        {attempts.map((attempt, index) => (
          <div key={index} className="guess-row">
            {attempt.guess.split("").map((letter, i) => (
              <span key={i} className={`letter ${attempt.feedback[i]}`}>
                {letter}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Input for the next guess */}
      {gameStatus === null && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={guess}
            maxLength={targetWord.length || 12}
            onChange={(e) => setGuess(e.target.value.toUpperCase())}
            disabled={guessCount >= MAX_ATTEMPTS}
            placeholder="Guess the word"
            autoFocus
          />
          <button
            type="submit"
            disabled={guess.length !== targetWord.length || guessCount >= MAX_ATTEMPTS}
          >
            Submit
          </button>
        </form>
      )}

      {/* Info */}
      <p>Attempts remaining: {MAX_ATTEMPTS - guessCount}</p>
    </div>
  );
};

export default WordleGame;
