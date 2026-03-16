"use client";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Emotion = "neutral" | "happy" | "curious" | "suspicious" | "surprised" | "smirk" | "annoyed";
type SphereState = "scan" | "surprised";
type AttentionTarget = "cursor" | "text" | "navbar" | "scroll" | "idle";

type Particle = { angle: number; speed: number; radius: number };

type ExpressionWeights = {
    eyeOpenness: number; // 1=normal  >1=wide  <1=squint
    browLiftL:   number; // left  brow lift (+up / -down)
    browLiftR:   number; // right brow lift — independent for smirk asymmetry
    browAngleL:  number; // left  brow tilt (+1=arch  -1=angry)
    browAngleR:  number; // right brow tilt
    mouthChar:   number; // 0="-"  1="_"  2="~"  3="O"
    mouthAsym:   number; // 0=center  +1=right-biased (smirk)
};

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID_W = 180;
const GRID_H = 90;
const CELL_COUNT = GRID_W * GRID_H;
const ASPECT_SCALE = (GRID_W / GRID_H) * 0.52; // keeps sphere circular

const SPEECH_GREETINGS = ["HELLO HUMAN", "WELCOME VISITOR", "NICE TO MEET YOU"];
const SPEECH_HIRE      = ["HIRE ME", "I BUILD SYSTEMS", "LET'S WORK TOGETHER"];
const SPEECH_FACTS     = ["ASCII WAS INVENTED IN 1963", "THE FIRST COMPUTER BUG WAS A MOTH", "ENGINEERING IS CREATIVE PROBLEM SOLVING"];
const SPEECH_QUOTES    = ["STAY HUNGRY STAY FOOLISH", "SIMPLICITY IS THE ULTIMATE SOPHISTICATION", "CODE IS POETRY"];
const SPEECH_ALL       = [...SPEECH_GREETINGS, ...SPEECH_HIRE, ...SPEECH_FACTS, ...SPEECH_QUOTES];

// Expression targets — map to 😑🙂😏😯 + extras
const EXPR_TARGETS: Record<Emotion, ExpressionWeights> = {
    annoyed:   { eyeOpenness:0.55, browLiftL: 0.00, browLiftR: 0.00, browAngleL:-0.90, browAngleR:-0.90, mouthChar:0, mouthAsym:0 },
    happy:     { eyeOpenness:1.00, browLiftL: 0.00, browLiftR: 0.00, browAngleL: 0.40, browAngleR: 0.40, mouthChar:1, mouthAsym:0 },
    neutral:   { eyeOpenness:1.00, browLiftL: 0.00, browLiftR: 0.00, browAngleL: 0.00, browAngleR: 0.00, mouthChar:0, mouthAsym:0 },
    suspicious:{ eyeOpenness:0.80, browLiftL:-0.02, browLiftR: 0.00, browAngleL:-0.50, browAngleR: 0.00, mouthChar:0, mouthAsym:0 },
    surprised: { eyeOpenness:1.55, browLiftL: 0.08, browLiftR: 0.08, browAngleL: 0.80, browAngleR: 0.80, mouthChar:3, mouthAsym:0 },
    smirk:     { eyeOpenness:0.90, browLiftL: 0.00, browLiftR: 0.07, browAngleL: 0.00, browAngleR: 0.70, mouthChar:2, mouthAsym:1 },
    curious:   { eyeOpenness:1.10, browLiftL: 0.02, browLiftR: 0.02, browAngleL: 0.20, browAngleR: 0.20, mouthChar:0, mouthAsym:0 },
};

const MOUTH_CHARS = ["-", "_", "~", "O"] as const;
const DENSITY     = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const MATRIX      = "01アイウエオカキクケコ";

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
    audioLevelRef?: MutableRefObject<number>;
    isListening?: boolean;
};

