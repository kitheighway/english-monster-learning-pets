import { useMemo, useRef, useState } from 'react';
import { QUESTION_BANK } from '../data/questions.js';
import { BUDDY_ACTION_DURATION_MS, DEFAULT_PROFILE } from '../config/gameConfig.js';
import {
  addFood,
  applyXp,
  hasAnyFood,
  makeLevelUpRewards,
  safeHint,
  safeMode,
  shuffle,
} from '../lib/gameUtils.js';
import { clamp01to100 } from '../lib/math.js';
import { loadProfile, saveProfile } from '../lib/profileStorage.js';

const SCREENS = {
  HOME: 'home',
  BUDDY: 'buddy',
  LESSON: 'lesson',
  RESULTS: 'results',
};

function awardXp({ correct, streakAfter }) {
  if (!correct) return 0;
  const base = 10;
  const bonus = Math.min(streakAfter, 5);
  return base + bonus;
}

export default function useAppState() {
  const bank = useMemo(() => QUESTION_BANK, []);
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [profile, setProfile] = useState(() => loadProfile() ?? DEFAULT_PROFILE);

  const [lessonMode, setLessonMode] = useState('All');
  const [lessonQueue, setLessonQueue] = useState([]);
  const [qIndex, setQIndex] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [triesLeft, setTriesLeft] = useState(1);
  const [toast, setToast] = useState({ type: 'neutral', text: '' });
  const [buddyAction, setBuddyAction] = useState('idle');
  const [shake, setShake] = useState(false);

  const [lessonCorrect, setLessonCorrect] = useState(0);
  const [lessonAnswered, setLessonAnswered] = useState(0);
  const [lessonXpEarned, setLessonXpEarned] = useState(0);
  const [lessonStreak, setLessonStreak] = useState(0);

  const buddyTimerRef = useRef(null);

  const modes = useMemo(() => {
    const set = new Set(bank.map((question) => safeMode(question)));
    return ['All', ...Array.from(set).sort()];
  }, [bank]);

  const currentQuestion = lessonQueue[qIndex];

  function setBuddyActionTemporarily(action) {
    if (buddyTimerRef.current) {
      window.clearTimeout(buddyTimerRef.current);
      buddyTimerRef.current = null;
    }

    setBuddyAction(action);

    if (action !== 'idle') {
      const duration = BUDDY_ACTION_DURATION_MS[action] ?? 1200;
      buddyTimerRef.current = window.setTimeout(() => {
        setBuddyAction('idle');
        buddyTimerRef.current = null;
      }, duration);
    }
  }

  function resetQuestionState() {
    setSelectedIndex(null);
    setIsLocked(false);
    setTriesLeft(1);
    setToast({ type: 'neutral', text: '' });
    setShake(false);
  }

  function goHome() {
    setScreen(SCREENS.HOME);
    setBuddyAction('idle');
  }

  function goBuddyCare() {
    setScreen(SCREENS.BUDDY);
    setBuddyAction('idle');
  }

  function resetProfile() {
    setProfile(DEFAULT_PROFILE);
    saveProfile(DEFAULT_PROFILE);
  }

  function startLesson(mode = 'All') {
    const filtered = mode === 'All' ? bank : bank.filter((question) => safeMode(question) === mode);
    const queue = shuffle(filtered);

    setLessonMode(mode);
    setLessonQueue(queue);
    setQIndex(0);

    resetQuestionState();
    setLessonCorrect(0);
    setLessonAnswered(0);
    setLessonXpEarned(0);
    setLessonStreak(0);
    setScreen(SCREENS.LESSON);
  }

  function answer(choiceIndex) {
    if (screen !== SCREENS.LESSON || isLocked) return;

    if (
      !currentQuestion ||
      !Array.isArray(currentQuestion.choices) ||
      typeof currentQuestion.correctIndex !== 'number'
    ) {
      setToast({ type: 'bad', text: 'This question is missing data. Tap Continue.' });
      setIsLocked(true);
      return;
    }

    setSelectedIndex(choiceIndex);

    const correct = choiceIndex === currentQuestion.correctIndex;

    if (correct) {
      const nextStreak = lessonStreak + 1;
      const xpGain = awardXp({ correct: true, streakAfter: nextStreak });

      setLessonStreak(nextStreak);
      setLessonCorrect((value) => value + 1);
      setLessonAnswered((value) => value + 1);
      setLessonXpEarned((value) => value + xpGain);
      setBuddyActionTemporarily('correct');
      setToast({ type: 'good', text: `Correct! +${xpGain} XP` });
      setIsLocked(true);
      return;
    }

    setLessonStreak(0);
    setShake(true);
    window.setTimeout(() => setShake(false), 220);

    if (triesLeft > 0) {
      setTriesLeft((value) => value - 1);
      setToast({ type: 'bad', text: `Not quite — hint: ${safeHint(currentQuestion)}` });
      return;
    }

    setLessonAnswered((value) => value + 1);
    setToast({ type: 'bad', text: 'Not quite — showing the correct answer.' });
    setIsLocked(true);
  }

  function finishLesson() {
    const total = lessonQueue.length || 0;
    const correct = lessonCorrect;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    let nextProfile = { ...profile };

    nextProfile.pet = nextProfile.pet || { ...DEFAULT_PROFILE.pet };
    nextProfile.food = nextProfile.food || { ...DEFAULT_PROFILE.food };

    nextProfile.sessionsCompleted += 1;
    nextProfile.totalQuestionsAnswered += total;
    nextProfile.totalCorrect += correct;
    nextProfile.bestAccuracy = Math.max(nextProfile.bestAccuracy || 0, accuracy);

    const beforeLevel = nextProfile.level;
    nextProfile = applyXp(nextProfile, lessonXpEarned);
    const afterLevel = nextProfile.level;
    const levelsGained = Math.max(0, afterLevel - beforeLevel);

    nextProfile.pet.hunger = clamp01to100(nextProfile.pet.hunger - 8);
    nextProfile.pet.happiness = clamp01to100(nextProfile.pet.happiness + 4);

    if (levelsGained > 0) {
      const rewards = makeLevelUpRewards(levelsGained);
      nextProfile.food = addFood(nextProfile.food, rewards);
      nextProfile.lastRewards = {
        levelsGained,
        rewards,
        dateISO: new Date().toISOString(),
      };
    } else {
      nextProfile.lastRewards = null;
    }

    nextProfile.lastSession = {
      accuracy,
      correct,
      total,
      xpEarned: lessonXpEarned,
      mode: lessonMode,
      dateISO: new Date().toISOString(),
    };

    setProfile(nextProfile);
    saveProfile(nextProfile);
    setScreen(SCREENS.RESULTS);
    setBuddyActionTemporarily('correct');
  }

  function continueAfterAnswer() {
    if (screen !== SCREENS.LESSON || !isLocked) return;

    const nextIndex = qIndex + 1;
    const isLastQuestion = nextIndex >= lessonQueue.length;

    if (isLastQuestion) {
      finishLesson();
      return;
    }

    setQIndex(nextIndex);
    resetQuestionState();
  }

  function feedBuddy() {
    if (!hasAnyFood(profile.food)) return;

    const nextProfile = {
      ...profile,
      pet: { ...(profile.pet || DEFAULT_PROFILE.pet) },
      food: { ...(profile.food || DEFAULT_PROFILE.food) },
    };

    if ((nextProfile.food.snack || 0) > 0) {
      nextProfile.food.snack -= 1;
      nextProfile.pet.hunger = clamp01to100((nextProfile.pet.hunger ?? 60) + 18);
      nextProfile.pet.happiness = clamp01to100((nextProfile.pet.happiness ?? 60) + 6);
    } else if ((nextProfile.food.meal || 0) > 0) {
      nextProfile.food.meal -= 1;
      nextProfile.pet.hunger = clamp01to100((nextProfile.pet.hunger ?? 60) + 30);
      nextProfile.pet.happiness = clamp01to100((nextProfile.pet.happiness ?? 60) + 10);
    } else if ((nextProfile.food.treat || 0) > 0) {
      nextProfile.food.treat -= 1;
      nextProfile.pet.hunger = clamp01to100((nextProfile.pet.hunger ?? 60) + 10);
      nextProfile.pet.happiness = clamp01to100((nextProfile.pet.happiness ?? 60) + 22);
    }

    setProfile(nextProfile);
    saveProfile(nextProfile);
    setBuddyActionTemporarily('feed');
  }

  return {
    SCREENS,
    screen,
    profile,
    lessonMode,
    lessonQueue,
    qIndex,
    selectedIndex,
    isLocked,
    triesLeft,
    toast,
    buddyAction,
    shake,
    lessonCorrect,
    lessonAnswered,
    lessonXpEarned,
    lessonStreak,
    modes,
    currentQuestion,
    actions: {
      setLessonMode,
      goHome,
      goBuddyCare,
      resetProfile,
      startLesson,
      answer,
      continueAfterAnswer,
      feedBuddy,
    },
  };
}
