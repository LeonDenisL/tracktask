import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Timer from "./Timer";
import axios from "axios";

const TaskBoard = ({ tasks, setTasks }) => {
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("normal");
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If there's no destination, do nothing
    if (!destination) return;

    // If the item was dropped in the same place, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle reordering within the same column
    if (destination.droppableId === source.droppableId) {
      const newTaskOrder = Array.from(
        tasks.filter((task) => task.status === source.droppableId)
      );
      const [movedTask] = newTaskOrder.splice(source.index, 1);
      newTaskOrder.splice(destination.index, 0, movedTask);

      // Update tasks state with the new order
      const updatedTasks = tasks.map((task) => {
        if (task.status === source.droppableId) {
          return newTaskOrder.find((t) => t._id === task._id) || task;
        }
        return task;
      });

      setTasks(updatedTasks);
    }
  };

  const moveToInProgress = async (taskId) => {
    try {
      const startTime = new Date().toISOString();
      await axios.put(`http://localhost:5002/tasks/${taskId}`, {
        status: "in-progress",
        startTime: startTime,
        pausedTime: null,
        executionTime: 0,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                status: "in-progress",
                startTime: startTime,
                pausedTime: null,
                executionTime: 0,
              }
            : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const completeTask = async (taskId, timeSpent) => {
    try {
      await axios.put(`http://localhost:5002/tasks/${taskId}`, {
        status: "completed",
        executionTime: timeSpent,
        completedAt: new Date().toISOString(),
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                status: "completed",
                executionTime: timeSpent,
                completedAt: new Date(),
              }
            : task
        )
      );
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const pauseTask = async (taskId, timeSpent) => {
    try {
      const pausedTime = new Date().toISOString();
      await axios.put(`http://localhost:5002/tasks/${taskId}`, {
        pausedTime: pausedTime,
        executionTime: timeSpent,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? { ...task, pausedTime: pausedTime, executionTime: timeSpent }
            : task
        )
      );
    } catch (error) {
      console.error("Error pausing task:", error);
    }
  };

  const resumeTask = async (taskId, timeSpent) => {
    try {
      const resumedTime = new Date().toISOString();
      await axios.put(`http://localhost:5002/tasks/${taskId}`, {
        pausedTime: null,
        startTime: resumedTime,
        executionTime: timeSpent,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                pausedTime: null,
                startTime: resumedTime,
                executionTime: timeSpent,
              }
            : task
        )
      );
    } catch (error) {
      console.error("Error resuming task:", error);
    }
  };

  const startEditing = (task) => {
    setEditTaskId(task._id);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description);
    setEditTaskPriority(task.priority);
  };

  const saveEdit = async (taskId) => {
    try {
      await axios.put(`http://localhost:5002/tasks/${taskId}`, {
        title: editTaskTitle,
        description: editTaskDescription,
        priority: editTaskPriority,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                title: editTaskTitle,
                description: editTaskDescription,
                priority: editTaskPriority,
              }
            : task
        )
      );
      setEditTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const cancelEdit = () => {
    setEditTaskId(null);
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5002/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      setDeleteTaskId(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const confirmDelete = (taskId) => {
    setDeleteTaskId(taskId);
  };

  const cancelDelete = () => {
    setDeleteTaskId(null);
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

  const getColumnClass = (tasks, status) => {
    return tasks.filter((task) => task.status === status).length === 0
      ? "task-column empty"
      : "task-column";
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "task-card-urgent";
      case "high":
        return "task-card-high";
      case "normal":
        return "task-card-normal";
      case "low":
        return "task-card-low";
      default:
        return "";
    }
  };

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="task-columns">
          <Droppable droppableId="pending">
            {(provided) => (
              <div
                className={getColumnClass(tasks, "pending")}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <h2>Novas</h2>
                {tasks
                  .filter((task) => task.status === "pending")
                  .map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {editTaskId === task._id ? (
                            <div
                              className={`task-card ${getPriorityClass(
                                editTaskPriority
                              )}`}
                            >
                              <input
                                type="text"
                                value={editTaskTitle}
                                onChange={(e) =>
                                  setEditTaskTitle(e.target.value)
                                }
                              />
                              <input
                                type="text"
                                value={editTaskDescription}
                                onChange={(e) =>
                                  setEditTaskDescription(e.target.value)
                                }
                              />
                              <select
                                value={editTaskPriority}
                                onChange={(e) =>
                                  setEditTaskPriority(e.target.value)
                                }
                              >
                                <option value="urgent">Urgente</option>
                                <option value="high">Alta</option>
                                <option value="normal">Normal</option>
                                <option value="low">Baixa</option>
                              </select>
                              <button onClick={() => saveEdit(task._id)}>
                                Salvar
                              </button>
                              <button onClick={cancelEdit}>Cancelar</button>
                            </div>
                          ) : (
                            <div
                              className={`task-card ${getPriorityClass(
                                task.priority
                              )}`}
                            >
                              <div className="task-card-header">
                                <h3>{task.title}</h3>
                                <div>
                                  <i
                                    className="fas fa-edit"
                                    onClick={() => startEditing(task)}
                                  ></i>
                                  <i
                                    className="fas fa-trash"
                                    onClick={() => confirmDelete(task._id)}
                                  ></i>
                                </div>
                              </div>
                              <p>{task.description}</p>
                              <button
                                onClick={() => moveToInProgress(task._id)}
                              >
                                Iniciar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="in-progress">
            {(provided) => (
              <div
                className={getColumnClass(tasks, "in-progress")}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <h2>Em Execução</h2>
                {tasks
                  .filter((task) => task.status === "in-progress")
                  .map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div
                            className={`task-card ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <Timer
                              taskId={task._id}
                              startTime={task.startTime}
                              pausedTime={task.pausedTime}
                              executionTime={task.executionTime}
                              onComplete={completeTask}
                              onPause={pauseTask}
                              onResume={resumeTask}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="completed">
            {(provided) => (
              <div
                className={getColumnClass(tasks, "completed")}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <h2>Concluídas</h2>
                {tasks
                  .filter((task) => {
                    const taskDate = new Date(
                      task.completedAt
                    ).toLocaleDateString();
                    const today = new Date().toLocaleDateString();
                    return task.status === "completed" && taskDate === today;
                  })
                  .map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div
                            className={`task-card ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <p>Tempo total: {formatTime(task.executionTime)}</p>
                            <p>
                              Concluída em:{" "}
                              {new Date(task.completedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {deleteTaskId && (
        <div className="confirmation-dialog">
          <p>Tem certeza que deseja deletar esta tarefa?</p>
          <button onClick={() => deleteTask(deleteTaskId)}>Sim</button>
          <button onClick={cancelDelete}>Não</button>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
