import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [query, setQuery] = useState('');
  const [acronyms, setAcronyms] = useState<{ acronym: string; meaning: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('acronym-theme');
    if (saved === 'dark' || saved === 'light') setTheme(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('acronym-theme', theme);
    }
  }, [theme]);

  // Filter acronyms by query (case-insensitive, startsWith or includes)
  const filtered = query
    ? acronyms.filter(a =>
        a.acronym.toLowerCase().includes(query.toLowerCase()) ||
        a.meaning.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // LLM state
  const [aiMeaning, setAiMeaning] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrefetched, setAiPrefetched] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiVisible, setAiVisible] = useState(false);
  // Prefetch LLM if no results and query is non-empty
  useEffect(() => {
    setAiVisible(false);
    setAiMeaning(null);
    setAiError(null);
    setAiPrefetched(false);
    if (query && filtered.length === 0) {
      setAiLoading(true);
      fetch(`/api/llm-acronym?acronym=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setAiMeaning(data.meaning);
          setAiError(data.error || null);
          setAiPrefetched(true);
        })
        .catch(() => setAiError('AI request failed'))
        .finally(() => setAiLoading(false));
    }
  }, [query, filtered.length]);

  useEffect(() => {
    async function fetchAcronyms() {
      try {
        setLoading(true);
        const res = await fetch('/api/acronyms-from-pdfs');
        if (!res.ok) throw new Error('Failed to load acronyms');
        const data = await res.json();
        setAcronyms(data);
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchAcronyms();
  }, []);

  return (
    <>
      <Head>
        <title>Acronym Finder</title>
        <meta name="description" content="Find and explore acronyms instantly with typeahead, semantic search, and LLM-powered explanations." />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">Acronym Finder</h1>
            <button
              className="ml-4 p-2 rounded-full bg-blue-50 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <MoonIcon className="h-6 w-6 text-blue-400 dark:text-blue-200" />
              )}
            </button>
          </div>
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-blue-300" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-400"
              placeholder="Type an acronym..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            {loading && (
              <div className="text-blue-400 text-center py-4">Loading acronyms from PDFs...</div>
            )}
            {error && (
              <div className="text-red-500 text-center py-4">{error}</div>
            )}
            {!loading && !error && query && filtered.length === 0 && (
              <div className="text-center py-4">
                <div className="text-gray-500 mb-2">No results found in database.</div>
                <button
                  className="text-blue-500 underline text-sm opacity-80 hover:opacity-100 transition"
                  disabled={aiLoading || aiError}
                  onClick={() => setAiVisible(true)}
                >
                  Ask AI
                </button>
                {aiVisible && (
                  <div className="mt-3 px-4 py-3 rounded bg-blue-50 dark:bg-gray-800 text-left text-sm shadow-inner text-gray-900 dark:text-gray-100">
                    {aiLoading && (
                      <span className="animate-pulse text-blue-400">Thinking…</span>
                    )}
                    {aiError && (
                      <span className="text-red-500">{aiError}</span>
                    )}
                    {!aiLoading && !aiError && aiMeaning && (
                      <span>
                        {aiMeaning}
                        <span className="block mt-2 text-xs text-gray-500 dark:text-gray-400 italic">may be wrong</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            {!loading && !error && filtered.map(a => (
              <div key={a.acronym} className="flex items-center justify-between py-2 px-3 border-b border-blue-50 dark:border-gray-800">
                <span className="font-mono font-semibold text-blue-700 dark:text-blue-200">{a.acronym}</span>
                <span className="ml-4 text-gray-700 dark:text-gray-200">{a.meaning}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}
