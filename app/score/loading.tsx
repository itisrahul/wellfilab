export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading your Score…</p>
      </div>
    </div>
  );
}
