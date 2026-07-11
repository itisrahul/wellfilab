import Link from 'next/link';
export default function NotFound() {
  return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"><div className="text-7xl mb-4">🔍</div><h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Page not found</h1><p className="text-gray-500 mb-6">That calculator does not exist.</p><Link href="/" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all">← Back to all calculators</Link></div>;
}
