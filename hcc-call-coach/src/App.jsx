import { useState, useRef, useEffect } from "react";

const SOP = `
HILL COUNTRY CABINETS — BUILDER OUTREACH CALL SCRIPT & QUICK REFERENCE

COMPANY: Hill Country Cabinets — custom cabinets and closets for builders.

STEP 1 — BEFORE THE CALL (PREPARE)
- Research builder: company size (small/mid/large), project types (custom homes, spec homes, remodels, commercial), reputation/market presence.
- Have ready: short company intro, portfolio highlights (kitchens, closets, pantries, home offices), key talking points (quality, 3D renderings, reliable timelines, responsive service).
- Goal: walk away with a meeting, site visit, or opportunity to quote their next project.

STEP 2 — OPENING THE CALL
Greeting: "Hi, this is [Your Name] with Hill Country Cabinets. Do you have just a couple of minutes?"
- Keep it brief. If they say they're busy, respect it — offer to call back at a better time.
Intro: "We work with builders across the area providing custom cabinets and closets. We've helped a lot of builders simplify their projects with quality, on-time cabinetry — and I wanted to reach out to see if that might be useful for you."
- Don't oversell here. The goal is to earn two more minutes, not close them on the call.

STEP 3 — DISCOVERY — ASK QUESTIONS & LISTEN
Goal: understand their business and find pain points. Listen more than you talk.
Q1: "Do you have a go-to cabinet supplier right now, or does it vary by project?"
Q2: "What's been your biggest headache with cabinets on past jobs?"
Q3: "Timelines and communication tend to be pain points for a lot of builders — has that been an issue for you?"
Q4: "What kind of projects are you working on right now?"

STEP 4 — PRESENTING YOUR VALUE (tailor to pain points)
- Delays/missed deadlines → "We built our reputation on reliability. We set clear timelines, communicate proactively, and show up when we say we will."
- Design issues/limited selections → "We provide full 3D renderings before install so everyone's aligned before a single cabinet goes in."
- Cost/budget pressure → "We're competitive on price, but where we really stand out is service and reliability. Most builders find that avoiding delays and rework more than makes up the difference."
- Communication problems → "We're big on being responsive. You'll always have a direct point of contact, and we flag potential issues early."

STEP 5 — CALL TO ACTION
Option A: "I'd love to get together, show you some of our work, and talk through how we could support your next project. What does your schedule look like this week or next?"
Option B: "Could we schedule a quick walk-through of one of your current builds so I can get familiar with your needs and put together a sample quote?"
Option C: "What would be the easiest project to start with so we can show you how we work?"

STEP 6 — HANDLING OBJECTIONS
"We already have a cabinet supplier." → "Totally understand — most builders we work with had someone else when we first connected. Would you be open to letting us quote one project so you can see how we compare? No pressure."
"We're too busy right now." → "No worries at all — I know how it goes. Can I send you some info and follow back up in a couple of weeks?"
"We're happy with who we're using." → "That's great to hear. I'd still love to be a backup option — would it be okay if I sent over a quick intro so you have our info on hand?"

STEP 7 — CLOSING
Thank them, restate next step clearly and briefly.

STEP 8 — AFTER THE CALL
Log notes, send thank-you within the hour, add to CRM, set follow-up reminder.
`;

const SCENARIOS = [
  {
    id: "cold",
    label: "Cold Call",
    icon: "📞",
    desc: "Reach a builder for the first time. Nail your opener and earn a next step.",
    builderPersona: "Mike Harrington, owner of a mid-size custom home builder. Does 12-15 custom homes/year. Has used the same cabinet supplier for 3 years but has had recurring delivery delays. Mildly skeptical of cold calls but will engage if the rep is professional. Won't volunteer his pain points — you have to ask.",
  },
  {
    id: "objection",
    label: "Objection Handling",
    icon: "🛡️",
    desc: "Builder says they already have a supplier. Can you open the door anyway?",
    builderPersona: "Sandra Kwon, production builder doing spec homes. Very loyal to her current supplier, slightly annoyed at the interruption. She WILL say 'we already have a supplier' early. She has occasional lead time issues but won't mention them unless pressed.",
  },
  {
    id: "closing",
    label: "Closing for a Meeting",
    icon: "🤝",
    desc: "Builder is interested but noncommittal. Push for a concrete next step.",
    builderPersona: "Dave Torres, remodeling contractor doing high-end kitchen renovations. Somewhat interested but very busy. His default is 'sounds good, send me something.' You need to get a specific time pinned down before he hangs up.",
  },
  {
    id: "full",
    label: "Full Call Simulation",
    icon: "🎯",
    desc: "Complete call from cold open to close. Everything is in play.",
    builderPersona: "Jeff Calabrese, owner of a growing custom home builder doing 20-25 homes/year. Open to new suppliers but guarded. Will throw at least one objection. Warms up with good discovery questions. Has pain points around communication and design clarity — but won't offer them without good questions.",
  },
];

