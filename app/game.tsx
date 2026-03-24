import { Canvas, Fill, Group, Line, Oval, Rect } from '@shopify/react-native-skia';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AIKey, COURTS, CourtKey } from '../constants/courts';
import {
  BALL_SIZE,
  COURT_LEFT,
  COURT_RIGHT,
  COURT_WIDTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  GameState,
  P1_Y,
  P2_Y,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  createInitialState,
  tickGame,
} from '../hooks/gameLogic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCALE = SCREEN_WIDTH / GAME_WIDTH;

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ court: string; opponent: string }>();
  const courtKey = (params.court ?? 'default') as CourtKey;
  const opponentKey = (params.opponent ?? 'basic') as AIKey;
  const court = COURTS[courtKey];
  const isLocal = opponentKey === 'local';

  const stateRef = useRef<GameState>(createInitialState(!isLocal));
  const [displayState, setDisplayState] = useState<GameState>(stateRef.current);

  const p1TouchRef = useRef<number | null>(null);
  const p2TouchRef = useRef<number | null>(null);

  // Game loop
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startLoop = useCallback(() => {
    frameRef.current = setInterval(() => {
      stateRef.current = tickGame(
        stateRef.current,
        p1TouchRef.current,
        isLocal ? p2TouchRef.current : null,
        opponentKey
      );
      setDisplayState({ ...stateRef.current });
    }, 1000 / 60);
  }, [isLocal, opponentKey]);

  useEffect(() => {
    startLoop();
    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, [startLoop]);

  // // ── P1 PanResponder (bottom half of screen) ──
  // const p1Pan = useRef(
  //   PanResponder.create({
  //     onStartShouldSetPanResponder: () => true,
  //     onMoveShouldSetPanResponder: () => true,
  //     onPanResponderGrant: (evt) => {
  //       const x = evt.nativeEvent.pageX / SCALE;
  //       p1TouchRef.current = x;
  //     },
  //     onPanResponderMove: (evt) => {
  //       const x = evt.nativeEvent.pageX / SCALE;
  //       p1TouchRef.current = x;
  //     },
  //     onPanResponderRelease: () => {
  //       p1TouchRef.current = null;
  //     },
  //     onPanResponderTerminate: () => {
  //       p1TouchRef.current = null;
  //     },
  //   })
  // ).current;

  // // ── P2 PanResponder (top half, local 2P only) ──
  // const p2Pan = useRef(
  //   PanResponder.create({
  //     onStartShouldSetPanResponder: () => true,
  //     onMoveShouldSetPanResponder: () => true,
  //     onPanResponderGrant: (evt) => {
  //       const x = evt.nativeEvent.pageX / SCALE;
  //       p2TouchRef.current = x;
  //     },
  //     onPanResponderMove: (evt) => {
  //       const x = evt.nativeEvent.pageX / SCALE;
  //       p2TouchRef.current = x;
  //     },
  //     onPanResponderRelease: () => {
  //       p2TouchRef.current = null;
  //     },
  //     onPanResponderTerminate: () => {
  //       p2TouchRef.current = null;
  //     },
  //   })
  // ).current;

  const togglePause = () => {
    stateRef.current = {
      ...stateRef.current,
      isPaused: !stateRef.current.isPaused,
    };
  };

  const handleBack = () => {
    if (frameRef.current) clearInterval(frameRef.current);
    router.back();
  };

  const s = displayState;
  const scaledH = GAME_HEIGHT * SCALE;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: court.floorColor }]}>
      <StatusBar barStyle="light-content" />

      {/* HUD */}
      <View style={styles.hud}>
        <TouchableOpacity onPress={handleBack} style={styles.hudBtn}>
          <Text style={styles.hudBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.scores}>
          <Text style={styles.scoreText}>P2  {s.p2Score}</Text>
          <Text style={styles.scoreText}>P1  {s.p1Score}</Text>
        </View>
        <TouchableOpacity onPress={togglePause} style={styles.hudBtn}>
          <Text style={styles.hudBtnText}>{s.isPaused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>
      </View>

      {/* Touch zones */}
      <View style={{ width: SCREEN_WIDTH, height: scaledH }}>
      <View
        style={[styles.touchZone, { top: 0, height: scaledH }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(evt) => {
          evt.nativeEvent.touches.forEach((t) => {
            if (t.pageY / SCALE > GAME_HEIGHT / 2) {
              p1TouchRef.current = t.pageX / SCALE;
            } else {
              p2TouchRef.current = t.pageX / SCALE;
            }
          });
        }}
        onResponderMove={(evt) => {
          evt.nativeEvent.touches.forEach((t) => {
            if (t.pageY / SCALE > GAME_HEIGHT / 2) {
              p1TouchRef.current = t.pageX / SCALE;
            } else {
              p2TouchRef.current = t.pageX / SCALE;
            }
          });
        }}
        onResponderRelease={(evt) => {
          const touches = evt.nativeEvent.touches;
          const hasTop = touches.some((t) => t.pageY / SCALE <= GAME_HEIGHT / 2);
          const hasBottom = touches.some((t) => t.pageY / SCALE > GAME_HEIGHT / 2);
          if (!hasTop) p2TouchRef.current = null;
          if (!hasBottom) p1TouchRef.current = null;
        }}
        onResponderTerminate={() => {
          p1TouchRef.current = null;
          p2TouchRef.current = null;
        }}
      />

        <Canvas style={{ width: SCREEN_WIDTH, height: scaledH }}>
          {/* Floor */}
          <Fill color={court.floorColor} />

          {/* Court surface */}
          {!court.isWimbledon && (
            <Rect
              x={COURT_LEFT * SCALE}
              y={110 * SCALE}
              width={COURT_WIDTH * SCALE}
              height={382 * SCALE}
              color={court.courtColor}
            />
          )}

          {/* Wimbledon stripes */}
          {court.isWimbledon && (
            <Group>
              {Array.from({ length: Math.ceil(GAME_WIDTH / 80) }).map((_, i) => (
                <React.Fragment key={i}>
                  <Rect
                    x={i * 80 * SCALE}
                    y={0}
                    width={40 * SCALE}
                    height={scaledH}
                    color="#A2C129"
                  />
                  <Rect
                    x={(i * 80 + 40) * SCALE}
                    y={0}
                    width={40 * SCALE}
                    height={scaledH}
                    color="#83B117"
                  />
                </React.Fragment>
              ))}
            </Group>
          )}

          {/* Court lines */}
          {/* Side lines */}
          <Line
            p1={{ x: COURT_LEFT * SCALE, y: 110 * SCALE }}
            p2={{ x: COURT_LEFT * SCALE, y: (GAME_HEIGHT - 110) * SCALE }}
            color="white" strokeWidth={3} />
          <Line
            p1={{ x: COURT_RIGHT * SCALE, y: 110 * SCALE }}
            p2={{ x: COURT_RIGHT * SCALE, y: (GAME_HEIGHT - 110) * SCALE }}
            color="white" strokeWidth={3} />

          {/* Doubles alleys */}
          <Line
            p1={{ x: (COURT_LEFT + 40) * SCALE, y: 110 * SCALE }}
            p2={{ x: (COURT_LEFT + 40) * SCALE, y: (GAME_HEIGHT - 110) * SCALE }}
            color="white" strokeWidth={2} />
          <Line
            p1={{ x: (COURT_RIGHT - 40) * SCALE, y: 110 * SCALE }}
            p2={{ x: (COURT_RIGHT - 40) * SCALE, y: (GAME_HEIGHT - 110) * SCALE }}
            color="white" strokeWidth={2} />

          {/* Baselines */}
          <Line
            p1={{ x: (COURT_LEFT - 2) * SCALE, y: 110 * SCALE }}
            p2={{ x: (COURT_RIGHT + 2) * SCALE, y: 110 * SCALE }}
            color="white" strokeWidth={3} />
          <Line
            p1={{ x: (COURT_LEFT - 2) * SCALE, y: (GAME_HEIGHT - 110) * SCALE }}
            p2={{ x: (COURT_RIGHT + 2) * SCALE, y: (GAME_HEIGHT - 110) * SCALE }}
            color="white" strokeWidth={3} />

          {/* Net */}
          <Line
            p1={{ x: COURT_LEFT * SCALE, y: (GAME_HEIGHT / 2) * SCALE }}
            p2={{ x: COURT_RIGHT * SCALE, y: (GAME_HEIGHT / 2) * SCALE }}
            color="white" strokeWidth={3} />

          {/* Service lines */}
          <Line
            p1={{ x: (COURT_LEFT + 40) * SCALE, y: 195 * SCALE }}
            p2={{ x: (COURT_RIGHT - 40) * SCALE, y: 195 * SCALE }}
            color="white" strokeWidth={2} />
          <Line
            p1={{ x: (COURT_LEFT + 40) * SCALE, y: (GAME_HEIGHT - 195) * SCALE }}
            p2={{ x: (COURT_RIGHT - 40) * SCALE, y: (GAME_HEIGHT - 195) * SCALE }}
            color="white" strokeWidth={2} />

          {/* Centre service line */}
          <Line
            p1={{ x: (GAME_WIDTH / 2) * SCALE, y: 195 * SCALE }}
            p2={{ x: (GAME_WIDTH / 2) * SCALE, y: (GAME_HEIGHT - 195) * SCALE }}
            color="white" strokeWidth={2} />

          {/* Ball destination flash */}
          {s.ballDestX !== null && s.ballDestY !== null && (
            <Oval
              x={(s.ballDestX - BALL_SIZE / 2) * SCALE}
              y={s.ballDestY * SCALE}
              width={10 * SCALE}
              height={10 * SCALE}
              color="rgba(180,180,180,0.35)"
            />
          )}

          {/* P2 paddle (top) */}
          <Rect
            x={s.p2X * SCALE}
            y={P2_Y * SCALE}
            width={PADDLE_WIDTH * SCALE}
            height={PADDLE_HEIGHT * SCALE}
            color={isLocal ? '#60AAFF' : '#FF6060'}
          />

          {/* P1 paddle (bottom) */}
          <Rect
            x={s.p1X * SCALE}
            y={P1_Y * SCALE}
            width={PADDLE_WIDTH * SCALE}
            height={PADDLE_HEIGHT * SCALE}
            color="#CDEB34"
          />

          {/* Ball */}
          <Oval
            x={s.ballX * SCALE}
            y={s.ballY * SCALE}
            width={BALL_SIZE * SCALE}
            height={BALL_SIZE * SCALE}
            color="#CDEB34"
          />
        </Canvas>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statText}>🎾 {s.rallyLength}</Text>
        <Text style={styles.statText}>Speed {s.speedModifier.toFixed(1)}</Text>
      </View>

      {/* Paused overlay */}
      {s.isPaused && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseText}>PAUSED</Text>
          <TouchableOpacity onPress={togglePause} style={styles.resumeBtn}>
            <Text style={styles.resumeBtnText}>RESUME</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBack} style={[styles.resumeBtn, { backgroundColor: '#333', marginTop: 10 }]}>
            <Text style={[styles.resumeBtnText, { color: '#fff' }]}>QUIT</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // add this
  },
  hud: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 40,
  },
  hudBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scores: {
    flexDirection: 'row',
    gap: 24,
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  touchZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 10,
  },
  statText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  pauseText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
    marginBottom: 30,
  },
  resumeBtn: {
    backgroundColor: '#CDEB34',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
  },
  resumeBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
});