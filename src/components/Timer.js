import React, { useState, useEffect, useRef } from "react";

const Timer = ({
  taskId,
  startTime,
  pausedTime,
  executionTime,
  onComplete,
  onPause,
  onResume,
}) => {
  const [time, setTime] = useState(executionTime);
  const intervalRef = useRef(null);
  const [isPaused, setIsPaused] = useState(!!pausedTime);

  useEffect(() => {
    if (startTime && !isPaused) {
      const start = new Date(startTime);
      const now = new Date();
      const initialTime = Math.floor((now - start) / 1000) + executionTime;
      setTime(initialTime);

      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [startTime, isPaused]);

  const handleComplete = () => {
    clearInterval(intervalRef.current);
    onComplete(taskId, time);
  };

  const handlePause = () => {
    clearInterval(intervalRef.current);
    setIsPaused(true);
    onPause(taskId, time);
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume(taskId, time);
    intervalRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  return (
    <div>
      <p>Tempo: {formatTime(time)}</p>
      <button onClick={handleComplete}>
        <i className="fas fa-check"></i> Completar
      </button>
      {isPaused ? (
        <button onClick={handleResume}>
          <i className="fas fa-play"></i> Retomar
        </button>
      ) : (
        <button onClick={handlePause}>
          <i className="fas fa-pause"></i> Pausar
        </button>
      )}
    </div>
  );
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
};

export default Timer;
