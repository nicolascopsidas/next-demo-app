import { z } from "zod";

export const NoteSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  content: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  user_id: z.string().uuid(),
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
