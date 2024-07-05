import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";

const CompletedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().tz("America/Sao_Paulo").format("YYYY-MM-DD")
  );

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5002/tasks");
        setTasks(response.data.filter((task) => task.status === "completed"));
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchCompletedTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const taskDate = moment(task.completedAt)
      .tz("America/Sao_Paulo")
      .format("YYYY-MM-DD");
    return taskDate === selectedDate;
  });

  return (
    <div>
      <h2>Tarefas Concluídas</h2>
      <label>
        Selecione a Data:
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </label>
      <div className="completed-task-grid">
        {filteredTasks.map((task) => (
          <div key={task._id} className="task-card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Tempo total: {formatTime(task.executionTime)}</p>
            <p>
              Concluída em:{" "}
              {moment(task.completedAt)
                .tz("America/Sao_Paulo")
                .format("DD/MM/YYYY HH:mm:ss")}
            </p>
          </div>
        ))}
      </div>
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

export default CompletedTasks;
