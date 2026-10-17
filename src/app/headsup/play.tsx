import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Redirect, router } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";

import {
  createTiltDetector,
  isOnForehead,
  rotationFor,
  type HeadsUpResult,
  type TiltAnswer,
} from "@/games/headsup/logic";
import { useHeadsUp } from "@/games/headsup/store";
import { colors } from "@/ui/theme";
import { useLeaveGuard } from "@/ui/useLeaveGuard";

type Phase = "place" | "countdown" | "playing" | "flash" | "done";

const FLASH_MS = 650;
const KEEP_AWAKE_TAG = "headsup-play";
const FOREHEAD_HOLD_MS = 600;
const GREEN = "#15803D";
const ORANGE = "#C2410C";

export default function HeadsUpPlay() {
  const { deck, settings, finishRound } = useHeadsUp();
  // Keep the screen on while playing (ignored where the platform doesn't allow it).
  useEffect(() => {
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, []);
  useLeaveGuard("/headsup");
  const { width: W, height: H } = useWindowDimensions();

  const [sensor, setSensor] = useState<boolean | null>(null); // null = still checking
  const [rotation, setRotation] = useState<0 | 90 | -90>(0);
  const [phase, setPhaseState] = useState<Phase>("place");
  const [count, setCount] = useState(3);
  const [index, setIndexState] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [flash, setFlash] = useState<TiltAnswer | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const answers = useRef<HeadsUpResult["words"]>([]);
  const detector = useRef(createTiltDetector());
  // Refs mirror state for the sensor callback, which runs outside React's render cycle.
  const phaseRef = useRef<Phase>("place");
  const indexRef = useRef(0);
  const foreheadSince = useRef<number | null>(null);
  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);
  const setIndex = useCallback((i: number) => {
    indexRef.current = i;
    setIndexState(i);
  }, []);

  const tiltMode = settings.tilt && sensor === true;

  const finish = useCallback(() => {
    if (phaseRef.current === "done") return;
    setPhase("done");
    Vibration.vibrate([0, 300, 120, 300]);
    const result: HeadsUpResult = {
      words: answers.current,
      seconds: settings.seconds,
    };
    setTimeout(() => {
      finishRound(result);
      router.replace("/headsup/result");
    }, 1300);
  }, [finishRound, settings.seconds, setPhase]);

  const answer = useCallback(
    (a: TiltAnswer) => {
      if (phaseRef.current !== "playing") return;
      const word = deck[indexRef.current];
      if (!word) return;
      answers.current = [...answers.current, { word, answer: a }];
      if (a === "correct") setCorrectCount((c) => c + 1);
      detector.current.disarm();
      Vibration.vibrate(a === "correct" ? 60 : [0, 40, 60, 40]);
      setFlash(a);
      setPhase("flash");
      setTimeout(() => {
        if (phaseRef.current !== "flash") return;
        const next = indexRef.current + 1;
        setFlash(null);
        if (next >= deck.length) {
          finish();
          return;
        }
        setIndex(next);
        setPhase("playing");
      }, FLASH_MS);
    },
    [deck, finish, setPhase, setIndex],
  );

  const beginCountdown = useCallback(() => {
    if (phaseRef.current !== "place") return;
    setCount(3);
    setPhase("countdown");
  }, [setPhase]);

  // Sensor availability.
  useEffect(() => {
    let alive = true;
    Accelerometer.isAvailableAsync()
      .then((ok) => alive && setSensor(ok))
      .catch(() => alive && setSensor(false));
    return () => {
      alive = false;
    };
  }, []);

  // Accelerometer: orientation of the content, "on forehead" detection and tilts.
  useEffect(() => {
    if (!sensor) return;
    let sub: { remove: () => void } | null = null;
    try {
      Accelerometer.setUpdateInterval(50);
      sub = Accelerometer.addListener(({ x, y, z }) => {
        const t = Date.now();
        setRotation((r) => rotationFor(x, r === 0 ? 90 : r));
        const p = phaseRef.current;
        if (p === "place" && settings.tilt) {
          if (isOnForehead({ x, z })) {
            foreheadSince.current ??= t;
            if (t - foreheadSince.current >= FOREHEAD_HOLD_MS) beginCountdown();
          } else foreheadSince.current = null;
        }
        const a = detector.current.update({ x, y, z, t });
        if (a && p === "playing" && settings.tilt) answer(a);
      });
    } catch {
      // Sensor reported as available but can't be used: fall back to tapping.
      Promise.resolve().then(() => setSensor(false));
    }
    return () => sub?.remove();
  }, [sensor, settings.tilt, answer, beginCountdown]);

  // Countdown 3-2-1, then the round starts.
  useEffect(() => {
    if (phase !== "countdown") return;
    const id = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1);
        return;
      }
      const t = Date.now();
      detector.current.disarm();
      setNow(t);
      setEndsAt(t + settings.seconds * 1000);
      setPhase("playing");
      Vibration.vibrate(120);
    }, 900);
    return () => clearTimeout(id);
  }, [phase, count, settings.seconds, setPhase]);

  // Round timer.
  const timing = endsAt !== null && phase !== "done";
  useEffect(() => {
    if (!timing) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [timing]);
  const remaining =
    endsAt === null
      ? settings.seconds
      : Math.max(0, Math.ceil((endsAt - now) / 1000));
  const timeUp = endsAt !== null && remaining === 0;
  useEffect(() => {
    if (timeUp) finish();
  }, [timeUp, finish]);

  if (!deck.length) return <Redirect href="/headsup" />;

  // The app is portrait-locked; rotate the content so it reads upright on a sideways phone.
  const rotated = rotation !== 0;
  const boxW = rotated ? H : W;
  const boxH = rotated ? W : H;
  const bg =
    phase === "flash"
      ? flash === "correct"
        ? GREEN
        : ORANGE
      : phase === "done"
        ? colors.imposter
        : colors.accent;

  const onTap = (side: "left" | "right") => {
    if (phase === "place") return beginCountdown();
    if (phase === "playing" && !tiltMode)
      answer(side === "right" ? "correct" : "pass");
  };

  let main: React.ReactNode;
  let sub = "";
  if (phase === "place") {
    main = tiltMode ? "Tegen je voorhoofd!" : "Tik om te starten";
    sub = tiltMode
      ? "Liggend, scherm naar de groep"
      : "Houd de telefoon tegen je voorhoofd";
  } else if (phase === "countdown") {
    main = String(count);
    sub = "Klaar?";
  } else if (phase === "flash") {
    main = flash === "correct" ? "Goed!" : "Pas";
  } else if (phase === "done") {
    main = "Tijd!";
  } else {
    main = deck[index];
    sub = tiltMode ? "Omlaag = goed  ·  omhoog = pas" : "‹ Pas  ·  Goed ›";
  }

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar hidden />
      <View
        style={[
          styles.box,
          {
            width: boxW,
            height: boxH,
            left: (W - boxW) / 2,
            top: (H - boxH) / 2,
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
      >
        <View style={styles.topBar}>
          <Text
            style={styles.timer}
            accessibilityLabel={`${remaining} seconden`}
          >
            {phase === "playing" || phase === "flash" ? remaining : ""}
          </Text>
          <Text style={styles.score}>
            {phase === "playing" || phase === "flash"
              ? `✓ ${correctCount}`
              : ""}
          </Text>
        </View>
        <View style={styles.center}>
          <Text
            style={styles.word}
            adjustsFontSizeToFit
            numberOfLines={2}
            minimumFontScale={0.4}
          >
            {main}
          </Text>
          {sub ? <Text style={styles.sub}>{sub}</Text> : null}
        </View>
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents={
            phase === "done" || phase === "flash" ? "none" : "auto"
          }
        >
          <View style={styles.tapRow}>
            <Pressable
              style={styles.tapHalf}
              onPress={() => onTap("left")}
              accessibilityRole="button"
              accessibilityLabel={phase === "playing" ? "Pas" : "Start"}
            />
            <Pressable
              style={styles.tapHalf}
              onPress={() => onTap("right")}
              accessibilityRole="button"
              accessibilityLabel={phase === "playing" ? "Goed" : "Start"}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  box: { position: "absolute", paddingHorizontal: 32, paddingVertical: 24 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 40,
  },
  timer: {
    fontSize: 30,
    fontWeight: "300",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  score: { fontSize: 22, fontWeight: "600", color: "#FFFFFFB3" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  word: {
    fontSize: 72,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -1,
  },
  sub: { fontSize: 18, color: "#FFFFFFB3", textAlign: "center" },
  tapRow: { flex: 1, flexDirection: "row" },
  tapHalf: { flex: 1 },
});
