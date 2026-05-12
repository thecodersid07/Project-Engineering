import { useState, useEffect } from 'react';

const TaskStats = ({ refreshTrigger }) => {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('http://localhost:5000/api/tasks')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch stats');
        }
        return res.json();
      })
      .then(data => {
        if (!isMounted) {
          return;
        }
        const tasks = data.tasks || [];
        setStats({
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status === 'pending').length
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats");
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  if (loading) return <div>Loading Stats...</div>;

  return (
    <div className="stats-grid">
      <div className="stat-box">
        <h3>Total Tasks</h3>
        <h2>{stats.total}</h2>
      </div>
      <div className="stat-box">
        <h3>Completed</h3>
        <h2>{stats.completed}</h2>
      </div>
      <div className="stat-box">
        <h3>Pending</h3>
        <h2>{stats.pending}</h2>
      </div>
    </div>
  );
};

export default TaskStats;
