# Tennis Pong — React Native (Expo)
> by Brooklyn Guo

## How to create from scratch a react native project:
```
npx create-expo-app@latest gomoku-app
cd gomoku-app
```

## How to build for first time:
```
npx expo prebuild --clean --platform android
cd android
./gradlew assembleRelease
```

### You can find the Release Build in the folder path: 
```
TennisPong/android/app/build/outputs/apk/release/app-release.apk
```

## How to test the app locally on laptop via simulator before building apk:
```
npx expo start -c
```
Then, click "i" to test in ios simulator.

## After making changes, how to build subsequent apk:
```
rm -rf android/
npx expo prebuild --clean --platform android
cd android
./gradlew assembleRelease
```

## Additional commands to build using EAS/Expo Go if you want to put the build on the Expo server queue:
```
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
npx expo run:android ?
```


## Project Structure

```
TennisPong/
├── app/
│   ├── _layout.tsx       ← Expo Router root layout
│   ├── index.tsx         ← Home screen (court picker + opponent selector)
│   └── game.tsx          ← Game screen (canvas + touch controls)
├── constants/
│   └── courts.ts         ← Court colors + AI opponent definitions
├── hooks/
│   └── gameLogic.ts      ← All game physics + AI logic (ported from Python)
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## Setup Commands

### Step 1 — Create the Expo project

```bash
npx create-expo-app@latest TennisPong --template blank-typescript
cd TennisPong
```

### Step 2 — Install dependencies

```bash
npx expo install expo-router react-native-screens react-native-safe-area-context
npx expo install @shopify/react-native-skia
npx expo install react-native-reanimated
```

### Step 3 — Replace generated files with the provided source files

Copy all files from this repo into the project root, replacing any that already exist:
- `app/_layout.tsx`
- `app/index.tsx`
- `app/game.tsx`
- `constants/courts.ts`
- `hooks/gameLogic.ts`
- `app.json` (update your bundle ID if needed)
- `babel.config.js`
- `tsconfig.json`

### Step 4 — Update app.json entry point

Make sure your `package.json` has this:
```json
"main": "expo-router/entry"
```

### Step 5 — Run the app

```bash
# Start dev server
npx expo start

# Then press:
#   i  →  iOS Simulator
#   a  →  Android Emulator
#   Scan QR code with Expo Go on your phone
```

---

## How to Play

### Home Screen
- **SELECT COURT** — swipe through the horizontal court chips to pick a surface color (all 11 real-world courts from your Python version are here: AO, USO, Wimbledon, Roland Garros, etc.)
- **SELECT OPPONENT** — tap one of the 8 opponent cards:
  - 👥 Local 2 Player — both players use touch/drag on the same device
  - 🟢 Basic — returns to center
  - 👻 Phantom — cross-court & inside-out only
  - 🎯 Sentinel — down the line only
  - ⚡ Titan — targets the open side with randomness
  - 🔥 Rival — hits perfectly into the open corner
  - 💀 Teleporter — unbeatable, teleports to every ball
  - 🕶️ Matrix — reads your movement, hits the opposite way
- Tap **PLAY** to start

### In Game
- **P1 (you, bottom paddle)** — drag your finger anywhere in the bottom half of the screen
- **P2 (top paddle, local 2P)** — drag in the top half of the screen
- **⏸ / ▶** — pause/resume
- **✕** — quit to home screen
- The stats bar at the bottom shows current rally length and ball speed

---

## AI Logic (ported 1:1 from Python)

| AI | Strategy |
|---|---|
| Basic | Tracks ball to center of paddle |
| Phantom | Always aims cross-court / inside-out |
| Sentinel | Always aims down the line |
| Titan | Targets open side with 10–80% randomness |
| Rival | Perfectly targets open corner, bounded |
| Teleporter | Instantly teleports paddle to ball position |
| Matrix | Reads opponent velocity → hits the opposite direction |

---

## Notes
- The game canvas is 400×600 (matching your Python constants) and scales to fit any screen width
- Ball physics, relative hit calculation, and speed increment are all ported exactly from your Python code
- Touch/drag maps finger X position → paddle center, matching the feel of arrow-key control


