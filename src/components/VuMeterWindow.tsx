import { useState, useRef, useCallback } from "react";
import { VuMeter } from "./VuMeter";

interface Props {
  meterLevel: number;
  isPlaying: boolean;
  minimized: boolean;
  onMinimize: () => void;
  zIndex: number;
  onFocus: () => void;
}

export function VuMeterWindow({
  meterLevel,
  isPlaying,
  minimized,
  onMinimize,
  zIndex,
  onFocus,
}: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos],
  );

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (minimized) return null;

  return (
    <div
      className="window"
      onPointerDown={onFocus}
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex,
        width: 240,
      }}
    >
      <div
        className="title-bar"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        style={{ cursor: "grab", touchAction: "none" }}
      >
        <div className="title-bar-text">VU Meter</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} />
          <button aria-label="Close" onClick={onMinimize} />
        </div>
      </div>
      <div style={styles.body}>
        <VuMeter level={isPlaying ? meterLevel : 0} label="L" />
        <VuMeter
          level={isPlaying ? meterLevel * (0.88 + Math.random() * 0.12) : 0}
          label="R"
        />
        <div style={styles.statusRow}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isPlaying ? "#40c040" : "#3a3a2a",
              boxShadow: isPlaying ? "0 0 4px #40c040" : "none",
              animation: isPlaying ? "blink-led 1.5s infinite" : "none",
            }}
          />
          <span style={styles.statusText}>
            {isPlaying ? "SIGNAL" : "NO SIGNAL"}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    padding: 6,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    background: "#1a1a10",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 4px",
  },
  statusText: {
    fontSize: 8,
    fontFamily: "var(--font-dot)",
    color: "#40c040",
    opacity: 0.7,
  },
};
