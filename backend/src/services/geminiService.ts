import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ColdEmailInput {
    recipientRole: string;
    companyName: string;
    userSkills: string;
    purpose: string;
}

/**
 * Generates a professional cold email body using Google Gemini.
 */
export async function generateColdEmail(
    data: ColdEmailInput
): Promise<{ email: string }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey?.trim()) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Write a professional cold email.

Recipient Role:
${data.recipientRole}

Company:
${data.companyName}

Skills:
${data.userSkills}

Purpose:
${data.purpose}

Tone:
Professional, concise, friendly.

Output only the email.
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text?.trim()) {
        throw new Error('Empty response from Gemini');
    }

    return { email: text.trim() };
}
