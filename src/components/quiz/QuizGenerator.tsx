"use client";

import { useState } from "react";
import { Sparkles, Save, Loader2, CheckCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface GeneratedQuiz {
  topic: string;
  subject: string;
  grade: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export function QuizGenerator(): React.ReactNode {
  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    grade: "7",
    numQuestions: 5,
    difficulty: "medium" as "easy" | "medium" | "hard",
    teacherId: "T001",
    teacherName: "Anita Sharma",
  });

  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGenerate = async () => {
    if (!formData.topic || !formData.subject) {
      setMessage({ type: "error", text: "Please fill in topic and subject" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: formData.topic,
          subject: formData.subject,
          grade: formData.grade,
          numQuestions: formData.numQuestions,
          difficulty: formData.difficulty,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedQuiz(data.data);
        setMessage({ type: "success", text: "Quiz generated successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to generate quiz" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQuiz) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: formData.teacherId,
          teacherName: formData.teacherName,
          grade: generatedQuiz.grade,
          subject: generatedQuiz.subject,
          topic: generatedQuiz.topic,
          questions: generatedQuiz.questions,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Quiz saved to database!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save quiz" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Quiz Generator</h3>
      </div>

      {/* Form */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Topic</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., Fractions, Photosynthesis"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g., Mathematics, Science"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Grade</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {[6, 7, 8, 9, 10].map((g) => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Number of Questions</label>
          <select
            value={formData.numQuestions}
            onChange={(e) => setFormData({ ...formData, numQuestions: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {[3, 5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>{n} Questions</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Generated Quiz */}
      {generatedQuiz && (
        <div className="border-t border-gray-100 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{generatedQuiz.topic}</h4>
              <p className="text-sm text-gray-500">
                {generatedQuiz.subject} • Grade {generatedQuiz.grade} • {generatedQuiz.difficulty} • {generatedQuiz.questions.length} questions
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Quiz
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {generatedQuiz.questions.map((q, idx) => (
              <div key={idx} className="rounded-xl bg-gray-50 p-4">
                <p className="mb-3 font-medium text-gray-900">
                  {idx + 1}. {q.question}
                </p>
                <div className="mb-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        opt === q.correctAnswer
                          ? "bg-green-100 text-green-800"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {opt}
                      {opt === q.correctAnswer && (
                        <span className="ml-2 text-xs font-medium">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
