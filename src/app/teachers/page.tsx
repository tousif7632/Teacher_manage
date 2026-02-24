"use client";

import { useEffect, useState } from "react";
import { BookOpen, FileQuestion, ClipboardList, GraduationCap, Calendar } from "lucide-react";

type TeacherStats = {
  lessons: number;
  quizzes: number;
  assessments: number;
  total: number;
};

type Activity = {
  id: string;
  activityType: "LESSON" | "QUIZ" | "ASSESSMENT";
  subject: string;
  class: string;
  createdAt: string;
};

type Teacher = {
  id: string;
  name: string;
  stats: TeacherStats;
  subjects: string[];
  grades: string[];
  activities: Activity[];
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      const res = await fetch("/api/teachers");
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case "LESSON":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "QUIZ":
        return <FileQuestion className="h-4 w-4 text-amber-500" />;
      case "ASSESSMENT":
        return <ClipboardList className="h-4 w-4 text-rose-500" />;
      default:
        return null;
    }
  }

  function getActivityLabel(type: string) {
    switch (type) {
      case "LESSON":
        return "Lesson Plan";
      case "QUIZ":
        return "Quiz";
      case "ASSESSMENT":
        return "Question Paper";
      default:
        return type;
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500">Manage and view all teacher activities</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Teachers: <span className="font-semibold text-gray-900">{teachers.length}</span>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            onClick={() => setSelectedTeacher(teacher)}
            className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-semibold text-purple-600">
                  {teacher.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                  <p className="text-xs text-gray-500">ID: {teacher.id}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-green-50 p-2 text-center">
                <p className="text-lg font-semibold text-green-600">{teacher.stats.lessons}</p>
                <p className="text-[10px] text-green-600">Lessons</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-2 text-center">
                <p className="text-lg font-semibold text-amber-600">{teacher.stats.quizzes}</p>
                <p className="text-[10px] text-amber-600">Quizzes</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-2 text-center">
                <p className="text-lg font-semibold text-rose-600">{teacher.stats.assessments}</p>
                <p className="text-[10px] text-rose-600">Papers</p>
              </div>
            </div>

            {/* Subjects & Grades */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-500">Subjects:</span>
                <span className="text-gray-700">{teacher.subjects.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-500">Grades:</span>
                <span className="text-gray-700">{teacher.grades.join(", ")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl font-semibold text-purple-600">
                  {selectedTeacher.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTeacher.name}</h2>
                  <p className="text-sm text-gray-500">ID: {selectedTeacher.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="rounded-xl bg-purple-50 p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{selectedTeacher.stats.total}</p>
                <p className="text-xs text-purple-600">Total Activities</p>
              </div>
              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{selectedTeacher.stats.lessons}</p>
                <p className="text-xs text-green-600">Lesson Plans</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{selectedTeacher.stats.quizzes}</p>
                <p className="text-xs text-amber-600">Quizzes</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4 text-center">
                <p className="text-2xl font-bold text-rose-600">{selectedTeacher.stats.assessments}</p>
                <p className="text-xs text-rose-600">Question Papers</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="mt-6">
              <h3 className="mb-4 font-semibold text-gray-900">Recent Activities</h3>
              <div className="space-y-2">
                {selectedTeacher.activities.slice(0, 10).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.activityType)}
                      <div>
                        <p className="font-medium text-gray-900">{getActivityLabel(activity.activityType)}</p>
                        <p className="text-xs text-gray-500">{activity.subject} • {activity.class}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
