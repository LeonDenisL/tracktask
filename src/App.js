import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import TaskBoard from "./components/TaskBoard";
import CompletedTasks from "./components/CompletedTasks";
import axios from "axios";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5002/tasks");
        console.log(response.data); // Verificar os dados recebidos
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    try {
      const response = await axios.post("http://localhost:5002/tasks", {
        title: newTaskTitle,
        description: newTaskDescription,
        status: "pending",
      });
      setTasks([...tasks, response.data]);
      setNewTaskTitle("");
      setNewTaskDescription("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <Router>
      <Navbar />
      <div className="App">
        <h1>Gestão de Tarefas</h1>
        <div className="new-task-form">
          <input
            type="text"
            placeholder="Título da nova tarefa"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Descrição da nova tarefa"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <button onClick={addTask}>Adicionar Tarefa</button>
        </div>
        <Routes>
          <Route
            path="/"
            element={<TaskBoard tasks={tasks} setTasks={setTasks} />}
          />
          <Route path="/completed" element={<CompletedTasks />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
