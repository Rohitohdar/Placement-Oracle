type ScoreRingProps = {
  value: number;
};

export function ScoreRing({ value }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = clamped * 3.6;

  return (
    <div
      className="relative flex h-44 w-44 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#8b5cf6 0deg, #60a5fa ${angle}deg, rgba(255,255,255,0.12) ${angle}deg 360deg)`
      }}
    >
      <div className="absolute inset-3 rounded-full bg-slate-950/90 backdrop-blur-xl" />
      <div className="relative z-10 text-center">
        <div className="text-4xl font-semibold text-white">{clamped}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-300">
          Overall Score
        </div>
      </div>
    </div>
  );
}
