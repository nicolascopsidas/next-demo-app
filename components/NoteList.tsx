import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, PlusCircle } from "lucide-react";
import { CreateNoteSchema, NoteSchema, type Note } from "../schemas";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";

interface NoteListProps {
  selectedNoteId: number | null;
  onSelectNote: (id: number | null) => void;
}

export function NoteList({ selectedNoteId, onSelectNote }: NoteListProps) {
  const queryClient = useQueryClient();

  const {
    data: notes,
    isLoading,
    error,
  } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });
      const parseResult = z.array(NoteSchema).safeParse(data);
      if (!parseResult.success || error) {
        throw new Error("Invalid data from database");
      }
      return data || [];
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const fields = {
        title: "Nouvelle note",
        content: "",
        user_id: user?.id,
      };
      const result = CreateNoteSchema.safeParse(fields);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      const { data, error } = await supabase
        .from("notes")
        .insert([fields])
        .select();
      const parseResult = z.array(NoteSchema).safeParse(data);
      if (!parseResult.success || error) {
        throw new Error("Invalid data from database");
      }
      return data;
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onSelectNote(newNote[0].id);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const supabase = createClient();
      await supabase.from("notes").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      if (selectedNoteId) {
        onSelectNote(null);
      }
    },
  });

  if (isLoading) return <Skeleton className="h-full w-full" />;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <Button className="w-full" onClick={() => createNoteMutation.mutate()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle note
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        {notes?.map((note) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div
            key={note.id}
            className={`flex flex-col p-4 cursor-pointer hover:bg-gray-100 ${
              note.id === selectedNoteId ? "bg-gray-100" : ""
            }`}
            onClick={() => onSelectNote(note.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{note.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {note.content
                    ? note.content.length > 20
                      ? `${note.content.slice(0, 20)}...`
                      : note.content
                    : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNoteMutation.mutate(note.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(note.updated_at).toLocaleString()}
            </p>
          </div>
        ))}
      </ScrollArea>
    </>
  );
}
