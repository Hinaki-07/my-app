"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { clinicData as c } from "./config";

// ─── カラー定義 ───────────────────────────────────────────
const R0 = "#940700";
const R1 = "#c41200";
const CREAM = "#fdf9f4";
const CREAM2 = "#f5ede0";
const DARK = "#3a1208";
const GOLD = "#d4a870";
const GOLD2 = "#f0d090";

// ─── フェードインコンポーネント ────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.85s ease ${delay}s, transform 0.85s ease ${delay}s` }}>
      {children}
    </div>
  );
}

// ─── 波打ちSVG区切り線 ────────────────────────────────────
function WaveDivider({ color = R0, flip = false }: { color?: string; flip?: boolean }) {
  return (
    <div style={{ lineHeight: 0, transform: flip ? "scaleX(-1)" : undefined }}>
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: "100%", height: 40, display: "block" }} xmlns="http://www.w3.org/2000/svg">
        <path d="M0,20 C150,40 350,0 600,20 C850,40 1050,0 1200,20 L1200,40 L0,40 Z" fill={color} />
      </svg>
    </div>
  );
}

// ─── 背景波紋パターン ─────────────────────────────────────
function Seigaiha({ stroke = GOLD, opacity = 0.07 }: { stroke?: string; opacity?: number }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`sg-${stroke.replace("#", "")}`} x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          {[[24,48],[0,48],[48,48],[12,26],[36,26],[24,4],[0,4],[48,4]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="22" fill="none" stroke={stroke} strokeWidth="0.8" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#sg-${stroke.replace("#", "")})`} />
    </svg>
  );
}

// ─── ホバーボタン ─────────────────────────────────────────
function Btn({ href, children, variant = "outline", onClick }: { href?: string; children: React.ReactNode; variant?: "solid" | "outline" | "ghost"; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  const base: React.CSSProperties = { display: "inline-block", padding: "13px 32px", borderRadius: 2, fontSize: 13, letterSpacing: "0.14em", textDecoration: "none", cursor: "pointer", border: "none", transition: "all 0.25s ease", fontFamily: "inherit" };
  const styles: Record<string, React.CSSProperties> = {
    solid: { ...base, background: hov ? R1 : R0, color: "#fff", boxShadow: hov ? `0 6px 24px rgba(148,7,0,0.45)` : "none", transform: hov ? "translateY(-2px)" : "none" },
    outline: { ...base, border: `1px solid ${hov ? R1 : R0}`, color: hov ? "#fff" : CREAM, background: hov ? R0 : "transparent", transform: hov ? "translateY(-2px)" : "none" },
    ghost: { ...base, border: `1px solid rgba(200,160,112,${hov ? 0.8 : 0.4})`, color: hov ? GOLD2 : GOLD, background: hov ? "rgba(200,160,112,0.08)" : "transparent", transform: hov ? "translateY(-2px)" : "none" },
  };
  const props = { style: styles[variant], onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false) };
  if (onClick) return <button type="button" onClick={onClick} {...props}>{children}</button>;
  return <a href={href} {...props}>{children}</a>;
}

