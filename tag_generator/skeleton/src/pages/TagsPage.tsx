// ============================================================
// src/pages/TagsPage.tsx  —  MODULE 6
// Displays all tags as a drag-to-reorder list with CRUD operations.
//
// FEATURES:
//   - List all tags (read from store)
//   - Drag to reorder (using @dnd-kit/sortable)
//   - Add new tag (Dialog form)
//   - Edit existing tag (Dialog form)
//   - Delete tag (with confirmation)
//   - Editing disabled in 'defaults' mode (show a banner)
//
// KEY LIBRARY: @dnd-kit/sortable
//   DndContext   = wrapper that listens for drag events
//   SortableContext = knows the ordered list of items
//   useSortable  = hook inside each draggable row
//   arrayMove    = helper: arrayMove([a,b,c,d], 0, 2) → [b,c,a,d]
//   onDragEnd event gives you: active.id (dragged) and over.id (target)
// ============================================================

import { useState } from 'react';
// TODO: import DndContext, closestCenter from '@dnd-kit/core'
// TODO: import SortableContext, verticalListSortingStrategy,
//               useSortable, arrayMove from '@dnd-kit/sortable'
// TODO: import DragEndEvent from '@dnd-kit/core'
// TODO: import Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger from shadcn
// TODO: import Button, Input, Label from shadcn
// TODO: import useDataStore from '../store/dataStore'
// TODO: import type { Tag } from '../types'

// -----------------------------------------------------------
// SORTABLE ROW — one draggable tag entry
// -----------------------------------------------------------
interface SortableTagRowProps {
  tag:      Tag;
  isCustom: boolean;  // false = editing disabled
  onEdit:   (tag: Tag) => void;
  onDelete: (code: string) => void;
}

function SortableTagRow({ tag, isCustom, onEdit, onDelete }: SortableTagRowProps) {
  // TODO: const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tag.code })
  //
  // The useSortable hook gives you:
  //   setNodeRef  = attach to the DOM element (ref prop)
  //   attributes  = spread onto element for accessibility
  //   listeners   = spread onto drag handle for mouse/touch events
  //   transform   = current drag offset (use CSS.Transform.toString(transform) for style)
  //   transition  = CSS transition string for smooth snapping

  // TODO: Build the style object:
  //   { transform: CSS.Transform.toString(transform), transition }
  //   HINT: import CSS from '@dnd-kit/utilities'

  return (
    // TODO: <div ref={setNodeRef} style={style} {...attributes}>
    <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg mb-2">
      {/* Drag handle — spread listeners here, not on the whole row */}
      {/* TODO: <span {...listeners} className="cursor-grab ...">⠿</span> */}

      <span className="flex-1 font-mono text-sm text-slate-300">{tag.code}</span>
      <span className="text-slate-400 text-sm">{tag.name}</span>

      {/* TODO: Edit and Delete buttons — disabled if !isCustom */}
    </div>
  );
}

// -----------------------------------------------------------
// TAG FORM — reused by both Add and Edit dialogs
// -----------------------------------------------------------
interface TagFormProps {
  initial: Partial<Tag>;
  onSave:  (tag: Tag) => void;
  onClose: () => void;
}

function TagForm({ initial, onSave, onClose }: TagFormProps) {
  const [code, setCode]        = useState(initial.code ?? '');
  const [name, setName]        = useState(initial.name ?? '');
  const [desc, setDesc]        = useState(initial.description ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Validate that code and name are not empty
    // TODO: call onSave({ code, name, description: desc })
    // TODO: call onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TODO: Label + Input for code */}
      {/* TODO: Label + Input for name */}
      {/* TODO: Label + Input for description (optional) */}
      {/* TODO: Save button (type="submit") and Cancel button */}
    </form>
  );
}

// -----------------------------------------------------------
// MAIN PAGE
// -----------------------------------------------------------
export default function TagsPage() {
  // TODO: Read tags and mode from the store
  // HINT: const data = useDataStore(s => s.getData())
  //       const mode = useDataStore(s => s.mode)
  //       const updateTags = useDataStore(s => s.updateTags)

  const [addOpen, setAddOpen]       = useState(false);
  const [editTarget, setEditTarget] = useState<Tag | null>(null);

  const isCustom = false; // TODO: mode === 'custom'

  // --- Drag end handler ---
  function handleDragEnd(event: /* TODO: DragEndEvent */ any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // TODO: Find the old and new index:
    //   const oldIdx = tags.findIndex(t => t.code === active.id)
    //   const newIdx = tags.findIndex(t => t.code === over.id)
    //
    // TODO: Call updateTags(arrayMove(tags, oldIdx, newIdx))
  }

  // --- CRUD handlers ---
  function handleAdd(newTag: Tag) {
    // TODO: Call updateTags([...tags, newTag])
  }

  function handleEdit(updated: Tag) {
    // TODO: Replace the old tag in the array:
    //   updateTags(tags.map(t => t.code === updated.code ? updated : t))
  }

  function handleDelete(code: string) {
    if (!confirm('Delete this tag?')) return;
    // TODO: updateTags(tags.filter(t => t.code !== code))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tags</h1>

        {/* TODO: Disable the Add button when !isCustom */}
        {/* TODO: Wrap in Dialog with open={addOpen} onOpenChange={setAddOpen} */}
        <button>Add Tag</button>
      </div>

      {/* Mode warning banner */}
      {!isCustom && (
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 mb-4 text-amber-300 text-sm">
          You are in Defaults mode. Go to Settings to enable Custom mode before editing.
        </div>
      )}

      {/* TODO: Wrap the list in <DndContext> and <SortableContext>
          DndContext props: collisionDetection={closestCenter} onDragEnd={handleDragEnd}
          SortableContext props: items={tags.map(t => t.code)} strategy={verticalListSortingStrategy} */}
      <div>
        {/* TODO: Map over tags and render <SortableTagRow> for each */}
        {/* HINT: Don't forget the key prop — use tag.code */}
      </div>

      {/* Edit Dialog */}
      {/* TODO: Dialog open={editTarget !== null} onOpenChange={v => !v && setEditTarget(null)}
               Inside: <TagForm initial={editTarget} onSave={handleEdit} onClose={...} /> */}
    </div>
  );
}
