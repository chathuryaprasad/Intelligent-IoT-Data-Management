// components/TimeRangePanel.jsx
import React from "react";
import TimeSelector from "./TimeSelector";
import "./TimeRangePanel.css";


/**
 * TimeRangePanel
 * --------------
 * Grafana-style time range panel.
 * - Left: Absolute time range (Start / End) using existing TimeSelector
 * - Right: Relative time range (dropdown)
 * - Bottom: Analyze button + Change time settings link
 *
 * This component is PRESENTATION ONLY.
 * All state (selected times, mode, etc.) will live in Dashboard and be passed as props.
 */
const TimeRangePanel = ({
  timeOptions,
  selectedTimeStart,
  setSelectedTimeStart,
  selectedTimeEnd,
  setSelectedTimeEnd,
  timeMode,
  setTimeMode,
  relativeRange,
  setRelativeRange,
  onAnalyze,
}) => {

 console.log("TimeMode:", timeMode, "RelativeRange:", relativeRange);

  return (
    <div className="time-range-panel">
      {/* Header / Mode toggle */}
      <div className="time-range-header">
        <span className="time-range-title">Select Time Range</span>

        <div className="time-mode-toggle">
          <button
            className={timeMode === "absolute" ? "active" : ""}
            onClick={() => setTimeMode("absolute")}
          >
            Absolute
          </button>
          <button
            className={timeMode === "relative" ? "active" : ""}
            onClick={() => setTimeMode("relative")}
          >
            Relative
          </button>
        </div>
      </div>

      {/* Two-column layout: Absolute (left) / Relative (right) */}
      <div className="time-range-grid">
        {/* Absolute time range (left) */}
        <div className={`absolute-section ${timeMode !== "absolute" ? "disabled" : ""}`}>
          <h4>Absolute time range</h4>

          <TimeSelector
            label="Start"
            timeOptions={timeOptions}
            selectedTime={selectedTimeStart}
            setSelectedTime={setSelectedTimeStart}
            disabled={timeMode !== "absolute"}
          />

          <TimeSelector
            label="End"
            timeOptions={timeOptions}
            selectedTime={selectedTimeEnd}
            setSelectedTime={setSelectedTimeEnd}
            disabled={timeMode !== "absolute"}
          />
        </div>

        {/* Relative time range (right) */}
        <div className={`relative-section ${timeMode !== "relative" ? "disabled" : ""}`}>
          <h4>Relative time range</h4>

          <select
            value={relativeRange}
            onChange={(e) => setRelativeRange(e.target.value)}
            disabled={timeMode !== "relative"}
          >
            <option value="5min">Last 5 minutes</option>
            <option value="15min">Last 15 minutes</option>
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
          </select>
        </div>
      </div>

      {/* Footer: Analyze + Change settings */}
      <div className="time-range-footer">
        <button className="analyze-btn" onClick={onAnalyze}>
          Analyze time range
        </button>

        <button className="settings-btn">
          Time settings
        </button>
      </div>
    </div>
  );
};

export default TimeRangePanel;
