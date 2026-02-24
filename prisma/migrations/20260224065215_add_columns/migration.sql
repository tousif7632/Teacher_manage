/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_teacherId_fkey";

-- DropTable
DROP TABLE "Activity";

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "teacher_name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "activity_type" "ActivityType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "class" TEXT NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_activity_type_created_at_idx" ON "activities"("activity_type", "created_at");

-- CreateIndex
CREATE INDEX "activities_teacher_id_created_at_idx" ON "activities"("teacher_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "activities_teacher_id_activity_type_created_at_key" ON "activities"("teacher_id", "activity_type", "created_at");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