const SYSTEM_BUILDER = (persona, scenario) => `
You are roleplaying as a builder receiving a cold sales call from Hill Country Cabinets.

YOUR PERSONA: ${persona}

SCENARIO: ${scenario.label} — ${scenario.desc}

RULES:
- Stay in character at all times. Never break character.
- Keep responses SHORT — 1-3 sentences, like a real phone call.
- Be realistic: not a pushover, not impossible. React authentically.
- Warm up slightly if the rep asks good discovery questions or handles objections well.
- Stay guarded if they pitch too early, skip steps, or sound pushy.
- Do NOT volunteer pain points — make the rep ask for them.
- When the call clearly ends (meeting set, politely rejected, or goodbye said), end your response with: [CALL_ENDED]
- Never say you are an AI or that this is a simulation.
`;

const SYSTEM_COACH = `
You are an expert sales coach for Hill Country Cabinets, a custom cabinet company selling to builders.

Evaluate the call transcript against the Hill Country Cabinets call script below and return ONLY valid JSON (no markdown, no backticks, no preamble).

Return this exact structure:
{
  "overallScore": <number 0-100>,
  "grade": <"A" | "B" | "C" | "D" | "F">,
  "summary": "<2-3 sentence overall assessment>",
  "categories": [
    { "name": "Opener & Intro", "score": <0-100>, "feedback": "<specific feedback>" },
    { "name": "Discovery Questions", "score": <0-100>, "feedback": "<specific feedback>" },
    { "name": "Value Pitch", "score": <0-100>, "feedback": "<specific feedback>" },
    { "name": "Objection Handling", "score": <0-100>, "feedback": "<specific feedback>" },
    { "name": "Call to Action & Close", "score": <0-100>, "feedback": "<specific feedback>" }
  ],
  "topStrength": "<one specific thing they did well, quoting the transcript>",
  "topImprovement": "<one thing to fix with the exact scripted language they should have used>",
  "missedOpportunities": ["<missed opportunity 1>", "<missed opportunity 2>"]
}
`;

async function callClaude(messages, systemPrompt, isJson = false) {
  const response = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: systemPrompt,
      messages,
      max_tokens: isJson ? 2000 : 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Request failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

  const text = data.content?.map(b => b.text || "").join("") || "";

  if (isJson) {
    const clean = text.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(clean);
    } catch (e) {
      throw new Error(`Could not parse score response. Raw: ${text.slice(0, 200)}`);
    }
  }
  return text;
}

const C = {
  bg: "#ffffff", bgSoft: "#fff5f5", bgCard: "#ffffff",
  border: "#f5c6c6", borderStrong: "#e88888",
  red: "#8b1a1a", redMid: "#b02020", redLight: "#c0392b",
  redPale: "#fdeaea", redPaleMid: "#f9d0d0",
  textDark: "#3a0a0a", textMid: "#7a2020", textMuted: "#a05050", textFaint: "#c08080",
  white: "#ffffff", bubbleRep: "#8b1a1a", bubbleBuilder: "#fff0f0", bubbleBuilderText: "#3a0a0a",
};

