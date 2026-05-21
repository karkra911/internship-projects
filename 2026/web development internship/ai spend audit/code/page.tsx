"use client";

import { useState } from "react";
import { auditTools } from "../lib/auditEngine";

export default function Home() {
  const [tools, setTools] = useState([
    { name: "chatgpt", plan: "plus", seats: 1, currentSpend: 20 },
  ]);

  const [result, setResult] = useState<any>(null);

  const runAudit = () => {
    const res = auditTools(tools as any);
    setResult(res);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Spend Audit</h1>

      <button onClick={runAudit}>Run Audit</button>

      {result && (
        <div>
          <h2>Total Savings: ${result.totalSavings}</h2>
        </div>
      )}
    </div>
  );
}