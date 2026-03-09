import useAppState from './hooks/useAppState.js';
import BuddyCareScreen from './screens/BuddyCareScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import LessonScreen from './screens/LessonScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';

export default function App() {
  const {
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
    lessonXpEarned,
    lessonStreak,
    modes,
    currentQuestion,
    actions,
  } = useAppState();

  if (screen === SCREENS.HOME) {
    return (
      <HomeScreen
        profile={profile}
        lessonMode={lessonMode}
        modes={modes}
        buddyAction={buddyAction}
        onResetProfile={actions.resetProfile}
        onStartLesson={actions.startLesson}
        onSetLessonMode={actions.setLessonMode}
        onGoBuddyCare={actions.goBuddyCare}
      />
    );
  }

  if (screen === SCREENS.BUDDY) {
    return (
      <BuddyCareScreen
        profile={profile}
        buddyAction={buddyAction}
        lessonMode={lessonMode}
        onGoHome={actions.goHome}
        onFeedBuddy={actions.feedBuddy}
        onStartLesson={actions.startLesson}
      />
    );
  }

  if (screen === SCREENS.LESSON) {
    return (
      <LessonScreen
        lessonMode={lessonMode}
        lessonQueue={lessonQueue}
        qIndex={qIndex}
        currentQuestion={currentQuestion}
        selectedIndex={selectedIndex}
        isLocked={isLocked}
        triesLeft={triesLeft}
        toast={toast}
        shake={shake}
        lessonCorrect={lessonCorrect}
        lessonXpEarned={lessonXpEarned}
        lessonStreak={lessonStreak}
        onGoHome={actions.goHome}
        onAnswer={actions.answer}
        onContinue={actions.continueAfterAnswer}
      />
    );
  }

  return (
    <ResultsScreen
      profile={profile}
      onPlayAgain={actions.startLesson}
      onGoHome={actions.goHome}
    />
  );
}
