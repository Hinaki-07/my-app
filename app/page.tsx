"use client";

import { useState } from "react";

type Lead = {
  businessName: string;
  address: string;
  currentSiteUrl: string;
  notes: string;
};

type DraftResult = {
  emailDraft: string;
  siteProposal: string;
};

export default function Home() {
  const [lead, setLead] = useState<Lead>({
    businessName: "",
    address: "",
    currentSiteUrl: "",
    notes: "",
  });
  const [result, setResult] = useState<DraftResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState("");
  const [revising, setRevising] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead }),
      });
      if (!res.ok) throw new Error("生成に失敗しました");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevise() {
    if (!revision.trim() || !result) return;
    setRevising(true);
    try {
      const res = await fetch("/api/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead, currentDraft: result.emailDraft, revisionRequest: revision }),
      });
      if (!res.ok) throw new Error("修正に失敗しました");
      const data = await res.json();
      setResult({ emailDraft: data.emailDraft, siteProposal: result.siteProposal });
      setRevision("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setRevising(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI営業支援</h1>
          <p className="mt-1 text-sm text-gray-500">事業者情報を入力して、営業メール下書きを生成します。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">事業者情報</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              店名・事業者名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={lead.businessName}
              onChange={(e) => setLead({ ...lead, businessName: e.target.value })}
              placeholder="例: 山田整骨院"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">住所</label>
            <input
              type="text"
              value={lead.address}
              onChange={(e) => setLead({ ...lead, address: e.target.value })}
              placeholder="例: 東京都渋谷区○○1-2-3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">現在のサイトURL（あれば）</label>
            <input
              type="url"
              value={lead.currentSiteUrl}
              onChange={(e) => setLead({ ...lead, currentSiteUrl: e.target.value })}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">気になった点・メモ</label>
            <textarea
              rows={3}
              value={lead.notes}
              onChange={(e) => setLead({ ...lead, notes: e.target.value })}
              placeholder="例: Googleマップで★4.2・口コミ38件。サイトが5年前から更新なし。"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition"
          >
            {loading ? "生成中..." : "営業メール下書きを生成"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {result && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h2 className="font-semibold text-gray-800">サイト提案の方向性</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.siteProposal}</p>
            </div>

            <div className="bg-white rounded-xl border border-blue-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">営業メール下書き</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(result.emailDraft)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  コピー
                </button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                {result.emailDraft}
              </pre>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h2 className="font-semibold text-gray-800">修正を依頼する</h2>
              <textarea
                rows={2}
                value={revision}
                onChange={(e) => setRevision(e.target.value)}
                placeholder="例: もう少し丁寧な文体にしてください"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleRevise}
                disabled={revising || !revision.trim()}
                className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
              >
                {revising ? "修正中..." : "修正する"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
