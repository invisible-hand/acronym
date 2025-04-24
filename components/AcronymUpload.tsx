import { useRef } from 'react';

interface AcronymUploadProps {
  onAcronymsParsed: (acronyms: { acronym: string; meaning: string }[]) => void;
}

export function AcronymUpload({ onAcronymsParsed }: AcronymUploadProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  function parseCSV(text: string) {
    return text
      .split(/\r?\n/)
      .map(line => line.split(',').map(s => s.trim()))
      .filter(arr => arr.length >= 2 && arr[0] && arr[1])
      .map(([acronym, meaning]) => ({ acronym, meaning }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      onAcronymsParsed(parsed);
    };
    reader.readAsText(file);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData('text');
    const parsed = parseCSV(text);
    if (parsed.length) onAcronymsParsed(parsed);
  }

  function handleTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    const parsed = parseCSV(text);
    if (parsed.length) onAcronymsParsed(parsed);
  }

  return (
    <div className="mb-6">
      <label className="block font-semibold mb-2">Upload or Paste Acronyms List</label>
      <input
        type="file"
        accept=".csv,.txt"
        ref={fileInput}
        onChange={handleFile}
        className="block mb-2"
      />
      <textarea
        rows={4}
        placeholder="Paste CSV: ACRONYM,Meaning"
        className="w-full p-2 border rounded bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 mb-2"
        onPaste={handlePaste}
        onChange={handleTextarea}
      />
      <p className="text-xs text-gray-500">Format: <code>NASA,National Aeronautics and Space Administration</code></p>
    </div>
  );
}
