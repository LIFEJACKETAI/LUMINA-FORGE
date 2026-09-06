"use client";

// =====================================================================
// LuminaForge.ai — <DemoRecorder />
// =====================================================================
// A built-in video recorder for content creators. Records the Forge
// Studio using the browser's `getDisplayMedia` API + `MediaRecorder`,
// then saves a .webm download. Perfect for bootstrapping YouTube demos.
//
// What gets recorded:
//   - Whatever the user picks in the screen-share prompt (browser tab,
//     window, or screen). For best results, share the browser tab that
//     LuminaForge is running in — that way the cursor + iframe preview
//     are both captured.
//   - Optional mic audio (the user can toggle narration on/off)
//   - System audio (if the browser tab is shared with audio)
//
// The UI is a small floating pill in the top-right of the Forge Studio
// with three states:
//   - idle: "Record" (red dot)
//   - recording: "Stop" + live elapsed timer
//   - finished: shows the Save .webm button + auto-downloads
// =====================================================================

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, Square, Download, Mic, MicOff, Video, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RecorderState = "idle" | "recording" | "stopped";

export function DemoRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [withMic, setWithMic] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Refs that survive across renders without triggering them.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function startTimer() {
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(secs);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function formatElapsed(s: number): string {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  async function startRecording() {
    setShowModal(false);
    setRecordedUrl(null);
    setElapsed(0);
    chunksRef.current = [];

    try {
      // Ask the user to pick a tab/window/screen. The browser shows
      // its native picker — we don't get to see the choice in advance.
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true, // System audio (only works when sharing a tab)
      });

      // Optionally also capture the mic.
      let micStream: MediaStream | null = null;
      if (withMic) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
          toast.info("Mic unavailable — continuing with system audio only.");
        }
      }

      // Combine the tracks. The display stream already has audio if the
      // user picked "share tab with audio"; we add the mic on top.
      const tracks = [...displayStream.getVideoTracks()];
      const audioTracks = [
        ...displayStream.getAudioTracks(),
        ...(micStream?.getAudioTracks() ?? []),
      ];
      const combinedStream = new MediaStream([...tracks, ...audioTracks]);

      streamRef.current = combinedStream;

      // Pick the best mime type the browser supports.
      const mimeType = pickMimeType();
      if (!mimeType) {
        toast.error("This browser doesn't support video recording. Try Chrome or Edge.");
        displayStream.getTracks().forEach((t) => t.stop());
        return;
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 4_000_000 });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setState("stopped");
        // Auto-download for content creators' convenience.
        autoDownload(url);
        toast.success("Recording saved! Previewing below.");
      };

      // If the user stops the share from the browser UI, gracefully stop.
      displayStream.getVideoTracks()[0].addEventListener("ended", () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
          stopTimer();
          setState("stopped");
        }
      });

      recorder.start(1000); // collect in 1s chunks
      setState("recording");
      startTimer();
      toast.success("Recording started. Click Stop when you're done.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start recording";
      // The user probably cancelled the picker.
      if (!msg.toLowerCase().includes("permission") && !msg.toLowerCase().includes("denied")) {
        toast.error(msg);
      } else {
        toast.info("Screen share cancelled.");
      }
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    stopTimer();
    setState("stopped");
  }

  function autoDownload(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `luminaforge-demo-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function discard() {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    setState("idle");
    setElapsed(0);
  }

  function pickMimeType(): string | null {
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
    }
    return null;
  }

  return (
    <>
      {/* The pill in the top bar */}
      {state === "idle" ? (
        <button
          onClick={() => setShowModal(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full hover:bg-white/70 text-slate-700 transition-colors"
          title="Record a video demo"
        >
          <Video className="w-3.5 h-3.5" />
          Record
        </button>
      ) : state === "recording" ? (
        <button
          onClick={stopRecording}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors"
          title="Stop recording"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {formatElapsed(elapsed)}
          <Square className="w-3 h-3 fill-current ml-1" />
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          title="View recording"
        >
          <Check className="w-3.5 h-3.5" />
          Saved
        </button>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-6 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg glass-panel rounded-4xl p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 grid place-items-center text-white shadow-orb-sm">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Record a demo</h3>
                    <p className="text-xs text-slate-500">
                      Save a video of your Forge for your channel.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/70 text-slate-500"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {state === "stopped" && recordedUrl ? (
                <>
                  <video
                    src={recordedUrl}
                    controls
                    className="w-full rounded-3xl bg-slate-900 mb-4"
                    style={{ maxHeight: 320 }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={discard}
                      className="px-3 py-2 text-xs rounded-full hover:bg-white/70 text-slate-600"
                    >
                      Discard
                    </button>
                    <div className="flex gap-2">
                      <a
                        href={recordedUrl}
                        download={`luminaforge-demo-${Date.now()}.webm`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-gradient-lumina text-white shadow-orb-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download .webm
                      </a>
                      <button
                        onClick={() => { setState("idle"); setRecordedUrl(null); setShowModal(false); }}
                        className="px-3 py-2 text-xs rounded-full hover:bg-white/70 text-slate-600"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </>
              ) : state === "recording" ? (
                <div className="space-y-4">
                  <div className="rounded-3xl bg-rose-50 border border-rose-200 p-5 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-rose-500 grid place-items-center text-white mb-3">
                      <Circle className="w-6 h-6 fill-current" />
                    </div>
                    <p className="font-display font-bold text-2xl text-rose-700">{formatElapsed(elapsed)}</p>
                    <p className="text-xs text-rose-600 mt-1">Recording in progress…</p>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Stop recording
                  </button>
                </div>
              ) : (
                // Idle state — the pre-record setup screen
                <>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 text-pretty">
                    When you click Record, your browser will ask you to pick
                    what to share. For best results, choose{" "}
                    <strong>this browser tab</strong> so the Forge Studio +
                    live preview + cursor are all captured. The recording is
                    saved as a .webm video.
                  </p>

                  {/* Mic toggle */}
                  <button
                    onClick={() => setWithMic((v) => !v)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border transition-colors mb-4",
                      withMic
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-white/70 border-slate-200 text-slate-700",
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      {withMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      Microphone narration
                    </span>
                    <span className={cn("text-xs font-medium", withMic ? "text-emerald-600" : "text-slate-500")}>
                      {withMic ? "On" : "Off"}
                    </span>
                  </button>

                  <div className="rounded-2xl bg-violet-50 border border-violet-200 p-3 mb-5">
                    <p className="text-[11px] text-violet-700 leading-relaxed">
                      <strong>Tip:</strong> The recording also captures system
                      audio if you pick "share tab with audio" in the browser
                      picker. Combine that with mic narration for a polished
                      tutorial.
                    </p>
                  </div>

                  <button
                    onClick={startRecording}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-orb-sm"
                  >
                    <Circle className="w-3.5 h-3.5 fill-current" />
                    Start recording
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
