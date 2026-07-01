// Server component — fixed, layered ambient background (glow blobs + grid + noise).
// Sits behind all content; sections that are transparent let the glow show through.
export default function AuroraBackground() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="bg-grid absolute inset-0 opacity-[0.35]" />
            <div className="animate-floaty absolute -top-48 left-1/2 h-[44rem] w-[68rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[170px]" />
            <div
                className="animate-floaty absolute -bottom-40 -right-32 h-[34rem] w-[44rem] rounded-full bg-violet-600/15 blur-[160px]"
                style={{ animationDelay: '-2s' }}
            />
            <div
                className="animate-floaty absolute left-[-6rem] top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-[150px]"
                style={{ animationDelay: '-4s' }}
            />
            <div className="bg-noise absolute inset-0 opacity-[0.12] mix-blend-overlay" />
        </div>
    );
}
