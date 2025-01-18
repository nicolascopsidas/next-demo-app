import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user_id: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;

export const CreateNoteSchema = NoteSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  user_id: true,
});
export const UpdateNoteSchema = NoteSchema.partial().omit({
  id: true,
  created_at: true,
  user_id: true,
});