export default function AsciiSphereFace({ audioLevelRef, isListening = false }: Props) {
    const preRef        = useRef<HTMLPreElement>(null);
    const userNameRef   = useRef<string>("VISITOR");
    const [bubbleText, setBubbleText] = useState("HELLO HUMAN");
    const [listening, setListening] = useState(false);
    const bubbleTextRef = useRef("HELLO HUMAN");
    const listeningRef  = useRef(isListening);

    useEffect(() => {
        listeningRef.current = isListening;
        setListening(isListening);
    }, [isListening]);

    useEffect(() => {
        let rafId = 0;
        let time  = 0;

        // Username prompt
        const stored = window.localStorage.getItem("sphereUser");
        if (stored) {
            userNameRef.current = stored;
        } else {
            const name = window.prompt("hello. what is your name?");
            if (name) {
                userNameRef.current = name.toUpperCase();
                window.localStorage.setItem("sphereUser", userNameRef.current);
            }
        }
        const N = userNameRef.current;
        const SPEECH_AI = {
            greeting: [`HELLO ${N}`, `WELCOME ${N}`, `NICE TO MEET YOU ${N}`],
            about:    ["THIS IS AJ", "ENGINEER", "CREATOR"],
            project:  ["SOLO PROJECTS", "BUILT FROM ZERO", "PURE ENGINEERING"],
            idle:     ["OBSERVING...", "ANALYZING USER", "STANDBY"],
        };

        // Look / attention
        let targetLookX = 0, targetLookY = 0;
        let cursorLookX = 0, cursorLookY = 0;
        let lookX = 0, lookY = 0;
        let eyeLookX = 0, eyeLookY = 0;
        let delayedX = 0, delayedY = 0;
        let parallaxX = 0, parallaxY = 0;
        let headTilt = 0;

        // Blink / wink
        let blink = 1, blinkTarget = 1, blinkTimer = 0, nextBlinkAt = 2.5 + Math.random() * 5;
        let wink  = 0, winkTimer   = 0, nextWinkAt  = 8  + Math.random() * 8;
        let halfBlink = 1, halfBlinkTimer = 0;

        // Sphere state
        let state: SphereState = "scan";
        let radar = 0;
        let matrixMode = false;
        let surpriseUntil = 0;

        // Cursor tracking
        let lastCursorX = 0, lastCursorY = 0, cursorVelocity = 0;
        let lastMouseMove  = 0;
        let lastScrollTime = 0;
        let lastNavbarHover = 0;
        let scrollLookY = 0;
        let lastKnownScrollY = window.scrollY;

        // Idle gaze
        let leftTextUntil = 0, lastLeftTextGlance = 0;
        let randomLookX = 0, randomLookY = 0, nextRandomLookAt = 0;
        let attentionTarget: AttentionTarget = "cursor";

        // Expression
        let emotion: Emotion = "neutral";
        const expr: ExpressionWeights = { ...EXPR_TARGETS.neutral };
        let mouthCharFloat = 0, mouthAsymFloat = 0;
        let expressionHoldUntil = 0;

        // Speech
        let hoverTarget = "";
        let greeted = false;
        let currentSpeech = "", nextSpeechAt = 0;

        // Particles
        const particles: Particle[] = Array.from({ length: 14 }, () => ({
            angle:  Math.random() * Math.PI * 2,
            speed:  0.25 + Math.random() * 0.25,
            radius: 1.28 + Math.random() * 0.25,
        }));

        // Render buffers — allocated once, cleared each frame
        const sphereBuf = new Array<string>(CELL_COUNT).fill(" ");
        const faceBuf   = new Array<string>(CELL_COUNT).fill("");
        const shadowBuf = new Array<string>(CELL_COUNT).fill("");

        const idx = (x: number, y: number) => y * GRID_W + x;

        // Event handlers
        const onMouseMove = (e: MouseEvent) => {
            lastMouseMove = time;
            const dx = e.clientX - lastCursorX, dy = e.clientY - lastCursorY;
            cursorVelocity = Math.sqrt(dx * dx + dy * dy);
            lastCursorX = e.clientX; lastCursorY = e.clientY;
            cursorLookX =  (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
            cursorLookY = -(e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        };
        const onMouseLeave = () => { cursorLookX = 0; cursorLookY = 0; };
        const onScroll = () => {
            const next = window.scrollY, delta = next - lastKnownScrollY;
            if (delta !== 0) { lastScrollTime = time; scrollLookY = delta > 0 ? -0.5 : 0.5; lastKnownScrollY = next; }
        };

        const navLinks = Array.from(document.querySelectorAll("nav a"));
        const navCleanup = navLinks.map(link => {
            const enter = () => {
                lastNavbarHover = time;
                const label = (link.textContent ?? "").trim().toUpperCase();
                hoverTarget = label.startsWith("PROJECT") ? "PROJECT" : label.startsWith("ABOUT") ? "ABOUT" : label;
            };
            const leave = () => { hoverTarget = ""; };
            link.addEventListener("mouseenter", enter);
            link.addEventListener("mouseleave", leave);
            return () => { link.removeEventListener("mouseenter", enter); link.removeEventListener("mouseleave", leave); };
        });

        window.addEventListener("mousemove",  onMouseMove);
        window.addEventListener("mouseleave", onMouseLeave);
        window.addEventListener("scroll",     onScroll, { passive: true });

        // ── Main render loop ──────────────────────────────────────────────────
        const render = (ts: number) => {
            time = ts * 0.001;

            const audioLevel    = Math.max(0, Math.min(1, audioLevelRef?.current ?? 0));
            const breatheAmp    = 0.025 + audioLevel * 0.06;
            const particleBoost = 1 + audioLevel * 1.2;
            const glowMult      = 1 + audioLevel * 0.9;
            const breathe       = Math.sin(time * 1.1) * breatheAmp;
            radar = (time * 0.45) % 2 - 1;

            const dtMouse    = time - lastMouseMove;
            const dtScroll   = time - lastScrollTime;
            const dtNavbar   = time - lastNavbarHover;
            const dtInteract = time - Math.max(lastMouseMove, lastScrollTime, lastNavbarHover);
            const cursorClose    = Math.abs(cursorLookX) < 0.18 && Math.abs(cursorLookY) < 0.18;
            const cursorStrength = Math.max(0, Math.min(1, 1 - dtMouse / 2));
            const cfX = cursorLookX * ASPECT_SCALE; // cursor field in sphere-space
            const cfY = cursorLookY;

            // Attention / look target
            if (listeningRef.current) {
                attentionTarget = "idle"; targetLookX = 0; targetLookY = 0;
            } else if (dtMouse < 2) {
                attentionTarget = "cursor"; targetLookX = cursorLookX; targetLookY = cursorLookY;
            } else if (hoverTarget) {
                attentionTarget = "navbar"; targetLookX = 0; targetLookY = 0.45;
            } else if (dtScroll < 1) {
                attentionTarget = "scroll"; targetLookX = 0; targetLookY = scrollLookY;
            } else if (dtMouse > 4) {
                if (leftTextUntil > time) {
                    attentionTarget = "text"; targetLookX = -0.45; targetLookY = 0;
                } else if (time - lastLeftTextGlance > 3.5 && Math.random() < 0.005) {
                    lastLeftTextGlance = time; leftTextUntil = time + 1.6;
                    attentionTarget = "text"; targetLookX = -0.45; targetLookY = 0;
                } else if (dtInteract > 15) {
                    if (time >= nextRandomLookAt) {
                        randomLookX = (Math.random() - 0.5) * 0.8;
                        randomLookY = (Math.random() - 0.5) * 0.8;
                        nextRandomLookAt = time + 2.5 + Math.random() * 2.5;
                    }
                    attentionTarget = "idle"; targetLookX = randomLookX; targetLookY = randomLookY;
                } else {
                    attentionTarget = "idle"; targetLookX = 0; targetLookY = 0;
                }
            } else if (dtNavbar < 1.5) {
                attentionTarget = "navbar"; targetLookX = 0; targetLookY = 0.45;
            } else {
                attentionTarget = "idle"; targetLookX = 0; targetLookY = 0;
            }

            // Double-lerp for organic look movement
            delayedX += (targetLookX - delayedX) * 0.035;
            delayedY += (targetLookY - delayedY) * 0.035;
            lookX = Math.max(-1, Math.min(1, lookX + (delayedX - lookX) * 0.06));
            lookY = Math.max(-1, Math.min(1, lookY + (delayedY - lookY) * 0.06));
            eyeLookX  += (lookX - eyeLookX) * 0.25;
            eyeLookY  += (lookY - eyeLookY) * 0.25;
            parallaxX  = lookX * 0.05;
            parallaxY  = lookY * 0.05;
            headTilt   = Math.sin(time * 0.6) * 0.04;

            // State machine
            if (cursorVelocity > 120) { state = "surprised"; surpriseUntil = time + 1; }
            else if (state === "surprised" && time >= surpriseUntil) state = "scan";
            else if (state !== "surprised") state = "scan";
            matrixMode = dtMouse > 300;

            // Emotion selection — hold 6–12s, then re-roll
            if (time >= expressionHoldUntil) {
                if (time < surpriseUntil) {
                    emotion = "surprised"; expressionHoldUntil = surpriseUntil + 1.0;
                } else if (dtInteract > 20) {
                    emotion = Math.random() < 0.5 ? "neutral" : "annoyed";
                    expressionHoldUntil = time + 8 + Math.random() * 6;
                } else if (cursorClose) {
                    emotion = "happy"; expressionHoldUntil = time + 6 + Math.random() * 4;
                } else {
                    const r = Math.random();
                    emotion = r < 0.28 ? "happy" : r < 0.50 ? "annoyed" : r < 0.70 ? "smirk" : r < 0.85 ? "surprised" : r < 0.93 ? "suspicious" : "curious";
                    expressionHoldUntil = time + 6 + Math.random() * 6;
                }
            }

            // Smooth expression lerp — ~2s full crossfade
            const LERP = 0.025;
            const tgt = EXPR_TARGETS[emotion];
            expr.eyeOpenness += (tgt.eyeOpenness - expr.eyeOpenness) * LERP;
            expr.browLiftL   += (tgt.browLiftL   - expr.browLiftL)   * LERP;
            expr.browLiftR   += (tgt.browLiftR   - expr.browLiftR)   * LERP;
            expr.browAngleL  += (tgt.browAngleL  - expr.browAngleL)  * LERP;
            expr.browAngleR  += (tgt.browAngleR  - expr.browAngleR)  * LERP;
            mouthCharFloat   += (tgt.mouthChar   - mouthCharFloat)   * LERP;
            mouthAsymFloat   += (tgt.mouthAsym   - mouthAsymFloat)   * LERP;

            // Blink
            blinkTimer += 0.016;
            if (blinkTimer > nextBlinkAt) {
                blinkTarget = 0;
                if (blinkTimer > nextBlinkAt + 0.12) { blinkTarget = 1; blinkTimer = 0; nextBlinkAt = 2.5 + Math.random() * 5; }
            }
            blink += (blinkTarget - blink) * 0.3;

            // Wink
            winkTimer += 0.016;
            if (winkTimer > nextWinkAt) {
                wink = 1;
                if (winkTimer > nextWinkAt + 0.2) { wink = 0; winkTimer = 0; nextWinkAt = 8 + Math.random() * 8; }
            }

            // Half-blink (dreamy squint)
            halfBlinkTimer += 0.016;
            if (halfBlinkTimer > 8) {
                halfBlink = 0.6;
                if (halfBlinkTimer > 9) { halfBlink = 1; halfBlinkTimer = 0; }
            }

            // Speech bubble
            const pickSpeech = (pool: string[]) => pool[Math.floor(time) % pool.length];
            const baseMsg =
                hoverTarget === "ABOUT"   ? pickSpeech(SPEECH_AI.about) :
                hoverTarget === "PROJECT" ? pickSpeech(SPEECH_AI.project) :
                time < 4                  ? (greeted = true, pickSpeech(SPEECH_AI.greeting)) :
                                            pickSpeech(SPEECH_AI.idle);
            if (!greeted && time >= 4) greeted = true;
            if (hoverTarget || time < 4) {
                currentSpeech = baseMsg; nextSpeechAt = time + 8 + Math.random() * 4;
            } else if (!currentSpeech || time >= nextSpeechAt) {
                currentSpeech = SPEECH_ALL[Math.floor(Math.random() * SPEECH_ALL.length)];
                nextSpeechAt = time + 8 + Math.random() * 4;
            }
            if (bubbleTextRef.current !== currentSpeech) {
                bubbleTextRef.current = currentSpeech;
                setBubbleText(currentSpeech);
            }

            // ── Clear buffers ─────────────────────────────────────────────────
            sphereBuf.fill(" ");
            faceBuf.fill("");
            shadowBuf.fill("");

            // Pre-compute light vector (shared across all passes)
            const lx   = -0.6 + lookX * 0.4;
            const ly   = -0.6 + lookY * 0.4;
            const lz   =  0.8;
            const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
            const lxN  = lx / lLen; // used in shadow pass

            // ── PASS 1 : sphere body ──────────────────────────────────────────
            for (let y = 0; y < GRID_H; y++) {
                for (let x = 0; x < GRID_W; x++) {
                    let nx = ((x / GRID_W) * 2 - 1) * ASPECT_SCALE;
                    let ny  = (y / GRID_H) * 2 - 1;

                    nx *= 1 + breathe; ny *= 1 + breathe;
                    nx += parallaxX;   ny += parallaxY + headTilt;

                    // Cursor surface gravity
                    const cdx = nx - cfX, cdy = ny - cfY;
                    const cdSq = cdx * cdx + cdy * cdy;
                    const gf = Math.min(0.035, (0.015 / (cdSq + 0.14)) * cursorStrength);
                    nx -= cdx * gf; ny -= cdy * gf;

                    const dSq = nx * nx + ny * ny;
                    if (dSq > 1) continue;
                    const nz = Math.sqrt(1 - dSq);

                    // Surface rotation
                    const rX = nx * Math.cos(-lookX) + nz * Math.sin(-lookX);
                    let  rZ = -nx * Math.sin(-lookX) + nz * Math.cos(-lookX);
                    const rY = ny * Math.cos(-lookY) - rZ * Math.sin(-lookY);
                    rZ       = ny * Math.sin(-lookY) + rZ  * Math.cos(-lookY);

                    // Lighting
                    const dot = (rX * lx + rY * ly + nz * lz) / lLen;
                    let intensity = Math.max(0, dot * 0.7 + 0.3) + Math.sin(time * 1.1) * 0.08;
                    intensity += Math.max(0, 0.22 - cdSq * 0.34) * cursorStrength;
                    if (state === "scan" && Math.abs(rX - radar) < 0.04) intensity += 0.8;

                    // Particles
                    let bodyChar = "";
                    for (let i = 0; i < particles.length; i++) {
                        const p = particles[i];
                        p.angle += 0.002 * p.speed * particleBoost * (1 + cursorStrength * 0.45);
                        const pdx = Math.cos(p.angle) * p.radius - cfX;
                        const pdy = Math.sin(p.angle) * p.radius - cfY;
                        const ppSq = pdx * pdx + pdy * pdy;
                        const push = Math.min(0.12, (0.03 / (ppSq + 0.22)) * cursorStrength);
                        const px = Math.cos(p.angle) * p.radius + pdx * push;
                        const py = Math.sin(p.angle) * p.radius + pdy * push;
                        if (Math.abs(nx - px) < 0.025 && Math.abs(ny - py) < 0.025) { bodyChar = "*"; break; }
                    }

                    if (!bodyChar && matrixMode) bodyChar = MATRIX[Math.floor(Math.random() * MATRIX.length)] ?? "0";
                    if (!bodyChar) {
                        const ci = Math.max(0, Math.min(DENSITY.length - 1, Math.floor(intensity * (DENSITY.length - 1))));
                        bodyChar = DENSITY[ci] || ".";
                    }

                    sphereBuf[idx(x, y)] = bodyChar;
                }
            }

            // ── PASS 2 : face features ────────────────────────────────────────
            // Pre-compute constants outside pixel loop (no repeated calculation per pixel)
            const microX = Math.sin(time * 3.2) * 0.008;
            const microY = Math.cos(time * 2.8) * 0.008;
            const plX = (eyeLookX + microX) * 0.20;
            const plY = (eyeLookY + microY) * 0.16;
            const EYE_CX      = 0.34;
            const EYE_CY      = -0.13;
            const EYE_RX      = 0.195;
            const EYE_RY      = 0.145 * Math.max(0.06, blink * halfBlink * (wink ? 0.04 : 1.0)) * Math.max(0.4, expr.eyeOpenness);
            const eIdx        = Math.max(0, Math.min(3, mouthCharFloat));
            const asymShift   = mouthAsymFloat * 0.10;
            const mouthHalfW  = eIdx < 0.5 ? 0.13 : eIdx < 1.5 ? 0.13 + (eIdx - 0.5) * 0.10 : eIdx < 2.5 ? 0.13 : 0.07;
            const mouthThickY = eIdx > 2.5 ? 0.055 : 0.028;
            const BROW_BASE_Y = -0.40;
            const BROW_THICK  = 0.042;

            for (let y = 0; y < GRID_H; y++) {
                for (let x = 0; x < GRID_W; x++) {
                    let nx = ((x / GRID_W) * 2 - 1) * ASPECT_SCALE;
                    let ny  = (y / GRID_H) * 2 - 1;

                    nx *= 1 + breathe; ny *= 1 + breathe;
                    nx += parallaxX;   ny += parallaxY + headTilt;

                    const cdx = nx - cfX, cdy = ny - cfY;
                    const cdSq = cdx * cdx + cdy * cdy;
                    const gf = Math.min(0.035, (0.015 / (cdSq + 0.14)) * cursorStrength);
                    nx -= cdx * gf; ny -= cdy * gf;

                    const dSq = nx * nx + ny * ny;
                    if (dSq > 1) continue;
                    const nz = Math.sqrt(1 - dSq);

                    const rX = nx * Math.cos(-lookX) + nz * Math.sin(-lookX);
                    let  rZ = -nx * Math.sin(-lookX) + nz * Math.cos(-lookX);
                    const rY = ny * Math.cos(-lookY) - rZ * Math.sin(-lookY);
                    rZ       = ny * Math.sin(-lookY) + rZ  * Math.cos(-lookY);

                    if (rZ < -0.25) continue;

                    let fc = "";

                    // Eyes: @ dark center, . mid/outer ring
                    const dL = Math.sqrt(((rX + EYE_CX - plX) / EYE_RX) ** 2 + ((rY - EYE_CY - plY) / EYE_RY) ** 2);
                    const dR = Math.sqrt(((rX - EYE_CX - plX) / EYE_RX) ** 2 + ((rY - EYE_CY - plY) / EYE_RY) ** 2);
                    const d  = Math.min(dL, dR);
                    if (d < 1.0) fc = d < 0.38 ? "@" : ".";

                    // Eyebrows — fully independent L/R
                    if (!fc) {
                        if (rX > -0.70 && rX < -0.08) {
                            const t = (rX + 0.70) / 0.62;
                            const by = BROW_BASE_Y - expr.browLiftL - (1 - t) * expr.browAngleL * 0.06;
                            if (Math.abs(rY - by) < BROW_THICK)
                                fc = expr.browAngleL > 0.35 ? "_" : expr.browAngleL < -0.35 ? "\\" : "/";
                        }
                        if (!fc && rX > 0.08 && rX < 0.70) {
                            const t = (0.70 - rX) / 0.62;
                            const by = BROW_BASE_Y - expr.browLiftR - (1 - t) * expr.browAngleR * 0.06;
                            if (Math.abs(rY - by) < BROW_THICK)
                                fc = expr.browAngleR > 0.35 ? "_" : expr.browAngleR < -0.35 ? "/" : "\\";
                        }
                    }

                    // Mouth: 0="-" 😑  1="_" 🙂  2="~" 😏  3="O" 😯
                    if (!fc) {
                        const mDx = rX - asymShift, mDy = rY - 0.40;
                        if (Math.abs(mDx) < mouthHalfW && Math.abs(mDy) < mouthThickY && rZ > -0.15) {
                            if (eIdx > 2.5) {
                                const od = Math.sqrt((mDx / 0.062) ** 2 + (mDy / 0.048) ** 2);
                                fc = od > 0.55 && od < 1.0 ? "O" : "";
                            } else {
                                fc = MOUTH_CHARS[Math.round(eIdx) as 0|1|2|3];
                            }
                        }
                    }

                    if (fc) faceBuf[idx(x, y)] = fc;
                }
            }

            // ── PASS 3 : ground shadow ────────────────────────────────────────
            // Scan the rendered sphereBuf to find actual bounding box,
            // then project a flat ellipse shadow 2px below the sphere bottom.
            // All coords in pixel space — guaranteed in-bounds.
            {
                let botRow = 0, leftCol = GRID_W, rightCol = 0;
                let maxW = 0, centerCol = GRID_W / 2;

                for (let sy = 0; sy < GRID_H; sy++) {
                    let rowL = GRID_W, rowR = 0, hasPixel = false;
                    for (let sx = 0; sx < GRID_W; sx++) {
                        if (sphereBuf[idx(sx, sy)] !== " ") {
                            hasPixel = true;
                            if (sx < rowL) rowL = sx;
                            if (sx > rowR) rowR = sx;
                            if (sx < leftCol)  leftCol  = sx;
                            if (sx > rightCol) rightCol = sx;
                        }
                    }
                    if (hasPixel) {
                        botRow = sy; // track last non-empty row = actual bottom
                        const w = rowR - rowL;
                        if (w > maxW) { maxW = w; centerCol = (rowL + rowR) / 2; }
                    }
                }

                const sphereW = rightCol - leftCol;
                if (sphereW > 0) {
                    // Light from upper-left → shadow shifts right
                    const lxSign = lxN < 0 ? -1 : 1;
                    const sCx = centerCol + sphereW * 0.15 * (-lxSign);
                    const sCy = botRow + 2; // 2px below actual sphere bottom
                    const sRx = sphereW * 0.50 * (1 + Math.abs(breathe) * 2);
                    const sRy = Math.max(2.5, sphereW * 0.065); // flat but visible

                    const r0 = Math.max(0,          Math.floor(sCy - sRy));
                    const r1 = Math.min(GRID_H - 1, Math.ceil (sCy + sRy));
                    const c0 = Math.max(0,          Math.floor(sCx - sRx - 1));
                    const c1 = Math.min(GRID_W - 1, Math.ceil (sCx + sRx + 1));

                    for (let sy = r0; sy <= r1; sy++) {
                        for (let sx = c0; sx <= c1; sx++) {
                            const bi = idx(sx, sy);
                            if (sphereBuf[bi] !== " ") continue;

                            const sdx = (sx - sCx) / sRx;
                            const sdy = (sy - sCy) / sRy;
                            const sd  = Math.sqrt(sdx * sdx + sdy * sdy);
                            if (sd >= 1.0) continue;

                            const noise   = Math.sin(sx * 6.7 + sy * 11.3 + time * 0.25) * 0.025;
                            const density = Math.max(0, 1 - sd * sd) + noise;
                            const sc =
                                density > 0.75 ? ":" :
                                density > 0.50 ? "." :
                                density > 0.25 ? "," :
                                density > 0.06 ? "`" : "";
                            if (sc) shadowBuf[bi] = sc;
                        }
                    }
                }
            }

            // ── COMPOSE : shadow → sphere → face ─────────────────────────────
            if (preRef.current) {
                let out = "";
                for (let y = 0; y < GRID_H; y++) {
                    for (let x = 0; x < GRID_W; x++) {
                        const bi = idx(x, y);
                        out += faceBuf[bi] || sphereBuf[bi] || shadowBuf[bi] || " ";
                    }
                    out += "\n";
                }
                preRef.current.textContent = out;

                const glowPx    = 90 + audioLevel * 65 + cursorStrength * 24;
                const glowAlpha = (0.45 * glowMult + cursorStrength * 0.08 + audioLevel * 0.35).toFixed(3);
                const bright    = (1 + audioLevel * 0.18 + cursorStrength * 0.05).toFixed(3);
                preRef.current.style.filter =
                    `drop-shadow(0 0 ${glowPx}px rgba(255,255,255,${glowAlpha})) brightness(${bright})`;
            }

            rafId = window.requestAnimationFrame(render);
        };

        rafId = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove",  onMouseMove);
            window.removeEventListener("mouseleave", onMouseLeave);
            window.removeEventListener("scroll",     onScroll);
            navCleanup.forEach(fn => fn());
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        // overflow: visible — glow never clipped by container
        // No background, border, or shadow — container is layout-only, invisible
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
                overflow: "visible",
                background: "none",
                border: "none",
                boxShadow: "none",
                willChange: "transform, filter",
                transform: "translateZ(0)",
            }}
            className="relative flex h-full w-full items-center justify-center
                       text-white/85 mix-blend-screen
                       font-mono transform-gpu select-none
                       text-[4px] leading-[4px]
                       sm:text-[5px] sm:leading-[5px]
                       md:text-[6px] md:leading-[6px]
                       lg:text-[7px] lg:leading-[7px]"
        >
            {/* Speech bubble */}
            <div className={`absolute left-1/2 top-[4%] md:top-[8%] -translate-x-1/2 scale-[0.85] sm:scale-100 z-20 max-w-[280px] rounded-full border border-white/15 bg-black/40 px-5 py-2 text-[12px] sm:text-[14px] leading-tight text-white backdrop-blur-lg shadow-[0_0_20px_rgba(255,255,255,0.08)] ${listening ? "animate-pulse [animation-duration:1.2s]" : ""}`}>
                {listening ? "LISTENING..." : bubbleText}
            </div>

            {/* ASCII canvas — overflow visible, no clip, no background */}
            <pre
                ref={preRef}
                className="font-mono transform-gpu select-none"
                style={{ overflow: "visible", background: "none" }}
            />
        </motion.div>
    );
}
