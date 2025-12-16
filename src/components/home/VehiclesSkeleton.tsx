
export function VehiclesSkeleton() {
    return (
        <div className="w-full py-16 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto" />
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
                <div className="flex gap-4 overflow-hidden mt-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[300px] h-[400px] bg-white rounded-xl shadow-sm border border-gray-100" />
                    ))}
                </div>
            </div>
        </div>
    )
}
