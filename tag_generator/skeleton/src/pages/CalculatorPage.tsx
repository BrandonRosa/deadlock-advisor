// ============================================================
// src/pages/CalculatorPage.tsx  —  MODULE 10
// The main feature. Build it in four phases:
//
// PHASE A — Team Setup:
//   Hero pool on the left, three drop zones on the right (Allies, Self, Enemies).
//   Drag heroes from the pool into zones. A "Calculate" button runs the engine.
//
// PHASE B — Results Summary:
//   For the best-scoring build: show top 3 items per category (Weapon/Vitality/Spirit).
//
// PHASE C — Build Detail Table:
//   All items sorted by total score, columns sortable.
//   Use TanStack Table for this.
//
// PHASE D — Build Path:
//   Call computeBuildPath() and render with <BuildPathView>.
//
// BUILD ORDER: Do A → B → C → D, testing each before moving on.
// ============================================================

import { useState, useMemo } from 'react';
// TODO: import DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable from '@dnd-kit/core'
// TODO: import Button from shadcn
// TODO: import useDataStore from '../store/dataStore'
// TODO: import { runCalculation, BuildResult, TeamSetup } from '../utils/calculator'
// TODO: import { computeBuildPath } from '../utils/buildPath'
// TODO: import BuildPathView from '../components/calculator/BuildPathView'
// TODO: import type { Hero, Item } from '../types'
// TODO: import assetPath from '../utils/assetPath'
// TODO: import useReactTable, getCoreRowModel, getSortedRowModel, flexRender, ColumnDef from '@tanstack/react-table'

// -----------------------------------------------------------
// TYPES for local state
// -----------------------------------------------------------
interface TeamState {
  self:    Hero | null;
  allies:  Hero[];
  enemies: Hero[];
}

// -----------------------------------------------------------
// DRAGGABLE HERO CARD
// Used in the hero pool — draggable source
// -----------------------------------------------------------
function DraggableHeroCard({ hero }: { hero: Hero }) {
  // TODO: const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: hero.normalized_name })
  return (
    // TODO: <div ref={setNodeRef} {...attributes} {...listeners}
    //            style={{ opacity: isDragging ? 0.4 : 1 }} ...>
    <div className="w-16 h-16 bg-slate-700 rounded cursor-grab active:cursor-grabbing">
      {/* TODO: <img src={assetPath(hero.mini_image_path)} className="w-full h-full object-cover rounded" /> */}
    </div>
  );
}

// -----------------------------------------------------------
// DROP ZONE
// Used for Allies / Self / Enemies slots
// -----------------------------------------------------------
interface DropZoneProps {
  id:       string;         // 'self' | 'allies' | 'enemies'
  label:    string;
  heroes:   (Hero | null)[];
  onRemove: (id: string) => void;
}

