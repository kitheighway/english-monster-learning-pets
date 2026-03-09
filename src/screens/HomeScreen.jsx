import { BarChart3, Heart, Layers, Play, RotateCcw, Smile, Sparkles, Target } from 'lucide-react';
import { xpToLevel } from '../lib/gameUtils.js';
import { clamp } from '../lib/math.js';
import BuddyPreview from '../components/common/BuddyPreview.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import StatBox from '../components/common/StatBox.jsx';

export default function HomeScreen({
  profile,
  lessonMode,
  modes,
  buddyAction,
  onResetProfile,
  onStartLesson,
  onSetLessonMode,
  onGoBuddyCare,
}) {
  const lifetimeAccuracy =
    profile.totalQuestionsAnswered > 0
      ? Math.round((profile.totalCorrect / profile.totalQuestionsAnswered) * 100)
      : 0;

  const nextLevelXp = xpToLevel(profile.level);
  const profileXpPct = clamp(Math.round((profile.xp / nextLevelXp) * 100), 0, 100);

  return (
    <>
      <div className="sparkles" />
      <div className="wrap">
        <div className="homeHeader">
          <div className="brandRow">
            <div className="badgeMark" aria-hidden="true" />
            <div>
              <h1 className="brandTitle">English Buddy Quest</h1>
              <p className="brandSub">BIG bright lessons. Chunky progress. Cute buddy.</p>
            </div>
          </div>

          <div className="homeActions">
            <button className="btnGhost" onClick={onResetProfile} type="button">
              <RotateCcw size={18} />
              Reset profile
            </button>
          </div>
        </div>

        <div className="homeGrid">
          <div className="panelCard">
            <div className="panelTitle">
              <Play size={18} />
              Start a lesson
            </div>

            <div className="ctaStack">
              <button className="bigCta" onClick={() => onStartLesson(lessonMode)} type="button">
                <Play size={18} />
                START LESSON
              </button>

              <button className="smallCta" onClick={() => onStartLesson('All')} type="button">
                <Sparkles size={18} />
                JUMP INTO FULL BANK
              </button>
            </div>

            <div className="note">Pick a mode, then smash start.</div>
          </div>

          <div className="panelCard">
            <div className="panelTitle">
              <BarChart3 size={18} />
              Your stats
            </div>

            <div className="statGrid">
              <StatBox label="Level" value={profile.level} />
              <StatBox label="Lifetime accuracy" value={`${lifetimeAccuracy}%`} />
              <StatBox label="Sessions" value={profile.sessionsCompleted} />
              <StatBox label="Best lesson" value={`${profile.bestAccuracy || 0}%`} />
            </div>

            <div className="xpBox">
              <div className="xpTop">
                <span>XP to next level</span>
                <span>
                  {profile.xp} / {nextLevelXp}
                </span>
              </div>
              <ProgressBar value={profileXpPct} />
            </div>
          </div>

          <div className="panelCard">
            <div className="panelTitle">
              <Layers size={18} />
              Choose your mode
            </div>

            <div className="modeRow">
              {modes.map((mode) => (
                <button
                  key={mode}
                  className={`modeChip ${lessonMode === mode ? 'active' : ''}`}
                  onClick={() => onSetLessonMode(mode)}
                  type="button"
                >
                  <Target size={16} />
                  {mode}
                </button>
              ))}
            </div>

            <div className="note">Modes keep it focused. “All” runs everything.</div>
          </div>

          <div className="panelCard">
            <div className="panelTitle">
              <Smile size={18} />
              Your buddy
            </div>

            <BuddyPreview action={buddyAction} />

            <div className="ctaStack">
              <button className="smallCta" onClick={onGoBuddyCare} type="button">
                <Heart size={18} />
                BUDDY CARE
              </button>
            </div>

            <div className="note">Feed your buddy and check stats in Buddy Care.</div>
          </div>
        </div>
      </div>
    </>
  );
}
