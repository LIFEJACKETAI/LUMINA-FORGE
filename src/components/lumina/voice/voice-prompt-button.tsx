"use client";

// =====================================================================
// LuminaForge.ai — <VoicePromptButton />
// =====================================================================
// A microphone button that uses the browser's Web Speech API to
// transcribe the user's voice and append it to the composer's vibe
// textarea. Works in Chrome, Edge, Safari 14+. Falls back gracefully
// (button is hidden + a tooltip explains) when not supported.
//
// We use `webkitSpeechRecognition` since the standard `SpeechRecognition`
// isn't yet in all browser TypeScript DOM typings.
// =====================================================================

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoicePromptButtonProps {
  onTranscript: (text: string) => void;
}

// Minimal typing for the vendor-prefixed API.
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionConstructor(): any | null {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

export function VoicePromptButton({ onTranscript }: VoicePromptButtonProps) {
  // Track whether we've mounted — voice support can only be checked
  // after mount when `window` is available.
  const [mounted, setMounted] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const supported = mounted && Boolean(getRecognitionConstructor());

  function start() {
    const ctor = getRecognitionConstructor();
    if (!ctor) {
      toast.error("Voice input isn't supported in this browser. Try Chrome, Edge, or Safari 14+.");
      return;
    }
    const rec: SpeechRecognitionLike = new ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let finalText = "";
    rec.onresult = (event: any) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) {
        onTranscript(finalText.trim() + " ");
        finalText = "";
      }
      setInterim(interimText);
    };

    rec.onerror = (event: any) => {
      toast.error(`Voice error: ${event.error ?? "unknown"}`);
      cleanup();
    };

    rec.onend = () => {
      cleanup();
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch (err) {
      toast.error("Could not start microphone. Check your browser permissions.");
      cleanup();
    }
  }

  function stop() {
    recRef.current?.stop();
    cleanup();
  }

  function cleanup() {
    setListening(false);
    setInterim("");
    recRef.current = null;
  }

  if (!supported) {
    // Don't render anything if voice isn't supported — clean fallback.
    return null;
  }

  return (
    <div className="relative flex items-center gap-2">
      <AnimatePresence>
        {interim && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="hidden sm:inline text-[11px] italic text-violet-600 max-w-[140px] truncate"
            aria-hidden
          >
            "{interim}"
          </motion.span>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={listening ? stop : start}
        className={cn(
          "relative inline-flex items-center justify-center w-7 h-7 rounded-full transition-all",
          listening
            ? "bg-rose-500 text-white shadow-[0_0_0_4px_rgba(244,63,94,0.18)]"
            : "bg-violet-100 text-violet-700 hover:bg-violet-200",
        )}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        title={listening ? "Stop listening" : "Speak your vibe"}
      >
        {listening ? (
          <Square className="w-3 h-3 fill-current" />
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}
        {listening && (
          <motion.span
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            style={{ background: "rgba(244, 63, 94, 0.4)" }}
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}
