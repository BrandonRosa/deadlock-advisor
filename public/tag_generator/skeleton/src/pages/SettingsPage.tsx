// ============================================================
// src/pages/SettingsPage.tsx  —  MODULE 11
// Data mode toggle, export, import, and reset.
//
// BROWSER FILE DOWNLOAD pattern (for export):
//   1. new Blob([jsonString], { type: 'application/json' })
//   2. URL.createObjectURL(blob) → temporary URL
//   3. Create hidden <a>, set href + download filename, click it
//   4. URL.revokeObjectURL(url) to free memory
//
// BROWSER FILE UPLOAD pattern (for import):
//   <input type="file" accept=".json" onChange={handleImport} />
//   Inside handleImport: use FileReader to read the file as text, then JSON.parse
// ============================================================

import { useRef } from 'react';
// TODO: import useDataStore from '../store/dataStore'
// TODO: import Switch from shadcn (the toggle component)
// TODO: import Button, Label from shadcn
// TODO: import type { AppData } from '../types'

export default function SettingsPage() {
  // TODO: Destructure from useDataStore:
  //   mode, activateCustomMode, setMode, exportData, importData, resetToDefaults

  // Hidden file input ref — we programmatically click this to open the file picker
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Create a FileReader
    // TODO: reader.onload = (ev) => {
    //         try {
    //           const data = JSON.parse(ev.target?.result as string) as AppData
    //           importData(data)
    //           alert('Imported successfully!')
    //         } catch {
    //           alert('Failed: invalid JSON')
    //         }
    //       }
    // TODO: reader.readAsText(file)
    // TODO: Reset the input: e.target.value = ''  (allows re-uploading the same file)
  }

  function handleReset() {
    // TODO: confirm('This deletes all custom data. Are you sure?')
    // TODO: If confirmed, call resetToDefaults()
  }

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* ── Data Mode ── */}
      <section className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Data Mode</h2>
        <div className="flex items-center gap-3">
          {/* TODO: <Switch
                checked={mode === 'custom'}
                onCheckedChange={v => v ? activateCustomMode() : setMode('defaults')}
              />
              <Label>{mode === 'custom' ? 'Custom Data' : 'Defaults'}</Label> */}
        </div>
        <p className="text-slate-400 text-sm">
          Defaults = read-only, always the latest deployed weights.
          Custom = your browser-local edits, survives page refreshes.
        </p>
      </section>

      {/* ── Export / Import ── */}
      <section className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Export / Import</h2>
        <div className="flex gap-3">
          {/* TODO: Export button — calls exportData(), disabled if mode !== 'custom' */}
          {/* TODO: Import button — calls fileRef.current?.click() */}
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </section>

      {/* ── Reset ── */}
      <section className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg text-red-400">Reset</h2>
        {/* TODO: Destructive-variant Button → handleReset() */}
        <p className="text-slate-400 text-sm">
          Permanently deletes custom data from your browser. Export first if you want to keep it.
        </p>
      </section>
    </div>
  );
}
