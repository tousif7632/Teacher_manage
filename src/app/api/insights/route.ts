import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

// Groq client (OpenAI compatible)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

// Helper: Get week ranges
function getWeekRanges() {
  const now = new Date()

  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())

  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)

  const endOfLastWeek = new Date(startOfThisWeek)

  return { startOfThisWeek, startOfLastWeek, endOfLastWeek }
}

export async function GET() {
  try {
    const grade = "7"

    const { startOfThisWeek, startOfLastWeek, endOfLastWeek } =
      getWeekRanges()

    // This week count
    const thisWeek = await prisma.activity.count({
      where: {
        grade,
        activityType: "QUIZ",
        createdAt: { gte: startOfThisWeek },
      },
    })

    // Last week count
    const lastWeek = await prisma.activity.count({
      where: {
        grade,
        activityType: "QUIZ",
        createdAt: {
          gte: startOfLastWeek,
          lt: endOfLastWeek,
        },
      },
    })

    const percentage =
      lastWeek === 0
        ? 100
        : ((thisWeek - lastWeek) / lastWeek) * 100

    // Fetch teacher names (this week active)
    const activeTeachers = await prisma.teacher.findMany({
      select: { name: true },
    })

    const teacherNames = activeTeachers.map((t: { name: string }) => t.name).join(", ")

    // 🔥 GROK PROMPT
    const prompt = `
You are an AI analytics engine for a school teacher dashboard.

Generate one professional insight sentence.

Grade Level: ${grade}
Current Week Quiz Count: ${thisWeek}
Previous Week Quiz Count: ${lastWeek}
Percentage Change: ${percentage.toFixed(0)}%
Active Teachers: ${teacherNames}

Rules:
- One sentence only
- Under 25 words
- No extra explanation
`

    // Call Groq (with fallback if API key is missing/invalid)
    let insight: string
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      })
      insight = response.choices[0]?.message?.content || ""
    } catch (aiError) {
      console.log("Groq API error, using fallback insight:", aiError)
      insight = ""
    }

    // Fallback insight if AI fails
    if (!insight) {
      const changeText = percentage >= 0 ? "more" : "fewer"
      insight = `Grade ${grade} teachers created ${Math.abs(percentage).toFixed(0)}% ${changeText} quizzes this week.`
    }

    return NextResponse.json({
      success: true,
      insight,
    })
  } catch (error: any) {
    console.error("Insight error:", error)

    return NextResponse.json(
      { success: false, error: "Failed to generate insight", details: error?.message || String(error) },
      { status: 500 }
    )
  }
}