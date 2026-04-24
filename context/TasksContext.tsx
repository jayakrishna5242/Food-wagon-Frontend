import React, { createContext, useEffect, useState, useContext } from "react";
import { useAuth } from "./AuthContext";
import { Task } from "../types";
import { fetchTasks, fetchTaskById, createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask } from "../services/api";

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  task: Partial<Task>;
  getTask: (taskId: string) => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  priority: string;
  setPriority: (priority: string) => void;
  handleInput: (name: string) => (e: any) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  openModalForAdd: () => void;
  openModalForEdit: (task: Task) => void;
  activeTask: Task | null;
  closeModal: () => void;
  modalMode: string;
  openProfileModal: () => void;
  activeTasks: Task[];
  completedTasks: Task[];
  profileModal: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<Partial<Task>>({});

  const [isEditing, setIsEditing] = useState(false);
  const [priority, setPriority] = useState("all");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState("");
  const [profileModal, setProfileModal] = useState(false);

  const openModalForAdd = () => {
    setModalMode("add");
    setIsEditing(true);
    setTask({});
  };

  const openModalForEdit = (task: Task) => {
    setModalMode("edit");
    setIsEditing(true);
    setActiveTask(task);
  };

  const openProfileModal = () => {
    setProfileModal(true);
  };

  const closeModal = () => {
    setIsEditing(false);
    setProfileModal(false);
    setModalMode("");
    setActiveTask(null);
    setTask({});
  };

  // get tasks
  const getTasks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data || []);
    } catch (err) {
      console.log("Error getting tasks", err);
    }
    setLoading(false);
  };

  // get task
  const getTask = async (taskId: string) => {
    setLoading(true);
    try {
      const data = await fetchTaskById(taskId);
      if (data) setTask(data);
    } catch (err) {
      console.log("Error getting task", err);
    }
    setLoading(false);
  };

  const createTask = async (taskData: Partial<Task>) => {
    setLoading(true);
    try {
      const data = await apiCreateTask(taskData);
      setTasks([...tasks, data]);
      console.log("Task created successfully");
    } catch (err) {
      console.log("Error creating task", err);
      console.error("Failed to create task");
    }
    setLoading(false);
  };

  const updateTask = async (taskData: Task) => {
    setLoading(true);
    try {
      const data = await apiUpdateTask(taskData._id, taskData);
      const newTasks = tasks.map((tsk) => {
        return tsk._id === data._id ? data : tsk;
      });
      console.log("Task updated successfully");
      setTasks(newTasks);
    } catch (err) {
      console.log("Error updating task", err);
      console.error("Failed to update task");
    }
    setLoading(false);
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    try {
      await apiDeleteTask(taskId);
      const newTasks = tasks.filter((tsk) => tsk._id !== taskId);
      setTasks(newTasks);
      console.log("Task deleted successfully");
    } catch (err) {
      console.log("Error deleting task", err);
      console.error("Failed to delete task");
    }
    setLoading(false);
  };

  const handleInput = (name: string) => (e: any) => {
    if (name === "setTask") {
      setTask(e);
    } else {
      setTask({ ...task, [name]: e.target.value });
    }
  };

  // get completed tasks
  const completedTasks = tasks.filter((task) => task.completed);

  // get pending tasks
  const activeTasks = tasks.filter((task) => !task.completed);

  useEffect(() => {
    if (userId) {
      getTasks();
    }
  }, [userId]);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        task,
        getTask,
        createTask,
        updateTask,
        deleteTask,
        priority,
        setPriority,
        handleInput,
        isEditing,
        setIsEditing,
        openModalForAdd,
        openModalForEdit,
        activeTask,
        closeModal,
        modalMode,
        openProfileModal,
        activeTasks,
        completedTasks,
        profileModal,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
