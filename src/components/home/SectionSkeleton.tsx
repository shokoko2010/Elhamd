
export function SectionSkeleton() {
    return (
        <div className="w-full py-16 px-4">
            <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
