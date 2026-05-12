import TaskItem from './TaskItem';

const TaskList = ({ tasks, onToggleStatus, onDelete }) => {
  return (
    <div className="card">
      <h3>Your Tasks</h3>
      
      {tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map(task => (
            <TaskItem 
              key={task._id} 
              task={task} 
              onToggleStatus={onToggleStatus} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
};

export default TaskList;
