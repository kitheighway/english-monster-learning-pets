import { CheckCircle2, Flame, Layers, Zap } from 'lucide-react';
import { safeExplanation } from '../lib/gameUtils.js';
import { clamp } from '../lib/math.js';
import ProgressBar from '../components/common/ProgressBar.jsx';
import TopBar from '../components/common/TopBar.jsx';

export default function LessonScreen({
  lessonMode,
  lessonQueue,
  qIndex,
  currentQuestion,
  selectedIndex,
  isLocked,
  triesLeft,
  toast,
  shake,
  lessonCorrect,
  lessonXpEarned,
  lessonStreak,
  onGoHome,
  onAnswer,
  onContinue,
}) {
  const total = lessonQueue.length || 0;
  const current = qIndex + 1;
  const lessonPct = total > 0 ? clamp(Math.round((current / total) * 100), 0, 100) : 0;
  const correctIndex = currentQuestion?.correctIndex;

  return (
    <>
      <div className="sparkles" />
      <div className="wrap">
        <TopBar onBack={onGoHome}>
          <span className="pillMini">
            <Layers size={16} />
            {lessonMode}
          </span>
          <span className="pillMini">
            <Zap size={16} />Q {current}/{total}
          </span>
          <span className="pillMini">
            <Flame size={16} />
            STREAK {lessonStreak}
          </span>
        </TopBar>

        <div className="card">
          <div className="cardTop">
            <div className="progressTop">
              <span>LESSON PROGRESS</span>
              <span>{lessonPct}%</span>
            </div>
            <ProgressBar value={lessonPct} />
          </div>

          <div className={`cardBody ${shake ? 'wiggle' : ''}`}>
            <div className="prompt">{currentQuestion?.prompt ?? 'Loading…'}</div>

            <div className="choices">
              {(currentQuestion?.choices ?? []).map((choice, index) => {
                const reveal = isLocked;
                const isCorrect = reveal && index === correctIndex;
                const isWrongSelected = reveal && selectedIndex === index && index !== correctIndex;

                const className = ['choice', isCorrect ? 'correct' : '', isWrongSelected ? 'wrong' : '']
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    key={`${qIndex}-${index}`}
                    className={className}
                    onClick={() => onAnswer(index)}
                    disabled={isLocked}
                    type="button"
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {!!toast.text && (
              <div className={`toast ${toast.type === 'good' ? 'good' : toast.type === 'bad' ? 'bad' : ''}`}>
                <span>{toast.text}</span>
                {toast.type === 'bad' && !isLocked ? (
                  <span className="toastRight">{triesLeft} retry left</span>
                ) : null}
              </div>
            )}

            {isLocked && typeof correctIndex === 'number' ? (
              <details className="hint" open={toast.type === 'bad'}>
                <summary>Why?</summary>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 950, marginBottom: 6 }}>
                    Correct answer: {currentQuestion.choices[correctIndex]}
                  </div>
                  <div>{safeExplanation(currentQuestion)}</div>
                </div>
              </details>
            ) : null}

            <button
              className={`continueBtn ${isLocked ? 'show' : ''}`}
              onClick={onContinue}
              type="button"
              disabled={!isLocked}
            >
              <CheckCircle2 size={18} />
              CONTINUE
            </button>

            <div className="lessonFooter">
              <div>Correct: {lessonCorrect}</div>
              <div>XP earned: {lessonXpEarned}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
