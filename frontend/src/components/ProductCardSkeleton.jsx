'use client';

export default function ProductCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="skeleton aspect-[4/5] w-full rounded-none" />
            <div className="space-y-2 p-3">
                <div className="skeleton h-2.5 w-1/3 rounded" />
                <div className="skeleton h-3.5 w-full rounded" />
                <div className="skeleton h-3.5 w-2/3 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-5 w-24 rounded" />
            </div>
        </div>
    );
}
