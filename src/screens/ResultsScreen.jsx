import { Home, Play, Trophy } from 'lucide-react';
import { xpToLevel } from '../lib/gameUtils.js';
import { clamp } from '../lib/math.js';
import ProgressBar from '../components/common/ProgressBar.jsx';
import StatBox from '../components/common/StatBox.jsx';

export default function ResultsScreen({ profile, onPlayAgain, onGoHome }) {
  const last = profile.lastSession;
  const accuracy = last?.accuracy ?? 0;
  const lifetimeAccuracy =
    profile.totalQuestionsAnswered > 0
      ? Math.round((profile.totalCorrect / profile.totalQuestionsAnswered) * 100)
      : 0;

  const nextLevelTarget = xpToLevel(profile.level);
  const nextLevelPct = clamp(Math.round((profile.xp / nextLevelTarget) * 100), 0, 100);

  return (
    <>
      <div className="sparkles" />
      <div className="wrap">
        <div className="resultsCard">
          <div className="resultsTop">
            <div className="resultsTitle">
              <Trophy size={20} />
              LESSON COMPLETE!
            </div>
            <div className="resultsSub">
              {last ? (
                <>
                  <strong>{last.mode}</strong> • {last.correct}/{last.total} • {accuracy}%
                </>
              ) : (
                'Nice work.'
              )}
            </div>

            {profile.lastRewards ? (
              <div className="rewardBanner">
                <div className="rewardTitle">LEVEL UP REWARDS!</div>
                <div className="rewardLine">
                  +{profile.lastRewards.levelsGained} level
                  {profile.lastRewards.levelsGained > 1 ? 's' : ''} • Snack +
                  {profile.lastRewards.rewards.snack} • Meal +{profile.lastRewards.rewards.meal} • Treat +
                  {profile.lastRewards.rewards.treat}
                </div>
              </div>
            ) : null}
          </div>

          <div className="resultsGrid">
            <StatBox label="Accuracy" value={`${accuracy}%`} />
            <StatBox label="XP earned" value={`+${last?.xpEarned ?? 0}`} />
            <StatBox label="New level" value={profile.level} />
            <StatBox label="Lifetime accuracy" value={`${lifetimeAccuracy}%`} />
          </div>

          <div className="xpBox">
            <div className="xpTop">
              <span>XP to next level</span>
              <span>
                {profile.xp} / {nextLevelTarget}
              </span>
            </div>
            <ProgressBar value={nextLevelPct} />
          </div>

          <div className="resultsActions">
            <button className="bigCta" onClick={() => onPlayAgain(last?.mode ?? 'All')} type="button">
              <Play size={18} />
              PLAY AGAIN
            </button>
            <button className="smallCta" onClick={onGoHome} type="button">
              <Home size={18} />
              BACK TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
