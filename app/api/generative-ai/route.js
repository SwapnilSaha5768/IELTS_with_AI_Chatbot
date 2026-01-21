import { generateContent, generateJSON } from '../../../lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { prompt, audio, format } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        let input = prompt;

        // Handle Multimodal (Audio)
        if (audio) {
            // audio should be { data: "base64...", mimeType: "audio/webm" }
            input = [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: audio.mimeType,
                        data: audio.data
                    }
                }
            ];
        }

        let result;
        if (format === 'json') {
            result = await generateJSON(input);
        } else {
            result = await generateContent(input);
        }

        return NextResponse.json({ result });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}
