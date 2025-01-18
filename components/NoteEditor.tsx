import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/schemas";
import { NoteSchema, UpdateNoteSchema } from "@/schemas";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

interface NoteEditorProps {
  noteId: number;
}

type FormData = z.infer<typeof UpdateNoteSchema>;

export function NoteEditor({ noteId }: NoteEditorProps) {
  const queryClient = useQueryClient();

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(UpdateNoteSchema),
    defaultValues: {
      title: "",
      content: null,
    },
  });

  const title = watch("title");
  const content = watch("content");

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
      const parseResult = NoteSchema.safeParse(data);
      if (!parseResult.success || error) {
        throw new Error("Invalid data from database");
      }
      return data;
    },
  });

  useEffect(() => {
    if (note) {
      setValue("title", note.title);
      setValue("content", note.content);
    }
  }, [note, setValue]);

  const updateNoteMutation = useMutation({
    mutationFn: async (updatedNote: FormData) => {
      const supabase = createClient();

      const updatedFields = {
        ...updatedNote,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("notes")
        .update(updatedFields)
        .eq("id", noteId)
        .select();

      console.log(data);
      const parseResult = z.array(NoteSchema).safeParse(data);
      if (!parseResult.success || error) {
        throw new Error("Invalid data from database");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", noteId] });
    },
  });

  useEffect(() => {
    if (!note) return;

    // Only update if values are different from current note
    if (title === note.title && content === note.content) return;

    const timer = setTimeout(() => {
      updateNoteMutation.mutate({
        title,
        content,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, updateNoteMutation, note]);

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
        {...register("title")}
        placeholder="Titre de votre note"
        className="text-2xl font-bold"
      />
      {errors.title && (
        <p className="text-sm text-red-500">{errors.title.message}</p>
      )}
      <Textarea
        {...register("content")}
        placeholder="Écrivez votre note ici..."
        className="min-h-[calc(100vh-250px)]"
      />
      {errors.content && (
        <p className="text-sm text-red-500">{errors.content.message}</p>
      )}
    </div>
  );
}
