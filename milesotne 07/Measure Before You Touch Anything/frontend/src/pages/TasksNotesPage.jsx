import { useState, useEffect, useRef } from 'react';
import TaskList from '../components/TaskList';

const TasksNotesPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [lastAction, setLastAction] = useState('None');
  const [isAdding, setIsAdding] = useState(false);
  const tasksRef = useRef(tasks);
  const addInFlightRef = useRef(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks');
      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      console.error(err);
      setLastAction('Failed to load tasks');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || addInFlightRef.current) {
      return;
    }
    
    try {
      addInFlightRef.current = true;
      setIsAdding(true);
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to add task');
      }
      const data = await res.json();

      setTasks(currentTasks => [data, ...currentTasks]);
      setNewTaskTitle('');

      setLastAction('Added task');
    } catch (err) {
      console.error(err);
      setLastAction(err.message);
    } finally {
      addInFlightRef.current = false;
      setIsAdding(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update task');
      }
      const updatedTask = await res.json();
      setTasks(currentTasks =>
        currentTasks.map(currentTask =>
          currentTask._id === updatedTask._id ? updatedTask : currentTask
        )
      );
      setLastAction('Updated task');
    } catch (err) {
      console.error(err);
      setLastAction(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!id || typeof id !== 'string') {
        console.warn("Invalid ID provided for delete");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete task');
      }
      setTasks(currentTasks => currentTasks.filter(task => task._id !== id));
      setLastAction('Deleted task');
    } catch (err) {
      console.error(err);
      setLastAction(err.message);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      console.log("Auto-log: Current task count is", tasksRef.current.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h2>Tasks & Notes Management</h2>
      <p>Last Action: {lastAction}</p>

      <div className="card">
        <h3>Add New Task</h3>
        <form onSubmit={handleAddTask}>
          <input 
            type="text" 
            placeholder="Task Title" 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
          />
          <button type="submit" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>

      <TaskList 
        tasks={tasks} 
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default TasksNotesPage;
