import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { summaryText } = body as { summaryText: string };

  const prompt = `You are assisting a cardiologist reviewing a consultation record. Based ONLY on the structured data below, provide:
1. A concise clinical summary (2-4 sentences)
2. Notable findings or red flags worth the doctor's attention
3. Suggested differential diagnosis or diagnostic considerations
4. General treatment/management considerations for the doctor to review

This is decision support for a licensed physician, not a replacement for clinical judgment. Be concise and use clear section headers.

Consultation data:
${summaryText}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content
      ?.filter((c: { type: string }) => c.type === "text")
      .map((c: { text: string }) => c.text)
      .join("\n") ?? "No response generated.";

    return NextResponse.json({ analysis: text });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
