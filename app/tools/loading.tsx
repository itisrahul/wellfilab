export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 animate-pulse">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 pt-10 pb-7">
        <div className="max-w-6xl mx-auto">
          <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-3"/>
          <div className="h-9 w-72 bg-gray-200 dark:bg-gray-700 rounded mb-2"/>
          <div className="h-4 w-52 bg-gray-100 dark:bg-gray-800 rounded mb-7"/>
          <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl mb-4"/>
          <div className="flex gap-2">
            {[80,90,100].map(w=><div key={w} className={`h-8 w-${w === 80 ? 24 : w === 90 ? 28 : 32} bg-gray-100 dark:bg-gray-800 rounded-lg`}/>)}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"/>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-12">
          {Array.from({length:10}).map((_,i)=><div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl"/>)}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({length:9}).map((_,i)=><div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl"/>)}
        </div>
      </div>
    </div>
  );
}
