import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { lead, currentDraft, revisionRequest } = await req.json();

  const isRevision = !!currentDraft && !!revisionRequest;

  const prompt = isRevision
    ? `以下の営業メール下書きを修正してください。

【現在の下書き】
${currentDraft}

【修正依頼】
${revisionRequest}

修正後のメール本文のみ返してください。`
    : `以下の事業者に向けた営業メールの下書きと、サイト提案の方向性を作成してください。

【事業者情報】
- 店名: ${lead.businessName}
- 住所: ${lead.address || "不明"}
- 現在のサイト: ${lead.currentSiteUrl || "なし"}
- メモ: ${lead.notes || "なし"}

【背景】
私たちはAIを使って短期間・低コストでWebサイトを制作する会社です。
すでにこの事業者向けのサイト案を作成した状態で営業しています。

以下の2つをJSON形式で返してください:
{
  "emailDraft": "営業メール本文（件名含む、200〜300字程度）",
  "siteProposal": "このサイトで打ち出すべきポイント・構成案（3〜5点）"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    if (isRevision) {
      return NextResponse.json({ emailDraft: text, siteProposal: "" });
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSONの解析に失敗しました");
    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      emailDraft: parsed.emailDraft ?? "",
      siteProposal: parsed.siteProposal ?? "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
  }
}