function DropZone({ id, label, heroes, onRemove }: DropZoneProps) {
  // TODO: const { setNodeRef, isOver } = useDroppable({ id })
  return (
    // TODO: <div ref={setNodeRef} className={`... ${isOver ? 'ring-2 ring-indigo-400' : ''}`}>
    <div className="bg-slate-800 rounded-lg p-3 min-h-24">
      <div className="text-xs text-slate-400 font-semibold uppercase mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {heroes.map((h, i) =>
          h ? (
            <div key={i} className="relative group">
              {/* TODO: Show hero mini image */}
              {/* TODO: Remove button on hover — calls onRemove(h.normalized_name) */}
            </div>
          ) : (
            <div key={i} className="w-12 h-12 border-2 border-dashed border-slate-600 rounded" />
          )
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// ITEM TABLE (Phase C — TanStack Table)
// -----------------------------------------------------------
function ItemTable({ result }: { result: BuildResult }) {
  const [sorting, setSorting] = useState([]);

  // TODO: Define columns using ColumnDef<ItemScore>[]
  // Columns: Item (image+name), Category, Tier, Ally, Self, Enemy, Total
  // HINT for image+name column:
  //   {
  //     accessorKey: 'item.name',
  //     header: 'Item',
  //     cell: ({ row }) => (
  //       <div className="flex items-center gap-2">
  //         <img src={assetPath(row.original.item.image_path)} className="w-6 h-6" />
  //         {row.original.item.name}
  //       </div>
  //     )
  //   }
  // HINT for numeric columns:
  //   { accessorKey: 'total', header: 'Total',
  //     cell: ({ getValue }) => getValue().toFixed(2) }
  const columns = [] as any; // TODO: replace with actual ColumnDef array

  // TODO: const table = useReactTable({
  //   data: result.itemScores,
  //   columns,
  //   state: { sorting },
  //   onSortingChange: setSorting,
  //   getCoreRowModel: getCoreRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  // })

  return (
    <table className="w-full text-sm">
      <thead>
        {/* TODO: table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="cursor-pointer">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === 'asc' ? ' ▲' : h.column.getIsSorted() === 'desc' ? ' ▼' : ''}
                  </th>
                ))}
              </tr>
            )) */}
      </thead>
      <tbody>
        {/* TODO: table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )) */}
      </tbody>
    </table>
  );
}

// -----------------------------------------------------------
// MAIN PAGE
// -----------------------------------------------------------
export default function CalculatorPage() {
  const data = useDataStore(s => s.getData());

  const [team, setTeam] = useState<TeamState>({ self: null, allies: [], enemies: [] });
  const [results, setResults]   = useState<BuildResult[] | null>(null);
  const [buildIdx, setBuildIdx] = useState(0);

  const heroes = useMemo(() => Object.values(data.heroes), [data]);
  const items  = useMemo(() => Object.values(data.items),  [data]);

  // --- Drag end: assign hero to a zone ---
  function handleDragEnd(event: DragEndEvent) {
    // event.active.id = hero normalized_name being dragged
    // event.over?.id  = 'self' | 'allies' | 'enemies' | null
    //
    // TODO: Find the hero: heroes.find(h => h.normalized_name === event.active.id)
    // TODO: If over?.id === 'self': setTeam({ ...team, self: hero })
    //       If over?.id === 'allies': setTeam({ ...team, allies: [...team.allies, hero] })
    //       If over?.id === 'enemies': setTeam({ ...team, enemies: [...team.enemies, hero] })
    //       If no drop target, do nothing
  }

  function handleRemoveHero(zone: 'self' | 'allies' | 'enemies', normalizedName: string) {
    // TODO: Remove the hero from the specified zone
    // HINT: For 'self' just set self to null
    //       For arrays use .filter(h => h.normalized_name !== normalizedName)
  }

  function handleCalculate() {
    if (!team.self) return;
    // TODO: Call runCalculation with:
    //   setup: { self: team.self, allies: team.allies, enemies: team.enemies }
    //   items (all items)
    //   data.tags
    // TODO: setResults(result)
    // TODO: setBuildIdx(0)
  }

  const activeResult = results?.[buildIdx] ?? null;

  // Build the itemMap for BuildPathView (keyed by normalized_name)
  const itemMap = useMemo(
    () => Object.fromEntries(items.map(i => [i.normalized_name, i])),
    [items]
  );

  return (
    <div>
      {/* TODO: Wrap in <DndContext onDragEnd={handleDragEnd}> */}
      <h1 className="text-2xl font-bold mb-6">Calculator</h1>

      {/* ── PHASE A: Team Setup ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Hero Pool */}
        <div className="col-span-2 bg-slate-800 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Hero Pool — drag heroes to the team</div>
          <div className="flex flex-wrap gap-2">
            {/* TODO: heroes.map(h => <DraggableHeroCard key={h.normalized_name} hero={h} />) */}
          </div>
        </div>

        {/* Team Zones */}
        <div className="space-y-3">
          {/* TODO: <DropZone id="self"    label="You"      heroes={[team.self]} onRemove={...} /> */}
          {/* TODO: <DropZone id="allies"  label="Allies"   heroes={team.allies} onRemove={...} /> */}
          {/* TODO: <DropZone id="enemies" label="Enemies"  heroes={team.enemies} onRemove={...} /> */}
          {/* TODO: Calculate button — disabled if !team.self */}
        </div>
      </div>

      {/* ── PHASE B/C/D: Results (only shown after Calculate) ── */}
      {activeResult && (
        <div className="space-y-6">
          {/* Build selector tabs */}
          <div className="flex gap-2">
            {results!.map((r, i) => (
              <button
                key={i}
                onClick={() => setBuildIdx(i)}
                className={`px-3 py-1 rounded text-sm ${i === buildIdx ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                {r.build.name} ({r.buildScore.toFixed(1)})
              </button>
            ))}
          </div>

          {/* TODO: Phase B — Summary: top 3 items per category
              HINT: activeResult.itemScores.filter(s => s.item.category === 'Weapon').slice(0, 3) */}

          {/* TODO: Phase C — Item Table */}
          {/* <ItemTable result={activeResult} /> */}

          {/* TODO: Phase D — Build Path */}
          {/* const path = computeBuildPath(activeResult.itemScores, items)
              <BuildPathView phases={path} itemMap={itemMap} /> */}
        </div>
      )}

      {/* TODO: DragOverlay showing a ghost of the dragged hero card */}
    </div>
  );
}
