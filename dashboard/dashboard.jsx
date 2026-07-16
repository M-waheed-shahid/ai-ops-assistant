import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const RAW = [
  { timestamp: "2026-03-02 09:14", customer: "Northwind Logistics", feedback_text: "The AI Readiness roadmap was exactly what we needed - clear and actionable. Our team finally understands where to start.", sentiment: "positive", topic: "other" },
  { timestamp: "2026-03-03 14:22", customer: "Riverbend Retail", feedback_text: "Kickoff call got rescheduled twice with no notice. Not a great first impression for a project we're paying a lot for.", sentiment: "negative", topic: "communication" },
  { timestamp: "2026-03-04 11:05", customer: "Meridian Health Admin", feedback_text: "Consultant assigned to us clearly knows the space. Very responsive on Slack too.", sentiment: "positive", topic: "communication" },
  { timestamp: "2026-03-05 16:40", customer: "Coastal Supply Chain", feedback_text: "The dashboard build is behind schedule and nobody proactively told us. We had to ask for a status update ourselves.", sentiment: "negative", topic: "delivery" },
  { timestamp: "2026-03-06 08:55", customer: "Fernwood Retail", feedback_text: "Loving the retainer relationship so far, the monthly check-ins are genuinely useful.", sentiment: "positive", topic: "communication" },
  { timestamp: "2026-03-07 13:10", customer: "Summit Analytics", feedback_text: "Invoice had an error - billed for hours that weren't in the SOW. Finance is looking into it but this shouldn't happen.", sentiment: "negative", topic: "billing" },
  { timestamp: "2026-03-08 10:30", customer: "Northwind Logistics", feedback_text: "Final deliverable exceeded expectations. Would definitely work with Vantage Point again.", sentiment: "positive", topic: "delivery" },
  { timestamp: "2026-03-09 15:45", customer: "Pinecrest Medical Admin", feedback_text: "Communication has been inconsistent - sometimes daily updates, sometimes silence for a week.", sentiment: "negative", topic: "communication" },
  { timestamp: "2026-03-10 09:00", customer: "Riverbend Retail", feedback_text: "Things have improved since our last call. Appreciate the team addressing our concerns directly.", sentiment: "positive", topic: "communication" },
  { timestamp: "2026-03-11 12:18", customer: "Coastal Supply Chain", feedback_text: "We're seriously considering not renewing. The delays have cost us real time and money this quarter.", sentiment: "negative", topic: "delivery" },
  { timestamp: "2026-03-12 14:50", customer: "Meridian Health Admin", feedback_text: "Solid engagement overall, though the proposal took longer to arrive than expected.", sentiment: "neutral", topic: "delivery" },
  { timestamp: "2026-03-13 09:25", customer: "Harborview Consumer Goods", feedback_text: "The automation they built has saved our support team hours every week. Exactly what we hoped for.", sentiment: "positive", topic: "quality" },
];

const INK = "#1B1D1F";
const PAPER = "#F7F6F2";
const CARD = "#FFFFFF";
const BORDER = "#E3E0D6";
const MUTED = "#6E6B62";
const TEAL = "#0F5E56";
const TEAL_SOFT = "#DCEAE7";
const RED = "#B23A2E";
const RED_SOFT = "#F4DEDB";
const AMBER = "#B4790C";
const AMBER_SOFT = "#F1E4CC";

const SENT_COLOR = { positive: TEAL, negative: RED, neutral: AMBER };
const SENT_SOFT = { positive: TEAL_SOFT, negative: RED_SOFT, neutral: AMBER_SOFT };

