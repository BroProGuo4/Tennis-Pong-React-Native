import { AIKey } from '../constants/courts';

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;
export const COURT_LEFT = 40;
export const COURT_RIGHT = GAME_WIDTH - 40;
export const COURT_WIDTH = COURT_RIGHT - COURT_LEFT;
export const PADDLE_WIDTH = 80;
export const PADDLE_HEIGHT = 10;
export const BALL_SIZE = 15;
export const HIT_BOX_PADDING = 10;
export const P1_Y = GAME_HEIGHT - 80;
export const P2_Y = 80;
export const FPS = 60;

export interface GameState {
  p1X: number;
  p2X: number;
  p1PrevX: number;
  p2PrevX: number;
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  speedModifier: number;
  rallyLength: number;
  p1Score: number;
  p2Score: number;
  isRunning: boolean;
  isPaused: boolean;
  ballDestX: number | null;
  ballDestY: number | null;
}

export const INITIAL_SPEED = 7.0;
export const INCREMENT = 0.5;

export function createInitialState(vsAI: boolean): GameState {
  return {
    p1X: (GAME_WIDTH - PADDLE_WIDTH) / 2,
    p2X: (GAME_WIDTH - PADDLE_WIDTH) / 2,
    p1PrevX: (GAME_WIDTH - PADDLE_WIDTH) / 2,
    p2PrevX: (GAME_WIDTH - PADDLE_WIDTH) / 2,
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT / 2,
    ballSpeedX: vsAI ? 0 : (Math.random() < 0.5 ? -4 : 4),
    ballSpeedY: Math.random() < 0.5 ? -4 : 4,
    speedModifier: INITIAL_SPEED,
    rallyLength: 0,
    p1Score: 0,
    p2Score: 0,
    isRunning: true,
    isPaused: false,
    ballDestX: null,
    ballDestY: null,
  };
}

export function resetBall(state: GameState, vsAI: boolean): GameState {
  return {
    ...state,
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT / 2,
    ballSpeedX: vsAI ? 0 : (Math.random() < 0.5 ? -4 : 4),
    ballSpeedY: Math.random() < 0.5 ? -4 : 4,
    speedModifier: INITIAL_SPEED,
    rallyLength: 0,
    ballDestX: null,
    ballDestY: null,
  };
}

// ─── AI helpers ───────────────────────────────────────────────────────────────

const LEFT_BOUND = 0;
const RIGHT_BOUND = GAME_WIDTH;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function moveToward(x: number, proposed: number, speed: number): number {
  if (x < proposed) {
    return Math.min(x + speed, proposed);
  } else {
    return Math.max(x - speed, proposed);
  }
}

export function aiBasic(x: number, ballX: number, speed: number): number {
  const center = x + PADDLE_WIDTH / 2;
  if (center < ballX && x < RIGHT_BOUND - PADDLE_WIDTH) return x + speed;
  if (center > ballX && x > LEFT_BOUND) return x - speed;
  return x;
}

export function aiPhantom(x: number, ballX: number, speed: number): number {
  if (x < ballX && x < RIGHT_BOUND - PADDLE_WIDTH) return x + speed;
  if (x + PADDLE_WIDTH > ballX && x > LEFT_BOUND) return x - speed;
  return x;
}

export function aiSentinel(x: number, ballX: number, speed: number): number {
  if (x + PADDLE_WIDTH < ballX && x < RIGHT_BOUND - PADDLE_WIDTH) return x + speed;
  if (x > ballX && x > LEFT_BOUND) return x - speed;
  return x;
}

export function aiTitan(x: number, oppX: number, ballX: number, speed: number): number {
  const oppCenter = oppX + PADDLE_WIDTH / 2;
  const randomness = Math.random() * 0.7 + 0.1;
  const shift = (PADDLE_WIDTH / 2) * randomness;

  let proposed: number;
  if (oppCenter < GAME_WIDTH / 2) {
    proposed = ballX + BALL_SIZE / 2 - PADDLE_WIDTH + shift;
  } else {
    proposed = ballX + BALL_SIZE / 2 - shift;
  }

  proposed = clamp(proposed, LEFT_BOUND, RIGHT_BOUND - PADDLE_WIDTH);
  return moveToward(x, proposed, speed);
}

