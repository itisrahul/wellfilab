export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      <div className="h-1 w-full bg-teal-200 dark:bg-teal-900"/>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-1.5 mb-5">
          {[3,2,3,2].map((w,i)=><div key={i} className={`h-3 w-${w*8} bg-gray-200 dark:bg-gray-700 rounded`}/>)}
        </div>
        <div className="flex gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"/>
          <div>
            <div className="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2"/>
            <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800 rounded"/>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
          <div className="flex">
            <div className="w-80 bg-gray-50 dark:bg-gray-800 p-5 space-y-4 min-h-[520px]">
              {Array.from({length:5}).map((_,i)=>(
                <div key={i}>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"/>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"/>
                </div>
              ))}
            </div>
            <div className="flex-1 p-7 space-y-4">
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"/>
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i=><div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl"/>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