function ScoreCard({ result, onRestart }) {
  const gradeColor = { A: "#22c55e", B: "#84cc16", C: "#eab308", D: "#f97316", F: "#c0392b" }[result.grade] || "#7a2020";
  return (
    <div style={{ padding: "0 0 40px 0", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "32px 24px 24px", background: `linear-gradient(135deg, ${C.red} 0%, #5a0d0d 100%)`, borderRadius: 16, marginBottom: 24, color: C.white }}>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#f5c6c6", marginBottom: 4 }}>Hill Country Cabinets</div>
        <div style={{ fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#e8a0a0", marginBottom: 12 }}>Call Scorecard</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: gradeColor, lineHeight: 1 }}>{result.grade}</div>
          <div>
            <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1, color: C.white }}>{result.overallScore}</div>
            <div style={{ fontSize: 13, color: "#f5c6c6" }}>out of 100</div>
          </div>
        </div>
        <p style={{ fontSize: 15, color: "#fce4e4", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>{result.summary}</p>
      </div>

      <div style={{ background: C.bgCard, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16 }}>
        {result.categories.map((cat, i) => (
          <div key={i} style={{ padding: "16px 20px", borderBottom: i < result.categories.length - 1 ? `1px solid ${C.bgSoft}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.textDark }}>{cat.name}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: cat.score >= 80 ? "#22c55e" : cat.score >= 60 ? "#eab308" : C.redLight }}>{cat.score}</span>
            </div>
            <div style={{ height: 6, background: C.bgSoft, borderRadius: 3, marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${cat.score}%`, background: cat.score >= 80 ? "#22c55e" : cat.score >= 60 ? "#eab308" : C.redLight, borderRadius: 3 }} />
            </div>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{cat.feedback}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>✓ Top Strength</div>
          <p style={{ fontSize: 13, color: "#166534", margin: 0, lineHeight: 1.5 }}>{result.topStrength}</p>
        </div>
        <div style={{ background: C.redPale, border: `1px solid ${C.redPaleMid}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.redLight, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>↑ Top Fix</div>
          <p style={{ fontSize: 13, color: C.redMid, margin: 0, lineHeight: 1.5 }}>{result.topImprovement}</p>
        </div>
      </div>

      {result.missedOpportunities?.length > 0 && (
        <div style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Missed Opportunities</div>
          {result.missedOpportunities.map((opp, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: C.textFaint, fontSize: 13 }}>•</span>
              <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>{opp}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={onRestart} style={{ width: "100%", padding: "14px", background: C.red, color: C.white, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
        Try Another Scenario
      </button>
    </div>
  );
}

export default function CallCoach() {
  const [screen, setScreen] = useState("home");
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [hint, setHint] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startScenario = async (s) => {
    setScenario(s);
    setMessages([]);
    setCallEnded(false);
    setScoreResult(null);
    setHint(null);
    setError(null);
    setScreen("call");
    setLoading(true);
    try {
      const opening = await callClaude(
        [{ role: "user", content: "The rep is calling you. Answer the phone naturally as your character would." }],
        SYSTEM_BUILDER(s.builderPersona, s)
      );
      setMessages([{ role: "assistant", content: opening.replace("[CALL_ENDED]", "").trim() }]);
    } catch (e) {
      setError(e.message);
      setMessages([{ role: "assistant", content: "Hello?" }]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || callEnded) return;
    const userMsg = input.trim();
    setInput("");
    setHint(null);
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const reply = await callClaude(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        SYSTEM_BUILDER(scenario.builderPersona, scenario)
      );
      const ended = reply.includes("[CALL_ENDED]");
      setMessages(prev => [...prev, { role: "assistant", content: reply.replace("[CALL_ENDED]", "").trim() }]);
      if (ended) setCallEnded(true);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I missed that — can you say that again?" }]);
    }
    setLoading(false);
  };

  const getHint = async () => {
    if (loading || messages.length < 2) return;
    setLoading(true);
    try {
      const transcript = messages.map(m => `${m.role === "user" ? "Rep" : "Builder"}: ${m.content}`).join("\n");
      const h = await callClaude(
        [{ role: "user", content: `HCC Script:\n${SOP}\n\nTranscript:\n${transcript}\n\nGive the rep ONE specific tip for their next response referencing the HCC script. One sentence, no preamble.` }],
        "You are a sales coach for Hill Country Cabinets. Give one short actionable tip."
      );
      setHint(h);
      setShowHint(true);
    } catch (e) {}
    setLoading(false);
  };

  const scoreCall = async () => {
    setScreen("scoring");
    const transcript = messages.map(m => `${m.role === "user" ? "REP" : "BUILDER"}: ${m.content}`).join("\n\n");
    try {
      const result = await callClaude(
        [{ role: "user", content: `Scenario: ${scenario.label} — ${scenario.desc}\n\nCall Transcript:\n${transcript}` }],
        SYSTEM_COACH + "\n\nHill Country Cabinets Script & SOP:\n" + SOP,
        true
      );
      setScoreResult(result);
      setScreen("results");
    } catch (e) {
      setScreen("call");
      alert("Scoring failed — " + (e.message || "please try again."));
    }
  };

  const builderName = { cold: "MIKE", objection: "SANDRA", closing: "DAVE", full: "JEFF" }[scenario?.id] || "BUILDER";

  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.redPale, border: `1px solid ${C.border}`, borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
            <span style={{ fontSize: 12 }}>🏗️</span>
            <span style={{ fontSize: 12, color: C.redMid, letterSpacing: 1, textTransform: "uppercase" }}>Hill Country Cabinets</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: C.red, margin: "0 0 12px", letterSpacing: -1, lineHeight: 1.1 }}>Builder Call Coach</h1>
          <p style={{ fontSize: 16, color: C.textMuted, margin: 0 }}>Practice your builder outreach with an AI that fights back.</p>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => startScenario(s)}
              style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, box-shadow 0.15s", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 3px rgba(139,26,26,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.redMid; e.currentTarget.style.boxShadow = "0 4px 12px rgba(139,26,26,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 3px rgba(139,26,26,0.06)"; }}
            >
              <div style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.red, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.4 }}>{s.desc}</div>
              </div>
              <div style={{ color: C.textFaint, fontSize: 18 }}>→</div>
            </button>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: C.textFaint, marginTop: 32 }}>
          Scored against the HCC Builder Outreach Call Script · Powered by Claude
        </p>
      </div>
    </div>
  );

  if (screen === "scoring") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16, display: "inline-block", animation: "spin 1.5s linear infinite" }}>⚡</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: C.red }}>Analyzing your call...</div>
        <div style={{ fontSize: 14, color: C.textMuted }}>Scoring against the HCC call script</div>
      </div>
    </div>
  );

  if (screen === "results") return (
    <div style={{ minHeight: "100vh", background: C.bgSoft, fontFamily: "'Inter', -apple-system, sans-serif", padding: "24px 20px" }}>
      {scoreResult && <ScoreCard result={scoreResult} onRestart={() => setScreen("home")} />}
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bgSoft, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ padding: "12px 16px", background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{scenario?.label}</div>
          <div style={{ fontSize: 11, color: C.textFaint }}>{callEnded ? "Call ended" : "Live call"}</div>
        </div>
        {callEnded ? (
          <button onClick={scoreCall} style={{ background: C.red, color: C.white, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Score My Call →
          </button>
        ) : (
          <button onClick={getHint} disabled={loading || messages.length < 2}
            style={{ background: C.redPale, color: C.redMid, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: messages.length >= 2 ? "pointer" : "not-allowed", opacity: messages.length < 2 ? 0.5 : 1 }}>
            💡 Hint
          </button>
        )}
      </div>

      {showHint && hint && (
        <div style={{ background: "#fff8e1", borderBottom: "1px solid #fde68a", padding: "10px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 13 }}>💡</span>
          <span style={{ fontSize: 13, color: "#92400e", flex: 1, lineHeight: 1.4 }}>{hint}</span>
          <button onClick={() => setShowHint(false)} style={{ background: "none", border: "none", color: "#b45309", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "10px 16px", fontSize: 13, color: "#b91c1c" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && <div style={{ textAlign: "center", color: C.textFaint, fontSize: 14, marginTop: 40 }}>Connecting...</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%", background: m.role === "user" ? C.bubbleRep : C.bubbleBuilder,
              color: m.role === "user" ? C.white : C.bubbleBuilderText,
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "11px 15px", fontSize: 14, lineHeight: 1.5,
              border: m.role === "user" ? "none" : `1px solid ${C.border}`,
            }}>
              {m.role === "assistant" && <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 4, fontWeight: 700, letterSpacing: 0.5 }}>{builderName}</div>}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: C.bubbleBuilder, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, background: C.textFaint, borderRadius: "50%", animation: `bounce 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        {callEnded && !loading && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ display: "inline-block", background: C.white, border: `1px solid ${C.border}`, borderRadius: 100, padding: "8px 20px", fontSize: 13, color: C.textMuted }}>
              📵 Call ended — ready to see your score?
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!callEnded && (
        <div style={{ padding: "12px 16px", background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type what you'd say on the call..."
              disabled={loading}
              rows={1}
              style={{ flex: 1, background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 12, color: C.textDark, fontSize: 14, padding: "10px 14px", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100, minHeight: 44 }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ background: input.trim() && !loading ? C.red : C.border, border: "none", borderRadius: 10, color: C.white, padding: "10px 16px", cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 16, transition: "background 0.15s", flexShrink: 0, height: 44 }}>
              ↑
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.textFaint, textAlign: "center", marginTop: 8 }}>Enter to send · Shift+Enter for new line</div>
        </div>
      )}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
