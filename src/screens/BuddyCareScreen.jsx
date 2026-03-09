import { Play, Smile, Utensils } from 'lucide-react';
import { hasAnyFood } from '../lib/gameUtils.js';
import { DEFAULT_PROFILE } from '../config/gameConfig.js';
import BuddyPreview from '../components/common/BuddyPreview.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import TopBar from '../components/common/TopBar.jsx';

export default function BuddyCareScreen({
  profile,
  buddyAction,
  lessonMode,
  onGoHome,
  onFeedBuddy,
  onStartLesson,
}) {
  const hunger = profile.pet?.hunger ?? DEFAULT_PROFILE.pet.hunger;
  const happiness = profile.pet?.happiness ?? DEFAULT_PROFILE.pet.happiness;

  return (
    <>
      <div className="sparkles" />
      <div className="wrap">
        <TopBar onBack={onGoHome}>
          <span className="pillMini">
            <Smile size={16} />
            BUDDY CARE
          </span>
        </TopBar>

        <div className="card">
          <div className="cardTop">
            <div className="progressTop">
              <span>YOUR BUDDY</span>
              <span>Level {profile.level}</span>
            </div>
          </div>

          <div className="cardBody">
            <BuddyPreview action={buddyAction} large />

            <div className="petPanel">
              <div className="petBars">
                <div className="petBar">
                  <div className="petBarLabel">Hunger</div>
                  <ProgressBar value={hunger} />
                </div>

                <div className="petBar">
                  <div className="petBarLabel">Happiness</div>
                  <ProgressBar value={happiness} />
                </div>
              </div>

              <div className="foodRow">
                <div className="foodChip">Snack: {profile.food?.snack ?? 0}</div>
                <div className="foodChip">Meal: {profile.food?.meal ?? 0}</div>
                <div className="foodChip">Treat: {profile.food?.treat ?? 0}</div>
              </div>

              <div className="ctaStack">
                <button
                  className="bigCta"
                  type="button"
                  onClick={onFeedBuddy}
                  disabled={!hasAnyFood(profile.food)}
                >
                  <Utensils size={18} />
                  FEED BUDDY
                </button>

                <button className="smallCta" type="button" onClick={() => onStartLesson(lessonMode)}>
                  <Play size={18} />
                  START A LESSON
                </button>
              </div>

              <div className="note">Earn food when you level up. Feeding boosts hunger + happiness.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
