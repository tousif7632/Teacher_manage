import { NextResponse } from "next/server";
import { generateQuizSchema } from "@/lib/validation";
import OpenAI from "openai";

// Groq client (OpenAI compatible)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = generateQuizSchema.parse(body);

    const { topic, subject, grade, numQuestions, difficulty } = validated;

    const prompt = `Generate ${numQuestions} ${difficulty} level multiple choice quiz questions for Grade ${grade} ${subject} on the topic "${topic}".

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Include the correct answer for each question
- Keep questions appropriate for Grade ${grade} students
- Make sure questions test understanding, not just memorization

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B",
    "explanation": "Brief explanation of why this is correct"
  }
]

Do not include any other text, only the JSON array.`;

    let questions: QuizQuestion[] = [];

    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Fallback questions if AI fails
      questions = getFallbackQuestions(topic, subject, grade, numQuestions);
    }

    return NextResponse.json({
      success: true,
      data: {
        topic,
        subject,
        grade,
        difficulty,
        questions,
      },
    });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate quiz",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

function getFallbackQuestions(
  topic: string,
  subject: string,
  grade: string,
  numQuestions: number
): QuizQuestion[] {
  const fallbacks: QuizQuestion[] = [
    {
      question: `What is the main concept of ${topic} in ${subject}?`,
      options: [
        "Option A - Basic definition",
        "Option B - Core principle",
        "Option C - Advanced application",
        "Option D - Historical context",
      ],
      correctAnswer: "Option B - Core principle",
      explanation: "The core principle represents the fundamental concept.",
    },
    {
      question: `Which of the following best describes ${topic}?`,
      options: [
        "A process of elimination",
        "A method of understanding",
        "A type of measurement",
        "A form of classification",
      ],
      correctAnswer: "A method of understanding",
      explanation: "It helps students understand concepts better.",
    },
    {
      question: `In Grade ${grade} ${subject}, why is ${topic} important?`,
      options: [
        "It is rarely used",
        "It builds foundational knowledge",
        "It is only for advanced students",
        "It is not part of the curriculum",
      ],
      correctAnswer: "It builds foundational knowledge",
      explanation: "Foundational knowledge is essential for advanced topics.",
    },
    {
      question: `How can ${topic} be applied in real life?`,
      options: [
        "Only in academic settings",
        "In everyday problem solving",
        "Never practically",
        "Only by experts",
      ],
      correctAnswer: "In everyday problem solving",
      explanation: "Real-world application enhances learning.",
    },
    {
      question: `What skill does learning ${topic} develop?`,
      options: [
        "Memorization only",
        "Critical thinking",
        "Physical coordination",
        "Artistic expression",
      ],
      correctAnswer: "Critical thinking",
      explanation: "Critical thinking is a key skill developed through this topic.",
    },
  ];

  return fallbacks.slice(0, numQuestions);
}
