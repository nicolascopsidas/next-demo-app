import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/schemas";
import { UpdateNoteSchema } from "@/schemas";
import { createClient } from "@/utils/supabase/client";
import { useDebouncedCallback } from "use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

interface NoteEditorProps {
  noteId: number;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string | null>("");

  const {
    data: note,
    isLoading,
    error,
  } = useQuery<Note>({
    queryKey: ["notes", noteId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();
      const parseResult = UpdateNoteSchema.safeParse(data);
      if (!parseResult.success) {
        throw new Error("Invalid data from database");
      }
      return data;
    },
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const updateNoteMutation = useMutation({
    mutationFn: async (updatedNote: Partial<Note>) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const updatedFields = {
        ...updatedNote,
        updated_at: new Date().toISOString(),
        user_id: user?.id,
      };
      const result = UpdateNoteSchema.safeParse(updatedFields);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      const { data, error } = await supabase
        .from("notes")
        .update(updatedFields)
        .eq("id", noteId)
        .select();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", noteId] });
    },
  });

  const debouncedUpdate = useDebouncedCallback(
    () => {
      const updatedFields = {
        title,
        content,
      };
      const result = UpdateNoteSchema.safeParse(updatedFields);
      if (result.success) {
        updateNoteMutation.mutate(result.data);
      } else {
        console.error(result.error);
      }
    },
    1000 // 1 second delay
  );

  if (isLoading) return <div />;
  if (error) return <Skeleton className="h-full w-full" />;
  if (!note) return <div>Note not found</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 space-y-1">
        <p>Created: {new Date(note.created_at).toLocaleString()}</p>
        <p>Last Updated: {new Date(note.updated_at).toLocaleString()}</p>
      </div>
      <Input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          debouncedUpdate();
        }}
        placeholder="Titre de votre note"
        className="text-2xl font-bold"
      />
      <Textarea
        value={content ?? ""}
        onChange={(e) => {
          setContent(e.target.value);
          debouncedUpdate();
        }}
        placeholder="Écrivez votre note ici..."
        className="min-h-[calc(100vh-250px)]"
      />
    </div>
  );
}
