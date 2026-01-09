import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "../styles/GeneratingPage.css";
import { useHeader } from "./HeaderContext";

const messages = [
  "Generating 3 concepts from the survey entry…",
  "Rendering 3D models…",
  "Optimizing materials…",
  "Polishing surfaces…",
  "Setting up lighting…",
  "Finalizing scene…",
];

export default function GeneratingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLeft, setRight } = useHeader();

  // Hide header content on this page for a cleaner splash
  useEffect(() => {
    setLeft(null);
    setRight(null);
    return () => {
      setLeft(null);
      setRight(null);
    };
  }, []);

  // Pick a total duration between 5s and 10s
  const totalDuration = useMemo(() => 5000 + Math.floor(Math.random() * 5000), []);

  // Cycle status message every ~1.2s
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const cycle = setInterval(() => setIdx((i) => (i + 1) % messages.length), 1200);
    return () => clearInterval(cycle);
  }, []);

  // After duration, forward to /concepts preserving state (e.g., from: 'survey')
  useEffect(() => {
    const t = setTimeout(() => {
      navigate("/concepts", { state: location.state, replace: true });
    }, totalDuration);
    return () => clearTimeout(t);
  }, [navigate, location.state, totalDuration]);

  return (
    <div className="generating-page">
      <div className="generating-card" role="alert" aria-live="polite">
        <div className="gp-spinner" aria-hidden="true"></div>
        <div className="gp-text">{messages[idx]}</div>
        <div className="gp-subtext">This usually takes a few seconds…</div>
      </div>
    </div>
  );
}
