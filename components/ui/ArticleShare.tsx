'use client';
import { useState } from 'react';

export function ArticleShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const text = `📖 ${title}\n\n${url}`;
  const waUrl    = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  const copy = () => {
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Share this article</p>
      <div className="flex flex-wrap gap-2">
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-500 hover:bg-green-600 text-white transition-all">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.528 5.847L.057 23.453c-.072.265.163.5.427.428l5.638-1.471A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.912 0-3.703-.507-5.248-1.393l-.377-.222-3.91 1.019 1.042-3.803-.241-.392A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          WhatsApp
        </a>
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-black dark:bg-gray-700 text-white transition-all">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Tweet
        </a>
        <button onClick={copy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all">
          {copied ? '✅ Copied!' : '🔗 Copy link'}
        </button>
      </div>
    </div>
  );
}