// ─── メインコンポーネント ─────────────────────────────────
export default function HotoriPage() {
  const [heroV, setHeroV] = useState(false);
  const [contactMode, setContactMode] = useState<"calendar" | "mail">("calendar");
  const [form, setForm] = useState({ name: "", tel: "", menu: "", date: "", time: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => { const t = setTimeout(() => setHeroV(true), 120); return () => clearTimeout(t); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, mode: contactMode }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", background: "#fff", border: "1px solid #ddd0c0",
    borderRadius: 2, padding: "12px 16px", fontSize: 14, color: "#2a1a1a", outline: "none",
    letterSpacing: "0.04em", fontFamily: "inherit",
  };

  return (
    <div style={{ fontFamily: "'Hiragino Mincho ProN','Yu Mincho','Georgia',serif", background: CREAM, color: "#2a1a1a", overflowX: "hidden" }}>

      {/* ══ ヘッダー ══ */}
      <header style={{ background: DARK, borderBottom: `1px solid #2a0500`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ color: GOLD, fontSize: 19, letterSpacing: "0.2em" }}>{c.name}</span>
            <span style={{ color: "#7a5030", fontSize: 11, letterSpacing: "0.3em" }}>{c.nameEn}</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="#contact" style={{ color: "#f0e0d0", fontSize: 12, letterSpacing: "0.1em", textDecoration: "none", opacity: 0.7 }}>お問い合わせ</a>
            <Btn href={`tel:${c.tel}`} variant="outline">{c.tel}</Btn>
          </div>
        </div>
      </header>

      {/* ══ ヒーロー ══ */}
      <section style={{ background: DARK, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <Seigaiha stroke={GOLD} opacity={0.06} />
        {/* 装飾ライン */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${R1}, transparent)` }} />
        <div style={{ position: "absolute", left: 56, top: "10%", bottom: "10%", width: 1, background: `linear-gradient(180deg, transparent, ${R0} 30%, ${R0} 70%, transparent)` }} />
        <div style={{ position: "absolute", right: 56, top: "10%", bottom: "10%", width: 1, background: `linear-gradient(180deg, transparent, ${R0} 30%, ${R0} 70%, transparent)` }} />
        {/* 装飾円 */}
        <div style={{ position: "absolute", right: "8%", top: "15%", width: 280, height: 280, borderRadius: "50%", border: `1px solid rgba(148,7,0,0.2)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "10%", top: "17%", width: 200, height: 200, borderRadius: "50%", border: `1px solid rgba(200,160,112,0.15)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "6%", bottom: "15%", width: 160, height: 160, borderRadius: "50%", border: `1px solid rgba(148,7,0,0.15)`, pointerEvents: "none" }} />

        <div style={{ textAlign: "center", padding: "0 24px", position: "relative", zIndex: 1, opacity: heroV ? 1 : 0, transform: heroV ? "translateY(0)" : "translateY(36px)", transition: "opacity 1.2s ease, transform 1.2s ease" }}>
          <p style={{ color: R1, fontSize: 11, letterSpacing: "0.5em", marginBottom: 24 }}>治療院ほとり ── Hotori</p>
          <h1 style={{ color: "#faf0e8", fontSize: "clamp(28px, 5vw, 54px)", fontWeight: 300, lineHeight: 1.85, letterSpacing: "0.12em", whiteSpace: "pre-line", marginBottom: 16 }}>
            {c.catchcopy}
          </h1>
          <p style={{ color: GOLD, fontSize: 14, letterSpacing: "0.18em", marginBottom: 48, opacity: heroV ? 1 : 0, transition: "opacity 1.2s ease 0.7s" }}>
            {c.subCopy}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {c.lineUrl && <Btn href={c.lineUrl} variant="solid">LINE で予約する</Btn>}
            <Btn href="#contact" variant="outline">メールで問い合わせ</Btn>
            <Btn href={`tel:${c.tel}`} variant="ghost">📞 お電話</Btn>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", textAlign: "center", color: "#5a2a18", fontSize: 10, letterSpacing: "0.3em" }}>
          <div style={{ width: 1, height: 36, background: `linear-gradient(${R1}, transparent)`, margin: "0 auto 8px" }} />
          SCROLL
        </div>
      </section>

      {/* ══ ギャラリー ══ */}
      <WaveDivider color={DARK} />
      <section style={{ background: DARK, padding: "60px 24px 80px", position: "relative", overflow: "hidden" }}>
        <Seigaiha stroke={GOLD} opacity={0.05} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <p style={{ color: R1, fontSize: 11, letterSpacing: "0.4em", marginBottom: 10 }}>GALLERY</p>
              <h2 style={{ fontSize: 26, fontWeight: 300, letterSpacing: "0.15em", color: "#faf0e8" }}>院内の雰囲気</h2>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${R0}, ${R1})`, margin: "16px auto 0" }} />
            </div>
          </FadeIn>
          {/* グリッドレイアウト */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "260px 260px", gap: 8 }}>
            {["/g1.png", "/g2.png", "/g3.png", "/g4.png"].map((src, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ position: "relative", height: "100%", borderRadius: 4, overflow: "hidden" }}>
                  <Image src={src} alt={`院内${i + 1}`} fill style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,1,0,0.4) 0%, transparent 50%)" }} />
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <p style={{ textAlign: "center", color: "#8b6050", fontSize: 12, letterSpacing: "0.2em", marginTop: 24 }}>
              ── 裏路地に佇む、静かな隠れ家 ──
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══ 特徴 ══ */}
      <WaveDivider color={CREAM2} flip />
      <section style={{ background: CREAM2, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <Seigaiha stroke={R0} opacity={0.06} />
        {/* 装飾菱形 */}
        <div style={{ position: "absolute", right: "-40px", top: "20%", width: 200, height: 200, border: `1px solid rgba(148,7,0,0.1)`, transform: "rotate(45deg)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ color: R1, fontSize: 11, letterSpacing: "0.4em", marginBottom: 12 }}>FEATURES</p>
              <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.15em" }}>選ばれる理由</h2>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${R0}, ${R1})`, margin: "16px auto 0" }} />
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 36 }}>
            {c.features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div style={{ background: "#fff", borderRadius: 6, padding: "32px 28px", boxShadow: "0 2px 20px rgba(0,0,0,0.06)", borderTop: `3px solid ${R0}`, position: "relative" }}>
                  {/* 装飾番号 */}
                  <span style={{ position: "absolute", top: 12, right: 16, fontSize: 40, fontWeight: 700, color: R0, opacity: 0.08, lineHeight: 1 }}>0{i + 1}</span>
                  <p style={{ color: R1, fontSize: 11, letterSpacing: "0.3em", marginBottom: 12 }}>0{i + 1}</p>
                  <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: 14, letterSpacing: "0.08em", color: "#2a1010" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "#6b5040", lineHeight: 2.1, letterSpacing: "0.04em", whiteSpace: "pre-line" }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ メニュー ══ */}
      <WaveDivider color={DARK} />
      <section style={{ background: DARK, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <Seigaiha stroke={GOLD} opacity={0.05} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, transparent, rgba(148,7,0,0.3), transparent)", transform: "translateX(-50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ color: R1, fontSize: 11, letterSpacing: "0.4em", marginBottom: 12 }}>MENU</p>
              <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.15em", color: "#faf0e8" }}>施術メニュー・料金</h2>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${R0}, ${R1})`, margin: "16px auto 0" }} />
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {c.menus.map((m, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ border: `1px solid rgba(148,7,0,0.25)`, borderRadius: 4, padding: "26px 24px", background: "rgba(255,255,255,0.03)", transition: "border-color 0.3s, background 0.3s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = R1; (e.currentTarget as HTMLDivElement).style.background = "rgba(148,7,0,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(148,7,0,0.25)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ color: "#faf0e8", fontSize: 16, letterSpacing: "0.06em" }}>{m.name}</span>
                    <span style={{ color: GOLD2, fontSize: 15, whiteSpace: "nowrap", marginLeft: 12 }}>{m.price}</span>
                  </div>
                  <p style={{ color: "#c49070", fontSize: 11, letterSpacing: "0.12em", marginBottom: 10 }}>所要時間 {m.time}</p>
                  <p style={{ color: "#d4b8a0", fontSize: 13, lineHeight: 1.9 }}>{m.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <p style={{ textAlign: "center", color: "#c49a80", fontSize: 12, marginTop: 28, letterSpacing: "0.1em" }}>
              ※ 初回の方はカウンセリングを含みます。ご不明な点はお気軽にお問い合わせください。
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══ スタッフ ══ */}
      <WaveDivider color={CREAM} flip />
      <section style={{ background: CREAM, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <Seigaiha stroke={R0} opacity={0.05} />
        {/* 装飾円 */}
        <div style={{ position: "absolute", left: "-80px", top: "30%", width: 300, height: 300, borderRadius: "50%", border: `1px solid rgba(148,7,0,0.08)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ color: R1, fontSize: 11, letterSpacing: "0.4em", marginBottom: 12 }}>STAFF</p>
              <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.15em" }}>スタッフ紹介</h2>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${R0}, ${R1})`, margin: "16px auto 0" }} />
            </div>
          </FadeIn>
          {c.staff.map((s, i) => (
            <FadeIn key={i} delay={0.1}>
              <div style={{ display: "flex", gap: 40, alignItems: "flex-start", background: "#fff", borderRadius: 8, padding: "40px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                {/* アバター */}
                <div style={{ flexShrink: 0, position: "relative" }}>
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, #2a0800 0%, ${R0} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${R0}` }}>
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                      <circle cx="26" cy="19" r="11" fill={GOLD} opacity="0.9" />
                      <ellipse cx="26" cy="41" rx="18" ry="11" fill={GOLD} opacity="0.75" />
                    </svg>
                  </div>
                  {/* 装飾リング */}
                  <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1px solid rgba(148,7,0,0.2)` }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 22, fontWeight: 500, marginBottom: 4, letterSpacing: "0.1em", color: "#1a0808" }}>{s.name}</p>
                  <p style={{ color: R0, fontSize: 12, letterSpacing: "0.2em", marginBottom: 20 }}>{s.role}</p>
                  <div style={{ width: 32, height: 1, background: R0, marginBottom: 20, opacity: 0.4 }} />
                  <p style={{ color: "#5a4030", fontSize: 14, lineHeight: 2.2, letterSpacing: "0.06em" }}>「{s.comment}」</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ アクセス ══ */}
      <WaveDivider color={DARK} />
      <section style={{ background: DARK, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <Seigaiha stroke={GOLD} opacity={0.05} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ color: R1, fontSize: 11, letterSpacing: "0.4em", marginBottom: 12 }}>ACCESS</p>
              <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.15em", color: "#faf0e8" }}>診療時間・アクセス</h2>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${R0}, ${R1})`, margin: "16px auto 0" }} />
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
            <FadeIn>
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <tbody>
                    {c.hours.map((h, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(148,7,0,0.2)" }}>
                        <td style={{ color: GOLD, padding: "14px 0", width: 110, letterSpacing: "0.06em" }}>{h.day}</td>
                        <td style={{ color: "#f0e4d8", padding: "14px 0", letterSpacing: "0.04em" }}>{h.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 32, lineHeight: 2.4, letterSpacing: "0.06em" }}>
                  <p style={{ color: "#9a7060", fontSize: 13 }}>📍 {c.address}</p>
                  <p style={{ color: "#9a7060", fontSize: 13 }}>📞 {c.tel}</p>
                </div>
                <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Btn href={`tel:${c.tel}`} variant="outline">📞 お電話で予約</Btn>
                  <Btn href="#contact" variant="ghost">✉️ メールで相談</Btn>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div style={{ height: 320, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(148,7,0,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                <iframe src={c.googleMapSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ お問い合わせフォーム ══ */}
      <WaveDivider color={CREAM2} flip />
      <section id="contact" style={{ background: CREAM2, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <Seigaiha stroke={R0} opacity={0.05} />
        <div style={{ position: "absolute", right: "-60px", bottom: "10%", width: 240, height: 240, borderRadius: "50%", border: `1px solid rgba(148,7,0,0.08)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ color: R1, fontSize: 11, letterSpacing: "0.4em", marginBottom: 12 }}>CONTACT</p>
              <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.15em" }}>ご予約・お問い合わせ</h2>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${R0}, ${R1})`, margin: "16px auto 0" }} />
            </div>
          </FadeIn>

          {/* モード切り替えタブ */}
          <FadeIn delay={0.05}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginBottom: 32, borderRadius: 6, overflow: "hidden", border: `1px solid ${R0}` }}>
              {[
                { key: "calendar", label: "📅 カレンダー予約", sub: "日時を指定して予約" },
                { key: "mail", label: "✉️ メール相談", sub: "まず気軽に相談したい" },
              ].map(({ key, label, sub }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setContactMode(key as "calendar" | "mail"); setStatus("idle"); }}
                  style={{
                    padding: "18px 12px", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s",
                    background: contactMode === key ? R0 : "#fff",
                    color: contactMode === key ? "#fff" : "#6b5040",
                    borderRight: key === "calendar" ? `1px solid ${R0}` : "none",
                  }}
                >
                  <div style={{ fontSize: 14, letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.06em" }}>{sub}</div>
                </button>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            {status === "sent" ? (
              <div style={{ textAlign: "center", padding: "56px 24px", background: "#fff", borderRadius: 8, border: `1px solid ${R0}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: 36, marginBottom: 16 }}>{contactMode === "calendar" ? "📅" : "✉️"}</p>
                <p style={{ color: R0, fontSize: 18, letterSpacing: "0.12em", marginBottom: 12 }}>送信完了しました</p>
                <p style={{ color: "#6b5040", fontSize: 13, lineHeight: 2 }}>
                  {contactMode === "calendar"
                    ? "ご予約ありがとうございます。\n確認後にご連絡いたします。"
                    : "お問い合わせありがとうございます。\n2営業日以内にご連絡いたします。"}
                </p>
                <button onClick={() => setStatus("idle")} style={{ marginTop: 24, background: "none", border: `1px solid ${R0}`, color: R0, padding: "10px 24px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                  戻る
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 8, padding: "36px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* 共通：名前・電話 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, letterSpacing: "0.14em", color: "#6b5040", marginBottom: 8 }}>お名前 <span style={{ color: R1 }}>*</span></label>
                    <input type="text" required placeholder="山田 花子" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, letterSpacing: "0.14em", color: "#6b5040", marginBottom: 8 }}>お電話番号</label>
                    <input type="tel" placeholder="093-000-0000" value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                {/* カレンダー予約モード */}
                {contactMode === "calendar" && (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.14em", color: "#6b5040", marginBottom: 8 }}>ご希望メニュー</label>
                      <select value={form.menu} onChange={e => setForm({ ...form, menu: e.target.value })} style={inputStyle}>
                        <option value="">選択してください</option>
                        {c.menus.map((m, i) => <option key={i} value={m.name}>{m.name}（{m.price}）</option>)}
                        <option value="未定・相談したい">未定・相談したい</option>
                      </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, letterSpacing: "0.14em", color: "#6b5040", marginBottom: 8 }}>ご希望日 <span style={{ color: R1 }}>*</span></label>
                        <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} min={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, letterSpacing: "0.14em", color: "#6b5040", marginBottom: 8 }}>ご希望時間帯 <span style={{ color: R1 }}>*</span></label>
                        <select required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inputStyle}>
                          <option value="">選択</option>
                          {["9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.14em", color: "#6b5040", marginBottom: 8 }}>備考・症状など</label>
                      <textarea rows={3} placeholder="お体の状態やご要望などあればお書きください" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ ...inputStyle, resize: "none", lineHeight: 1.8 }} />
                    </div>
                  </>
                )}

                {/* メール相談モード */}
                {contactMode === "mail" && (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.14em", color: "#6b5040", marginBottom: 8 }}>お問い合わせ内容 <span style={{ color: R1 }}>*</span></label>
                      <textarea required rows={6} placeholder={"料金や施術内容についてなど、\nお気軽にご相談ください"} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ ...inputStyle, resize: "none", lineHeight: 1.9 }} />
                    </div>
                    <p style={{ fontSize: 12, color: "#9a7060", letterSpacing: "0.04em", lineHeight: 1.8 }}>
                      ※ 通常2営業日以内にご返信いたします。<br />お急ぎの場合はお電話（{c.tel}）にてご連絡ください。
                    </p>
                  </>
                )}

                {status === "error" && (
                  <p style={{ color: R1, fontSize: 12, textAlign: "center" }}>送信に失敗しました。お電話にてご連絡ください。</p>
                )}
                <button type="submit" disabled={status === "sending"} style={{ background: status === "sending" ? "#aaa" : `linear-gradient(135deg, ${R0}, ${R1})`, color: "#fff", border: "none", padding: "16px", borderRadius: 4, fontSize: 14, letterSpacing: "0.2em", cursor: status === "sending" ? "not-allowed" : "pointer", transition: "all 0.25s", fontFamily: "inherit", boxShadow: status !== "sending" ? `0 4px 20px rgba(148,7,0,0.3)` : "none" }}>
                  {status === "sending" ? "送信中..." : contactMode === "calendar" ? "予　約　す　る" : "送　信　す　る"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <WaveDivider color={R0} />
      <section style={{ background: `linear-gradient(135deg, #5a0300 0%, ${R0} 50%, #c41200 100%)`, padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Seigaiha stroke="#fff" opacity={0.05} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <FadeIn>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, letterSpacing: "0.4em", marginBottom: 16 }}>RESERVATION</p>
            <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 300, letterSpacing: "0.15em", marginBottom: 12 }}>お電話でもお気軽にどうぞ</h2>
            <p style={{ color: "rgba(255,220,200,0.8)", fontSize: 13, letterSpacing: "0.08em", marginBottom: 40 }}>受付時間内であればいつでもお電話ください</p>
            <Btn href={`tel:${c.tel}`} variant="ghost">
              <span style={{ fontSize: 20, letterSpacing: "0.15em" }}>{c.tel}</span>
            </Btn>
          </FadeIn>
        </div>
      </section>

      {/* ══ フッター ══ */}
      <footer style={{ background: "#2a0d06", color: "#7a4a30", textAlign: "center", padding: "28px 24px", fontSize: 11, letterSpacing: "0.2em" }}>
        <p style={{ marginBottom: 6 }}>{c.name}　{c.address}</p>
        <p>© 2025 {c.name}　All rights reserved.</p>
      </footer>
    </div>
  );
}
