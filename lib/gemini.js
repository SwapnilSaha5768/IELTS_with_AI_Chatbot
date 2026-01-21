import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.warn("GOOGLE_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "DUMMY_KEY");

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateContent(input) {
    try {
        // input can be a string prompt or an array of parts
        const result = await model.generateContent(input);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error(error.message || "Failed to generate content from AI.");
    }
}

export async function generateJSON(input) {
    // Helper to force JSON output
    let parts = [];
    if (typeof input === 'string') {
        parts = [{ text: `${input} \n\n Respond ONLY with valid JSON.` }];
    } else if (Array.isArray(input)) {
        parts = [...input, { text: "\n\n Respond ONLY with valid JSON." }];
    }

    const text = await generateContent(parts);
    // clean up code fences if present
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON. Raw text:", text);
        throw new Error("AI response was not valid JSON");
    }
}
