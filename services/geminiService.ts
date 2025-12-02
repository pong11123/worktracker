import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTasks = async (tasks: Task[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Cannot generate AI insights.";
  }

  try {
    const dataSummary = JSON.stringify(tasks.map(t => ({
      title: t.title,
      dept: t.department,
      assignee: t.assignee,
      priority: t.priority,
      status: t.status,
      daysOpen: Math.floor((new Date().getTime() - new Date(t.dateReceived).getTime()) / (1000 * 3600 * 24))
    })));

    const prompt = `
      Analyze the following task data for a work tracking dashboard.
      Data: ${dataSummary}
      
      Please provide a concise summary in Thai (ภาษาไทย) covering:
      1. Overall workload status.
      2. Any bottlenecks or overloaded assignees.
      3. Recommendations for prioritization.
      
      Keep it professional and under 150 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI service.";
  }
};