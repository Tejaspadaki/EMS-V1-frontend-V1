import React, { useEffect, useState } from 'react';
import { getMyTasks, updateTaskStatus, type ProjectTask, type TaskStatus } from '../../api/projects.api';
import { Clock, AlertTriangle, CheckCircle, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('opacity-50');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('opacity-50');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== status) {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status } : t));
      try {
        await updateTaskStatus(task.projectId, draggedTaskId, status);
      } catch (err) {
        // Revert on failure
        loadTasks();
      }
    }
    setDraggedTaskId(null);
  };

  const isOverdue = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'High' || priority === 'URGENT') return 'bg-red-100 text-red-700';
    if (priority === 'Medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">My Tasks</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your personal tasks across all active projects.</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold mb-1">All caught up!</h3>
            <p>You have no assigned tasks at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div 
                key={col}
                className="flex-1 min-w-[300px] bg-gray-50/80 rounded-xl border border-[var(--color-border)] flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col)}
              >
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-white/50 rounded-t-xl">
                  <h4 className="font-bold text-[var(--color-text-primary)]">{col}</h4>
                  <span className="text-xs font-bold bg-white text-gray-500 px-2.5 py-1 rounded-full shadow-sm border border-gray-100">
                    {colTasks.length}
                  </span>
                </div>
                
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {colTasks.map(task => {
                    const overdue = task.status !== 'Done' && isOverdue(task.deadline);
                    return (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white p-4 rounded-xl shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow
                          ${overdue ? 'border-l-4 border-l-[#C62828] border-y-[var(--color-border)] border-r-[var(--color-border)]' : 'border-[var(--color-border)]'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {overdue && <span title="Overdue"><AlertTriangle size={16} className="text-[#C62828]" /></span>}
                        </div>
                        
                        <h5 className="font-bold text-[var(--color-text-primary)] mb-4 leading-snug">
                          {task.title}
                        </h5>
                        
                        <div className="flex flex-col gap-3 mt-auto pt-3 border-t border-gray-100">
                          <Link to={`/projects/${task.projectId}`} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                            <FolderKanban size={14} />
                            {task.projectName}
                          </Link>
                          
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock size={14} className={overdue ? 'text-[#C62828]' : ''} />
                            <span className={overdue ? 'text-[#C62828] font-bold' : ''}>{new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
