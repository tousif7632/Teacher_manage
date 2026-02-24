import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({
  connectionString,
  max: 10,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const teacherData = [
  { teacher_id: "T004", teacher_name: "Vikas Nair", grade: "10", subject: "Social Studies", activity_type: "Quiz", created_at: "2026-02-12 19:07:41" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "7", subject: "English", activity_type: "Question Paper", created_at: "2026-02-13 15:31:51" },
  { teacher_id: "T004", teacher_name: "Vikas Nair", grade: "10", subject: "Social Studies", activity_type: "Lesson Plan", created_at: "2026-02-11 19:15:55" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "7", subject: "Mathematics", activity_type: "Lesson Plan", created_at: "2026-02-17 20:35:33" },
  { teacher_id: "T004", teacher_name: "Vikas Nair", grade: "9", subject: "Social Studies", activity_type: "Question Paper", created_at: "2026-02-15 16:51:32" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "6", subject: "English", activity_type: "Quiz", created_at: "2026-02-14 15:22:29" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "10", subject: "Mathematics", activity_type: "Quiz", created_at: "2026-02-12 12:26:22" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "9", subject: "Science", activity_type: "Quiz", created_at: "2026-02-17 09:21:32" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "9", subject: "Science", activity_type: "Question Paper", created_at: "2026-02-12 11:38:24" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "6", subject: "English", activity_type: "Question Paper", created_at: "2026-02-17 19:07:47" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "10", subject: "Mathematics", activity_type: "Lesson Plan", created_at: "2026-02-11 17:53:57" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "8", subject: "Mathematics", activity_type: "Question Paper", created_at: "2026-02-16 11:26:52" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "7", subject: "English", activity_type: "Lesson Plan", created_at: "2026-02-16 15:41:50" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "10", subject: "Mathematics", activity_type: "Question Paper", created_at: "2026-02-11 17:54:16" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "8", subject: "Mathematics", activity_type: "Lesson Plan", created_at: "2026-02-17 19:19:56" },
  { teacher_id: "T004", teacher_name: "Vikas Nair", grade: "9", subject: "Social Studies", activity_type: "Quiz", created_at: "2026-02-16 19:12:33" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "8", subject: "Mathematics", activity_type: "Question Paper", created_at: "2026-02-13 09:16:06" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "6", subject: "English", activity_type: "Quiz", created_at: "2026-02-15 11:36:03" },
  { teacher_id: "T004", teacher_name: "Vikas Nair", grade: "9", subject: "Social Studies", activity_type: "Lesson Plan", created_at: "2026-02-11 13:06:29" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "10", subject: "Mathematics", activity_type: "Quiz", created_at: "2026-02-15 13:31:42" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "8", subject: "Mathematics", activity_type: "Question Paper", created_at: "2026-02-16 11:44:31" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "8", subject: "Mathematics", activity_type: "Lesson Plan", created_at: "2026-02-18 18:45:43" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "10", subject: "Mathematics", activity_type: "Question Paper", created_at: "2026-02-12 19:19:44" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "8", subject: "Science", activity_type: "Quiz", created_at: "2026-02-14 13:57:07" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "8", subject: "Science", activity_type: "Question Paper", created_at: "2026-02-12 18:01:59" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "7", subject: "Mathematics", activity_type: "Question Paper", created_at: "2026-02-14 10:36:09" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "8", subject: "Mathematics", activity_type: "Lesson Plan", created_at: "2026-02-18 16:32:47" },
  { teacher_id: "T004", teacher_name: "Vikas Nair", grade: "10", subject: "Social Studies", activity_type: "Quiz", created_at: "2026-02-15 15:59:00" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "8", subject: "Science", activity_type: "Lesson Plan", created_at: "2026-02-15 13:31:36" },
  { teacher_id: "T004", teacher_name: "Vikas Nair", grade: "9", subject: "Social Studies", activity_type: "Lesson Plan", created_at: "2026-02-15 16:32:23" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "6", subject: "English", activity_type: "Question Paper", created_at: "2026-02-18 09:12:05" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "9", subject: "Mathematics", activity_type: "Lesson Plan", created_at: "2026-02-18 16:26:04" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "9", subject: "Mathematics", activity_type: "Lesson Plan", created_at: "2026-02-16 17:14:47" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "6", subject: "English", activity_type: "Question Paper", created_at: "2026-02-12 17:47:58" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "10", subject: "Mathematics", activity_type: "Quiz", created_at: "2026-02-18 14:05:20" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "8", subject: "Science", activity_type: "Quiz", created_at: "2026-02-14 09:54:01" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "9", subject: "Science", activity_type: "Lesson Plan", created_at: "2026-02-12 18:27:09" },
  { teacher_id: "T001", teacher_name: "Anita Sharma", grade: "8", subject: "Mathematics", activity_type: "Quiz", created_at: "2026-02-14 15:43:38" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "8", subject: "Science", activity_type: "Lesson Plan", created_at: "2026-02-18 15:48:08" },
  { teacher_id: "T002", teacher_name: "Rahul Verma", grade: "9", subject: "Science", activity_type: "Lesson Plan", created_at: "2026-02-16 13:31:34" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "6", subject: "English", activity_type: "Lesson Plan", created_at: "2026-02-14 19:49:54" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "10", subject: "Mathematics", activity_type: "Quiz", created_at: "2026-02-14 11:55:18" },
  { teacher_id: "T003", teacher_name: "Pooja Mehta", grade: "6", subject: "English", activity_type: "Lesson Plan", created_at: "2026-02-16 15:33:27" },
  { teacher_id: "T005", teacher_name: "Neha Kapoor", grade: "9", subject: "Mathematics", activity_type: "Lesson Plan", created_at: "2026-02-18 11:51:37" },
];

// Map activity types to enum
function mapActivityType(type) {
  switch (type) {
    case "Lesson Plan":
      return "LESSON";
    case "Quiz":
      return "QUIZ";
    case "Question Paper":
      return "ASSESSMENT";
    default:
      return "LESSON";
  }
}

async function main() {
  console.log("Starting seed...");

  // Get unique teachers
  const uniqueTeachers = new Map();
  teacherData.forEach((record) => {
    uniqueTeachers.set(record.teacher_id, record.teacher_name);
  });

  // Create teachers
  for (const [id, name] of uniqueTeachers) {
    await prisma.teacher.upsert({
      where: { id },
      update: { name },
      create: { id, name },
    });
    console.log(`Created/Updated teacher: ${name}`);
  }

  // Create activities
  for (const record of teacherData) {
    try {
      await prisma.activity.create({
        data: {
          teacherId: record.teacher_id,
          teacherName: record.teacher_name,
          grade: record.grade,
          subject: record.subject,
          activityType: mapActivityType(record.activity_type),
          createdAt: new Date(record.created_at),
          class: `Class ${record.grade}`,
        },
      });
      console.log(`Created activity: ${record.activity_type} for ${record.teacher_name}`);
    } catch (error) {
      // Skip duplicates
      console.log(`Skipping duplicate activity for ${record.teacher_name}`);
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