export function aiRival(x: number, oppX: number, ballX: number, speed: number): number {
  const oppCenter = oppX + PADDLE_WIDTH / 2;
  let proposed: number;
  if (oppCenter < GAME_WIDTH / 2) {
    proposed = ballX + BALL_SIZE / 2 - PADDLE_WIDTH;
  } else {
    proposed = ballX + BALL_SIZE / 2;
  }
  proposed = clamp(proposed, LEFT_BOUND, RIGHT_BOUND - PADDLE_WIDTH);
  return moveToward(x, proposed, speed);
}

export function aiTeleporter(x: number, oppX: number, ballX: number): number {
  const oppCenter = oppX + PADDLE_WIDTH / 2;
  if (oppCenter < GAME_WIDTH / 2) {
    return clamp(ballX + BALL_SIZE / 2 - PADDLE_WIDTH, LEFT_BOUND, RIGHT_BOUND - PADDLE_WIDTH);
  } else {
    return clamp(ballX + BALL_SIZE / 2, LEFT_BOUND, RIGHT_BOUND - PADDLE_WIDTH);
  }
}

export function aiMatrix(
  x: number,
  oppX: number,
  oppPrevX: number,
  ballX: number,
  speed: number
): number {
  const oppVelocity = oppX - oppPrevX;
  const oppCenter = oppX + PADDLE_WIDTH / 2;

  let proposed: number;
  if (oppVelocity !== 0) {
    // hit away from direction of travel
    proposed =
      oppVelocity < 0
        ? ballX + BALL_SIZE / 2 - PADDLE_WIDTH // hit right
        : ballX + BALL_SIZE / 2; // hit left
  } else {
    proposed =
      oppCenter < GAME_WIDTH / 2
        ? ballX + BALL_SIZE / 2 - PADDLE_WIDTH
        : ballX + BALL_SIZE / 2;
  }
  proposed = clamp(proposed, LEFT_BOUND, RIGHT_BOUND - PADDLE_WIDTH);
  return moveToward(x, proposed, speed);
}

// ─── Main tick function ───────────────────────────────────────────────────────

