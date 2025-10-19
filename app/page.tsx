"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Particles from "@/components/Particles";

type JobState = {
  status: "idle" | "queued" | "running" | "succeeded" | "failed";
  message?: string;
};

const funkyMessages: Record<JobState["status"], string> = {
  idle: "Awaiting your neon vision",
  queued: "Queueing shards of light...",
  running: "Conjuring particle storms...",
  succeeded: "Composite conjured!",
  failed: "The portal fizzled",
};

function FunkyLoading() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500/40 border-t-orange-400/90"></div>
      <div className="absolute h-12 w-12 animate-ping rounded-full bg-gradient-to-r from-orange-500/70 to-orange-300/70 blur-xl"></div>
      <div className="absolute h-24 w-24 animate-pulse rounded-full border border-orange-500/30 blur-sm" />
    </div>
  );
}

type GenerationResponse = {
  jobId: string;
};

type JobResponse = {
  status: "queued" | "running" | "succeeded" | "failed";
  resultUrl?: string;
};

export default function Page() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceName, setReferenceName] = useState<string>("");
  const [jobState, setJobState] = useState<JobState>({ status: "idle" });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasResult = useMemo(() => jobState.status === "succeeded" && !!resultUrl, [jobState.status, resultUrl]);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unable to read file"));
        }
      };
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);
    setResultUrl(null);
    setJobState({ status: "idle" });
    setReferenceName(file.name);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setReferenceImage(dataUrl);
    } catch (err) {
      console.error(err);
      setError("Could not read the reference image");
    }
  }, []);

  const pollJob = useCallback(
    async (jobId: string) => {
      try {
        const response = await fetch(`/api/nb/jobs/${jobId}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to poll job (${response.status})`);
        }
        const data: JobResponse = await response.json();
        setJobState({ status: data.status, message: funkyMessages[data.status] });

        if (data.status === "succeeded" && data.resultUrl) {
          setResultUrl(data.resultUrl);
          clearPolling();
          return;
        }

        if (data.status === "failed") {
          clearPolling();
          setError("NanoBanana reported a failure. Try another prompt!");
          return;
        }

        pollingRef.current = setTimeout(() => {
          void pollJob(jobId);
        }, 2200);
      } catch (err) {
        console.error(err);
        clearPolling();
        setError("Polling fizzled. Please retry.");
        setJobState({ status: "failed" });
      }
    },
    [clearPolling]
  );

  const onSubmit = useCallback(async () => {
    if (!referenceImage) {
      setError("Reference image required");
      return;
    }
    if (!prompt.trim()) {
      setError("Prompt cannot be empty");
      return;
    }

    clearPolling();
    setIsSubmitting(true);
    setJobState({ status: "queued", message: funkyMessages.queued });
    setError(null);
    setResultUrl(null);

    try {
      const response = await fetch("/api/nb/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, referenceImage }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const data: GenerationResponse = await response.json();
      setJobState({ status: "running", message: funkyMessages.running });
      pollingRef.current = setTimeout(() => {
        void pollJob(data.jobId);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Could not start the NanoBanana generation");
      setJobState({ status: "failed" });
    } finally {
      setIsSubmitting(false);
    }
  }, [clearPolling, pollJob, prompt, referenceImage]);

  const onDownload = useCallback(() => {
    if (!hasResult || !resultUrl) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = resultUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const width = img.naturalWidth || 1024;
      const height = img.naturalHeight || 1024;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(15, 8, 40, 0.95)");
      gradient.addColorStop(1, "rgba(255, 122, 0, 0.25)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "screen";
      ctx.drawImage(img, 0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      ctx.fillStyle = "rgba(255, 184, 107, 0.35)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "source-over";
      ctx.font = `${Math.floor(width * 0.035)}px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textBaseline = "bottom";
      ctx.fillText("Curio VFX", 32, height - 40);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "curio-vfx-composite.png";
      link.click();
    };
    img.onerror = () => {
      setError("Unable to download composite. Check cross-origin settings.");
    };
  }, [hasResult, resultUrl]);

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      await handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const onUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 pb-20 pt-16">
      <div className="absolute inset-0 -z-10 opacity-70">
        <Particles className="h-full w-full" />
      </div>
      <header className="flex flex-col gap-4 text-center sm:gap-6">
        <p className="text-sm uppercase tracking-[0.4em] text-orange-200/70">NanoBanana powered</p>
        <h1 className="text-4xl font-semibold tracking-tight text-orange-50 sm:text-5xl md:text-6xl">
          Curio VFX
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-orange-100/80">
          Drop in a reference frame, riff a prompt, and let the neon-fueled NanoBanana cores conjure your next
          composite.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="glow-card flex flex-col gap-6 p-6 sm:p-8">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            className="drop-zone"
            role="button"
            tabIndex={0}
            onClick={onUploadClick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onUploadClick();
              }
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-orange-200">
                Reference
              </span>
              <p className="text-base font-semibold text-orange-50">Drag & drop or click to upload</p>
              <p className="text-sm text-orange-100/60">PNG, JPG up to 5MB</p>
              {referenceName ? (
                <p className="text-sm text-orange-100/80">Loaded: {referenceName}</p>
              ) : (
                <p className="text-sm text-orange-100/60">No file selected</p>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(event) => void handleFiles(event.target.files)}
          />

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-200">Prompt</label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the VFX twist..."
              className="input-field min-h-[140px] resize-none"
            />
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="status-pill">
                <span className="inline-flex h-2 w-2 rounded-full bg-orange-300 shadow-neon" />
                {jobState.message ?? funkyMessages[jobState.status]}
              </span>
              {error && <span className="text-sm text-orange-200/70">{error}</span>}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="button-primary"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Summoning" : "Generate"}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={onDownload}
                disabled={!hasResult}
              >
                Download Composite
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80 p-6 sm:p-10">
          <div className="absolute inset-0">
            <Particles className="h-full w-full" />
          </div>
          <div className="relative z-10 flex h-full flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.3em] text-orange-200/70">Live Preview</p>
              {jobState.status === "running" && <FunkyLoading />}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-orange-200/20 bg-slate-950/60 shadow-neon">
              {resultUrl ? (
                <NextImage
                  src={resultUrl}
                  alt="Generated VFX result"
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : referenceImage ? (
                <NextImage
                  src={referenceImage}
                  alt="Reference preview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-80"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center text-orange-100/70">
                  <p className="text-lg font-semibold">Your VFX masterpiece awaits</p>
                  <p className="max-w-xs text-sm text-orange-100/60">
                    Upload a reference image and craft a prompt to watch particles swirl it into something new.
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-400/10" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
