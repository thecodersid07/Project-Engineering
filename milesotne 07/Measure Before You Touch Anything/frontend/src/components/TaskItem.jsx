const TaskItem = ({ task, onToggleStatus, onDelete }) => {
  return (
    <div className="task-item">
      <div>
        <h4 style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
          {task.title}
        </h4>
        <p>{task.description}</p>
        <small>Status: {task.status}</small>
      </div>
      <div className="task-actions">
        <button className="btn" onClick={() => onToggleStatus(task)}>
          {task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
        </button>
        
        <button className="btn btn-danger" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
