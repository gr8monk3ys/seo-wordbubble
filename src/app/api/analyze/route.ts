import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Use OpenAI to analyze the topic and generate keywords
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Analyze the given topic and return the most relevant keywords for SEO optimization. For each keyword, provide an importance score between 1 and 100 based on relevance, search volume, and competition."
        },
        {
          role: "user",
          content: `Generate SEO keywords for the topic: ${topic}`
        }
      ]
    });

    // Parse the response and format keywords
    const response = completion.choices[0].message.content;
    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      );
    }
    const keywords = parseKeywords(response);

    return NextResponse.json(keywords);
  } catch (error) {
    console.error('Error analyzing keywords:', error);
    return NextResponse.json(
      { error: 'Failed to analyze keywords' },
      { status: 500 }
    );
  }
}

function parseKeywords(response: string): Array<{ text: string; size: number }> {
  try {
    // This is a simple parser that expects keywords in format: keyword (score)
    const keywordRegex = /([^(]+)\s*\((\d+)\)/g;
    const keywords: Array<{ text: string; size: number }> = [];
    let match;

    while ((match = keywordRegex.exec(response)) !== null) {
      const text = match[1].trim();
      const score = parseInt(match[2]);
      if (text && !isNaN(score)) {
        keywords.push({
          text,
          size: score * 10 // Scale the score for better visualization
        });
      }
    }

    // If no keywords were parsed, fall back to splitting the response
    if (keywords.length === 0) {
      return response
        .split('\n')
        .filter(line => line.trim())
        .map((keyword, index) => ({
          text: keyword.trim(),
          size: (1000 / (index + 1)) // Decrease size progressively
        }));
    }

    return keywords;
  } catch (error) {
    console.error('Error parsing keywords:', error);
    return [];
  }
}
