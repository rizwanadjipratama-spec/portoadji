"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import AsciiSphereFace from "@/components/effects/AsciiSphereFace";

export default function HeroSection() {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [micEnabled, setMicEnabled] = useState(false);
  const [micError, setMicError] = useState("");
  const audioLevelRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioFrameRef = useRef<number | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY * 0.1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioFrameRef.current !== null) {
        window.cancelAnimationFrame(audioFrameRef.current);
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();

      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const handleEnableVoiceInteraction = async () => {
    if (micEnabled) {
      return;
    }

    try {
      setMicError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const audioContext = new window.AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const audioData = new Uint8Array(analyser.frequencyBinCount);

      mediaStreamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      audioDataRef.current = audioData;

      const updateAudioLevel = () => {
        const activeAnalyser = analyserRef.current;
        const activeData = audioDataRef.current;

        if (!activeAnalyser || !activeData) {
          return;
        }

        activeAnalyser.getByteTimeDomainData(activeData as Uint8Array<ArrayBuffer>);

        let total = 0;
        for (let i = 0; i < activeData.length; i++) {
          total += Math.abs(activeData[i] - 128) / 128;
        }

        const average = total / activeData.length;
        const normalized = Math.max(0, Math.min(1, average * 3.2));
        audioLevelRef.current += (normalized - audioLevelRef.current) * 0.18;
        audioFrameRef.current = window.requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
      setMicEnabled(true);
    } catch {
      setMicError("Microphone access was not available. You can keep exploring without voice interaction.");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-[120px] px-8 overflow-hidden w-full">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center justify-center gap-12 lg:gap-16 text-center relative z-10">
        <motion.div
          style={{ y: scrollOffset }}
          className="relative flex w-[min(1400px,95vw)] items-center justify-center overflow-hidden rounded-[24px] border border-white/[0.08] bg-[rgba(15,15,18,0.55)] px-8 py-10 pointer-events-none opacity-90 backdrop-blur-[18px] shadow-[0_40px_120px_rgba(0,0,0,0.45),0_0_120px_rgba(0,0,0,0.3)] mix-blend-screen drop-shadow-[0_0_40px_rgba(255,255,255,0.08)] sm:px-10 sm:py-12 lg:min-h-[620px] lg:px-20 lg:py-10"
        >
          <div className="relative flex min-h-[360px] w-full items-center justify-center lg:min-h-[600px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-[56%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.06)_24%,rgba(255,255,255,0.02)_44%,transparent_72%)] blur-[52px] opacity-85 lg:h-[460px] lg:w-[460px]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 animate-[spin_14s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_316deg,rgba(255,255,255,0.08)_336deg,transparent_356deg,transparent_360deg)] opacity-70 blur-[18px] lg:h-[500px] lg:w-[500px]" />
            <div className="pointer-events-none absolute bottom-[8%] left-1/2 h-[74px] w-[240px] rounded-full bg-[radial-gradient(ellipse,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.3)_42%,transparent_76%)] blur-[26px] lg:bottom-[9%] lg:h-[92px] lg:w-[340px]" style={{ animation: "sphere-shadow 7s ease-in-out infinite" }} />
            <div
              className="sphere-core relative mx-auto w-full max-w-[360px] shrink-0 aspect-square md:max-w-[460px] lg:max-w-[600px]"
              style={{ animation: "sphere-float 7s ease-in-out infinite" }}
            >
              <div className="h-full w-full aspect-square">
                <AsciiSphereFace audioLevelRef={audioLevelRef} isListening={micEnabled} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center space-y-8 z-10 max-w-4xl"
        >
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="font-heading font-light tracking-[-0.03em] leading-[0.9] text-[clamp(58px,8vw,132px)]"
            >
              <span className="shimmer-text block pb-2">Rizwan Adji<br />Pratama Putra</span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-white/20 pt-6 mt-2"
          >
            <p className="tech-label text-[10px] md:text-sm text-white/60">Laboratory Equipment Technician</p>
            <p className="tech-label text-[10px] md:text-sm text-white/60">Electronics Repair</p>
            <p className="tech-label text-[10px] md:text-sm text-white/60">Hardware Systems</p>
            <p className="tech-label text-[10px] md:text-sm text-white/60">Automation</p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="max-w-2xl text-lg md:text-xl text-white/50 leading-relaxed font-body font-light"
          >
            Independent builder focused on laboratory instrumentation, electronics repair, and system development.
          </motion.p>

          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleEnableVoiceInteraction}
              disabled={micEnabled}
              className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-xs sm:text-sm tracking-[0.24em] uppercase text-white/85 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.12] disabled:cursor-default disabled:border-white/10 disabled:bg-white/[0.04] disabled:text-white/45"
            >
              {micEnabled ? "Voice Interaction Enabled" : "Enable Voice Interaction"}
            </button>

            {micError && (
              <p className="max-w-xl text-sm text-white/45 leading-relaxed">{micError}</p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