function fmtDate(ts) {
  const d = new Date(ts.replace(" ", "T"));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const [hoverIdx, setHoverIdx] = useState(null);

  const total = RAW.length;
  const counts = useMemo(() => {
    const c = { positive: 0, negative: 0, neutral: 0 };
    RAW.forEach((r) => (c[r.sentiment] = (c[r.sentiment] || 0) + 1));
    return c;
  }, []);
  const negRate = Math.round((counts.negative / total) * 100);
  const posRate = Math.round((counts.positive / total) * 100);

  const topicData = useMemo(() => {
    const c = {};
    RAW.forEach((r) => (c[r.topic] = (c[r.topic] || 0) + 1));
    return Object.entries(c)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }, []);
  const topTopic = topicData[0]?.topic ?? "-";

  const flagged = RAW.filter((r) => r.sentiment === "negative");

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: "'IBM Plex Sans', system-ui, sans-serif", padding: "2.5rem", maxWidth: 980, margin: "0 auto" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", borderBottom: `1px solid ${BORDER}`, paddingBottom: "1.25rem" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>Vantage Point Consulting</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30, margin: 0 }}>Client Pulse</h1>
        </div>
        <div style={{ textAlign: "right", fontSize: 13, color: MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>
          Mar 2 – Mar 13, 2026
          <br />
          Source: feedback triage workflow
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: "2rem" }}>
        {[
          { label: "Feedback logged", value: total, sub: "past 12 days" },
          { label: "Negative rate", value: `${negRate}%`, sub: `${counts.negative} of ${total} entries`, tone: RED },
          { label: "Positive rate", value: `${posRate}%`, sub: `${counts.positive} of ${total} entries`, tone: TEAL },
          { label: "Top topic", value: topTopic, sub: `${topicData[0]?.count ?? 0} mentions`, cap: true },
        ].map((k, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 500, color: k.tone || INK, textTransform: k.cap ? "capitalize" : "none" }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Client Pulse strip — signature element */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px 14px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Feedback timeline, by sentiment</div>
        <div style={{ position: "relative", height: 70 }}>
          <div style={{ position: "absolute", top: 34, left: 4, right: 4, height: 1, background: BORDER }} />
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative", height: "100%" }}>
            {RAW.map((r, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", cursor: "default" }}
                onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                {hoverIdx === i && (
                  <div style={{ position: "absolute", bottom: 44, background: INK, color: PAPER, fontSize: 11, padding: "6px 9px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 2 }}>
                    <strong>{r.customer}</strong> · {r.topic}
                  </div>
                )}
                <div style={{ height: 34, display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: r.sentiment === "negative" ? 13 : 10,
                    height: r.sentiment === "negative" ? 13 : 10,
                    borderRadius: "50%",
                    background: SENT_COLOR[r.sentiment],
                    border: `2px solid ${SENT_SOFT[r.sentiment]}`,
                  }} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: MUTED, marginTop: 6 }}>{fmtDate(r.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12, color: MUTED }}>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: TEAL, marginRight: 5 }} />Positive</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: AMBER, marginRight: 5 }} />Neutral</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: RED, marginRight: 5 }} />Negative</span>
        </div>
      </div>

      {/* Topic chart */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Mentions by topic</div>
        <div style={{ width: "100%", height: 190 }}>
          <ResponsiveContainer>
            <BarChart data={topicData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke={BORDER} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis type="category" dataKey="topic" width={100} tick={{ fontSize: 12, fill: INK, textTransform: "capitalize" }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(15,94,86,0.06)" }} contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${BORDER}` }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {topicData.map((_, i) => (
                  <Cell key={i} fill={TEAL} fillOpacity={1 - i * 0.12} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flagged accounts */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Accounts flagged for follow-up</div>
        <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 12 }}>Negative sentiment, routed to Customer Success automatically</div>
        <div>
          {flagged.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: RED, marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{r.customer}</span>
                  <span style={{ fontSize: 11, color: MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>{fmtDate(r.timestamp)}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "#3A3833", lineHeight: 1.5 }}>{r.feedback_text}</div>
                <span style={{ display: "inline-block", marginTop: 6, fontSize: 10.5, textTransform: "capitalize", background: RED_SOFT, color: RED, padding: "2px 8px", borderRadius: 20 }}>{r.topic}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: MUTED, marginTop: 24 }}>
        Generated from the automated feedback triage workflow · AI Ops Assistant project
      </div>
    </div>
  );
}
