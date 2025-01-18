"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NoteList } from "@/components/NoteList";
import { NoteEditor } from "@/components/NoteEditor";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotesApp />
    </QueryClientProvider>
  );
}

function NotesApp() {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <NoteList
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
        />
      </div>
      <div className="w-2/3 p-4">
        {selectedNoteId ? (
          <NoteEditor noteId={selectedNoteId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
