import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const teacherIdSchema = z.object({
  id: z.string().min(1),
});

export const dateRangeSchema = z
  .object({
    from: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for 'from'",
    }).optional(),
    to: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for 'to'",
    }).optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to);
      }
      return true;
    },
    { message: "from must be before to" },
  );

export const createActivitySchema = z.object({
  teacherId: z.string().min(1),
  teacherName: z.string().min(1),
  grade: z.string().min(1),
  activityType: z.enum(["LESSON", "QUIZ", "ASSESSMENT"]),
  createdAt: z.string().datetime().optional(),
  subject: z.string().min(1),
  class: z.string().min(1),
});

export const generateQuizSchema = z.object({
  topic: z.string().min(1),
  subject: z.string().min(1),
  grade: z.string().min(1),
  numQuestions: z.coerce.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const saveQuizSchema = z.object({
  teacherId: z.string().min(1),
  teacherName: z.string().min(1),
  grade: z.string().min(1),
  subject: z.string().min(1),
  topic: z.string().min(1),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
    explanation: z.string().optional(),
  })),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type TeacherIdInput = z.infer<typeof teacherIdSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type SaveQuizInput = z.infer<typeof saveQuizSchema>;

