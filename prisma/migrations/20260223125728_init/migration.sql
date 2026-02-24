-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LESSON', 'QUIZ', 'ASSESSMENT');

-- CreateTable
CREATE TABLE "Teacher" (
    "id" VARCHAR(64) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "subject" TEXT NOT NULL,
    "class" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Teacher_name_idx" ON "Teacher"("name");

-- CreateIndex
CREATE INDEX "Activity_activityType_createdAt_idx" ON "Activity"("activityType", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_teacherId_createdAt_idx" ON "Activity"("teacherId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_teacherId_activityType_createdAt_key" ON "Activity"("teacherId", "activityType", "createdAt");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
