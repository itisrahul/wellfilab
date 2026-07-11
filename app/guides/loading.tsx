export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 animate-pulse">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 pt-10 pb-7">
        <div className="max-w-6xl mx-auto">
          <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2"/>
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2"/>
          <div className="h-4 w-56 bg-gray-100 dark:bg-gray-800 rounded mb-7"/>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({length:5}).map((_,i)=><div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl"/>)}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {[1,2].map(i=><div key={i} className="h-44 bg-gray-100 dark:bg-gray-800 rounded-2xl"/>)}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({length:6}).map((_,i)=><div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl"/>)}
        </div>
      </div>
    </div>
  );
}