export function tickGame(
  state: GameState,
  p1TouchX: number | null, // null = AI controlled
  p2TouchX: number | null, // null = AI controlled
  p2AI: AIKey
): GameState {
  if (!state.isRunning || state.isPaused) return state;

  let {
    p1X, p2X, p1PrevX, p2PrevX,
    ballX, ballY, ballSpeedX, ballSpeedY,
    speedModifier, rallyLength,
    p1Score, p2Score,
    ballDestX, ballDestY,
  } = state;

  const AI_SPEED = 7;

  // ── P1 movement (always human, bottom paddle) ──
  const newP1PrevX = p1X;
  if (p1TouchX !== null) {
    // touch drag: center paddle on finger
    p1X = clamp(p1TouchX - PADDLE_WIDTH / 2, LEFT_BOUND, RIGHT_BOUND - PADDLE_WIDTH);
  }

  // ── P2 movement ──
  const newP2PrevX = p2X;
  if (p2TouchX !== null) {
    // local 2-player: top player dragged
    p2X = clamp(p2TouchX - PADDLE_WIDTH / 2, LEFT_BOUND, RIGHT_BOUND - PADDLE_WIDTH);
  } else {
    // AI
    switch (p2AI) {
      case 'basic':
        p2X = aiBasic(p2X, ballX, AI_SPEED);
        break;
      case 'phantom':
        p2X = aiPhantom(p2X, ballX, AI_SPEED);
        break;
      case 'sentinel':
        p2X = aiSentinel(p2X, ballX, AI_SPEED);
        break;
      case 'titan':
        p2X = aiTitan(p2X, p1X, ballX, AI_SPEED);
        break;
      case 'rival':
        p2X = aiRival(p2X, p1X, ballX, AI_SPEED);
        break;
      case 'teleporter':
        p2X = aiTeleporter(p2X, p1X, ballX);
        break;
      case 'matrix':
        p2X = aiMatrix(p2X, p1X, p1PrevX, ballX, AI_SPEED);
        break;
    }
    p2X = clamp(p2X, LEFT_BOUND, RIGHT_BOUND - PADDLE_WIDTH);
  }

  // ── Ball movement ──
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Wall bounce
  if (ballX <= 0 || ballX >= GAME_WIDTH - BALL_SIZE) {
    ballSpeedX = -ballSpeedX;
    ballX = clamp(ballX, 0, GAME_WIDTH - BALL_SIZE);
  }

  // ── P1 paddle collision (bottom) ──
  if (
    P1_Y - HIT_BOX_PADDING < ballY + BALL_SIZE &&
    ballY + BALL_SIZE < P1_Y + PADDLE_HEIGHT + HIT_BOX_PADDING &&
    p1X - HIT_BOX_PADDING < ballX + BALL_SIZE / 2 &&
    ballX + BALL_SIZE / 2 < p1X + PADDLE_WIDTH + HIT_BOX_PADDING
  ) {
    const relHit = (ballX + BALL_SIZE / 2 - p1X) / PADDLE_WIDTH;
    const destX = COURT_WIDTH * relHit + COURT_LEFT;
    const destY = 80;
    ballDestX = destX;
    ballDestY = destY;

    const diffX = destX - ballX;
    const diffY = destY - ballY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);
    if (dist !== 0) {
      ballSpeedX = (diffX / dist) * speedModifier;
      ballSpeedY = (diffY / dist) * speedModifier;
    }
    ballSpeedY = -Math.abs(ballSpeedY);
    speedModifier += INCREMENT;
    rallyLength += 1;
  }

  // ── P2 paddle collision (top) ──
  if (
    P2_Y - HIT_BOX_PADDING < ballY + BALL_SIZE &&
    ballY + BALL_SIZE < P2_Y + PADDLE_HEIGHT + HIT_BOX_PADDING &&
    p2X - HIT_BOX_PADDING < ballX + BALL_SIZE / 2 &&
    ballX + BALL_SIZE / 2 < p2X + PADDLE_WIDTH + HIT_BOX_PADDING
  ) {
    const relHit = (ballX + BALL_SIZE / 2 - p2X) / PADDLE_WIDTH;
    const destX = COURT_WIDTH * relHit + COURT_LEFT;
    const destY = GAME_HEIGHT - 80;
    ballDestX = destX;
    ballDestY = destY;

    const diffX = destX - ballX;
    const diffY = destY - ballY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);
    if (dist !== 0) {
      ballSpeedX = (diffX / dist) * speedModifier;
      ballSpeedY = (diffY / dist) * speedModifier;
    }
    ballSpeedY = Math.abs(ballSpeedY);
    speedModifier += INCREMENT;
    rallyLength += 1;
  }

  // ── Scoring ──
  const vsAI = p2TouchX === null;
  if (ballY > GAME_HEIGHT) {
    p2Score += 1;
    return resetBall({ ...state, p2Score }, vsAI);
  }
  if (ballY < 0) {
    p1Score += 1;
    return resetBall({ ...state, p1Score }, vsAI);
  }

  return {
    ...state,
    p1X, p2X,
    p1PrevX: newP1PrevX,
    p2PrevX: newP2PrevX,
    ballX, ballY,
    ballSpeedX, ballSpeedY,
    speedModifier, rallyLength,
    p1Score, p2Score,
    ballDestX, ballDestY,
  };
}