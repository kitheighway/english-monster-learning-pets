# English Buddy Quest

A future-ready React + Vite starter for an English learning app with:

- lesson flow
- XP and level progression
- rewards and buddy feeding
- 3D creature support
- safer JSX file naming
- a structure that is easier to grow over time

## What was improved

This version has been reorganised to make future development safer and easier:

- JSX component files use `.jsx`
- import paths match the actual file names
- the large `App.jsx` file now acts as a small screen router only
- app state has been moved into a dedicated hook
- each main screen now has its own component
- shared UI pieces like stat boxes, progress bars and buddy previews are reusable

## Current project structure

```text
english-learning-buddy/
├─ public/
│  └─ models/
│     └─ cactoro_blob_only_normalized.glb
├─ src/
│  ├─ components/
│  │  ├─ common/
│  │  │  ├─ BuddyFallback.jsx
│  │  │  ├─ BuddyPreview.jsx
│  │  │  ├─ ProgressBar.jsx
│  │  │  ├─ StatBox.jsx
│  │  │  └─ TopBar.jsx
│  │  ├─ AnimatedNumber.jsx
│  │  ├─ Avatar3D.jsx
│  │  ├─ ErrorBoundary.jsx
│  │  └─ WordleGame.jsx
│  ├─ config/
│  │  └─ gameConfig.js
│  ├─ data/
│  │  ├─ questions.js
│  │  └─ wordleWords.js
│  ├─ hooks/
│  │  └─ useAppState.js
│  ├─ lib/
│  │  ├─ gameUtils.js
│  │  ├─ math.js
│  │  └─ profileStorage.js
│  ├─ screens/
│  │  ├─ BuddyCareScreen.jsx
│  │  ├─ HomeScreen.jsx
│  │  ├─ LessonScreen.jsx
│  │  └─ ResultsScreen.jsx
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ .gitignore
├─ index.html
├─ jsconfig.json
├─ package.json
├─ README.md
└─ vite.config.js
```

## Why this structure is better

### App.jsx stays small

`App.jsx` should stay focused on deciding which screen to show.

### State lives in one place

`src/hooks/useAppState.js` now owns the lesson flow, buddy state, profile updates and navigation logic.

### Screens stay readable

Each screen is in its own file, so adding a new dashboard, game hub, inventory page or rewards page is much easier.

### Reusable UI stays reusable

Common visual pieces sit in `src/components/common/` so you do not repeat the same markup in multiple screens.

## Best way to grow this app next

As the project gets bigger, move toward a feature-based structure like this:

```text
src/
├─ app/
│  ├─ routes/
│  ├─ providers/
│  └─ store/
├─ features/
│  ├─ lessons/
│  │  ├─ components/
│  │  ├─ data/
│  │  ├─ hooks/
│  │  └─ utils/
│  ├─ buddy/
│  │  ├─ components/
│  │  ├─ data/
│  │  ├─ hooks/
│  │  └─ utils/
│  ├─ rewards/
│  ├─ inventory/
│  ├─ creatures/
│  └─ games/
│     ├─ wordle/
│     ├─ spelling/
│     ├─ grammar/
│     └─ listening/
├─ shared/
│  ├─ components/
│  ├─ hooks/
│  ├─ lib/
│  └─ styles/
```

## Practical rules for future development

1. One feature should mostly live in one folder.
2. Keep game rules out of screen files.
3. Keep rewards, creatures and unlocks data-driven.
4. Put asset paths in config or data files instead of scattering them across components.
5. Keep screen components presentational where possible.
6. When a feature grows, give it its own `hooks`, `components`, `data` and `utils`.

## Good next additions

### Creatures

Create a file such as `src/features/creatures/data/creatures.js` with fields like:

- `id`
- `name`
- `modelPath`
- `animationRanges`
- `unlockLevel`
- `rarity`
- `rewardType`

### Rewards and inventory

Create data for:

- foods
- coins or gems
- badges
- cosmetics
- lesson streak bonuses
- unlock requirements

### Games

Each new game should have its own feature folder, for example:

```text
src/features/games/wordle/
├─ components/
├─ data/
├─ hooks/
├─ utils/
└─ index.js
```

### Shared state

For now, the custom hook is fine.
When the app gets larger, move to either:

- React Context for simple shared state
- Zustand for a cleaner scalable game-style state setup

For this app, Zustand would likely be the best next upgrade once you add multiple games and systems.

## Run locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

## Exact GitHub upload steps

### Option 1: Upload in the GitHub website

1. Download and unzip the project.
2. Go to GitHub and sign in.
3. Click **New repository**.
4. Name it something like `english-learning-buddy`.
5. Click **Create repository**.
6. On the new empty repo page, click **uploading an existing file**.
7. Drag in all files and folders from the unzipped project.
8. Add a commit message like `Initial app structure`.
9. Click **Commit changes**.

### Option 2: Use Git on your computer

Open Terminal in the unzipped project folder and run:

```bash
git init
git add .
git commit -m "Initial future-ready app structure"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/english-learning-buddy.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Exact CodeSandbox steps after GitHub

1. Push the project to GitHub first.
2. Open CodeSandbox.
3. Choose **Create Sandbox** or **Import Project**.
4. Choose the GitHub import option.
5. Paste your GitHub repository URL.
6. Let CodeSandbox install dependencies.
7. Save the sandbox.

A common direct pattern is:

```text
https://codesandbox.io/p/github/YOUR-USERNAME/english-learning-buddy/main
```

## Suggested next refactor after this

A strong next step would be to:

- create a `features/buddy` folder
- move lesson data and lesson logic into a dedicated `features/lessons` area
- add a game hub screen
- add a rewards or inventory screen
- centralise creature definitions into one data file
