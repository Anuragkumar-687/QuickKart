'use client';

export default function ProductCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="skeleton aspect-square w-full" />
            <div className="space-y-3 p-5">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
                <div className="flex items-center justify-between pt-2">
                    <div className="skeleton h-5 w-16 rounded" />
                    <div className="skeleton h-9 w-9 rounded-full" />
                </div>
            </div>
        </div>
    );
}
