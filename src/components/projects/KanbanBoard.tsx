import React, { useState, useEffect } from 'react';
import { 
  getBoardColumns, 
  createBoardColumn, 
  updateBoardColumn, 
  deleteBoardColumn, 
  type BoardColumn 
} from '../../api/boards.api';
import { 
  type ProjectTask, 
  updateTaskColumn, 
  deleteTask, 
  updateTaskAssignee 
} from '../../api/projects.api';
import { Clock, AlertTriangle, Trash2, Settings, Plus, ArrowUp, ArrowDown, ShieldAlert, Filter } from 'lucide-react';
import { createMessage } from '../../api/messaging.api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../utils/toast';
import { getInitials } from '../../utils/initials';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TaskDetailsDrawer } from './TaskDetailsDrawer';

interface KanbanBoardProps {
  projectId: string;
  tasks: ProjectTask[];
  onTaskUpdated: () => void;
  readOnly?: boolean;
  channelId?: string;
  projectMembers: { id: string; name: string }[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  projectId, 
  tasks, 
  onTaskUpdated, 
  readOnly = false, 
  channelId,
  projectMembers
}) => {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Drawer States
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Quick Filters States
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Configuration Modal States
  const [configModal, setConfigModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColWip, setNewColWip] = useState<number | ''>('');

  const loadColumns = async () => {
    try {
      const cols = await getBoardColumns(projectId);
      setColumns(cols);
    } catch (err) {
      console.error('Failed to load columns', err);
    }
  };

  useEffect(() => {
    loadColumns();
  }, [projectId]);

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task.');
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (readOnly) {
      e.preventDefault();
      return;
    }
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (readOnly || !draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId) as any;
    const targetCol = columns.find(c => c.id === targetColumnId);

    if (task && task.columnId !== targetColumnId && targetCol) {
      const oldColumnName = task.status || 'Previous Column';
      
      try {
        // Update task column
        const updateRes = await updateTaskColumn(draggedTaskId, targetColumnId);
        
        // Show WIP alert if exceeded
        if (updateRes.data?.wipExceeded) {
          toast.warning(`⚠️ Work In Progress (WIP) limit exceeded for column "${targetCol.name}"!`);
        } else {
          toast.success(`Task moved to "${targetCol.name}"`);
        }

        // Auto notification in chat
        if (channelId) {
          const shouldNotify = window.confirm(`Notify the project channel that task "${task.title}" has been moved to "${targetCol.name}"?`);
          if (shouldNotify) {
            const accomplishments = window.prompt(`accomplished notes: (optional)`) || '';
            const userName = useAuthStore.getState().user?.name || 'Someone';
            let messageContent = `📢 **${userName}** moved task **"${task.title}"** from **${oldColumnName}** to **${targetCol.name}**`;
            if (accomplishments.trim()) {
              messageContent += `\n\n📝 **Details:** ${accomplishments.trim()}`;
            }
            await createMessage(channelId, messageContent);
          }
        }
        
        onTaskUpdated();
      } catch (err) {
        console.error(err);
        toast.error('Failed to move task.');
      }
    }
    setDraggedTaskId(null);
  };

  // Columns CRUD Handlers
  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    try {
      await createBoardColumn({
        name: newColName,
        wipLimit: newColWip === '' ? null : Number(newColWip),
        projectId
      });
      setNewColName('');
      setNewColWip('');
      toast.success('Column added successfully.');
      loadColumns();
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add column.');
    }
  };

  const handleUpdateColumnConfig = async (colId: string, name: string, position: number, wipLimit: number | null) => {
    try {
      await updateBoardColumn(colId, { name, position, wipLimit });
      toast.success('Column updated.');
      loadColumns();
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update column.');
    }
  };

  const handleDeleteColumnSubmit = async (colId: string) => {
    if (!confirm('Are you sure you want to delete this column? Containing tasks will be moved to the default column.')) return;
    try {
      await deleteBoardColumn(colId, projectId);
      toast.success('Column deleted.');
      loadColumns();
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete column.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 h-full">
      {/* Board actions */}
      <div className="flex justify-between items-center mb-3 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-xs">
        <span className="text-xs font-semibold text-slate-500">Drag and drop cards to change statuses</span>
        {!readOnly && (
          <Button variant="secondary" onClick={() => setConfigModal(true)} className="flex items-center gap-1 text-xs py-1 px-3">
            <Settings size={14} /> Configure Columns
          </Button>
        )}
      </div>

      {/* Board Quick Filters Bar */}
      <div className="flex gap-3 mb-4 bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl shadow-2xs items-center flex-wrap shrink-0">
        <div className="flex items-center gap-1 text-xs text-slate-500 font-bold shrink-0">
          <Filter size={13} className="text-indigo-500" /> Filters:
        </div>
        
        <input 
          type="text"
          placeholder="Filter by title..."
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          className="ems-input text-xs py-0.5 px-2 max-w-[140px] bg-white border border-slate-200"
        />

        <select
          value={filterAssignee}
          onChange={e => setFilterAssignee(e.target.value)}
          className="ems-input text-xs py-0.5 px-2 bg-white border border-slate-200 font-semibold text-slate-600 cursor-pointer"
        >
          <option value="">All Assignees</option>
          {projectMembers.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="ems-input text-xs py-0.5 px-2 bg-white border border-slate-200 font-semibold text-slate-600 cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {(filterSearch || filterAssignee || filterPriority) && (
          <button 
            onClick={() => { setFilterSearch(''); setFilterAssignee(''); setFilterPriority(''); }}
            className="text-xs font-black text-rose-500 hover:text-rose-700 transition-colors ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Columns Container */}
      <div className="flex-1 flex gap-4 overflow-x-auto min-h-0 pb-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => {
            if (t.columnId !== col.id) return false;
            if (filterAssignee && t.assigneeId !== filterAssignee) return false;
            if (filterPriority && t.priority !== filterPriority) return false;
            if (filterSearch && !t.title.toLowerCase().includes(filterSearch.toLowerCase())) return false;
            return true;
          });
          const taskCount = colTasks.length;
          const isWipExceeded = col.wipLimit !== null && taskCount > col.wipLimit;

          return (
            <div 
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-[290px] shrink-0 flex flex-col rounded-2xl border transition-all p-3 min-h-full ${
                isWipExceeded 
                  ? 'bg-rose-50/40 border-rose-300 shadow-md shadow-rose-50/20 animate-[pulse_3s_infinite]' 
                  : 'bg-slate-50/80 border-slate-100'
              }`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 shrink-0">
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-slate-800 truncate flex items-center gap-1.5">
                    {col.name}
                    {isWipExceeded && (
                      <ShieldAlert size={14} className="text-rose-500 shrink-0" title="WIP Limit Exceeded" />
                    )}
                  </h4>
                  {col.wipLimit !== null && (
                    <span className={`text-[10px] font-black ${isWipExceeded ? 'text-rose-600' : 'text-slate-400'}`}>
                      {taskCount} / {col.wipLimit} WIP Limit
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold bg-white border px-2 py-0.5 rounded-full shadow-sm text-slate-500">
                  {taskCount}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[100px] pr-0.5">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable={!readOnly}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => { setSelectedTaskId(task.id); setDrawerOpen(true); }}
                    className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs hover:shadow-md hover:scale-[1.01] active:cursor-grabbing transition-all cursor-grab"
                  >
                    <p className="font-bold text-xs text-slate-800 leading-snug break-words">{task.title}</p>
                    
                    {/* Meta info */}
                    <div className="mt-3 flex items-center justify-between gap-2 border-t pt-2 border-slate-50 text-[10px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{task.deadline}</span>
                      </div>
                      
                      {/* Priority indicator */}
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        task.priority === 'High' ? 'bg-rose-50 text-rose-500' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2 shrink-0">
                      {/* Assignee initials badge */}
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[8px] font-black flex items-center justify-center">
                          {task.assigneeName ? getInitials(task.assigneeName) : 'U'}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate max-w-[80px]">
                          {task.assigneeName || 'Unassigned'}
                        </span>
                      </div>

                      {/* Story points indicator */}
                      {(task as any).storyPoints !== null && (task as any).storyPoints !== undefined && (
                        <span className="bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                          {(task as any).storyPoints} SP
                        </span>
                      )}

                      {!readOnly && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {columns.length === 0 && (
          <p className="text-center py-12 text-slate-500 font-medium w-full">Loading columns...</p>
        )}
      </div>

      <TaskDetailsDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        taskId={selectedTaskId || ''}
        projectId={projectId}
        projectMembers={projectMembers}
        onTaskUpdated={onTaskUpdated}
      />

      {/* Board configuration modal */}
      <Modal isOpen={configModal} onClose={() => setConfigModal(false)} title="Configure Board Columns">
        <div className="p-2 space-y-5">
          {/* Columns list */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {columns.map((col, idx) => (
              <div key={col.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
                <input 
                  type="text"
                  value={col.name}
                  onChange={(e) => handleUpdateColumnConfig(col.id, e.target.value, col.position, col.wipLimit)}
                  className="bg-white border rounded text-xs font-bold px-2 py-1 flex-1 min-w-[120px]"
                />

                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">WIP:</label>
                  <input 
                    type="number"
                    placeholder="None"
                    value={col.wipLimit !== null ? col.wipLimit : ''}
                    onChange={(e) => handleUpdateColumnConfig(col.id, col.name, col.position, e.target.value === '' ? null : Number(e.target.value))}
                    className="w-14 bg-white border rounded text-xs font-bold p-1 text-center"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    disabled={idx === 0}
                    onClick={() => handleUpdateColumnConfig(col.id, col.name, col.position - 1.5, col.wipLimit)}
                    className="p-1 rounded bg-white hover:bg-slate-100 border text-slate-600 disabled:opacity-30"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button 
                    disabled={idx === columns.length - 1}
                    onClick={() => handleUpdateColumnConfig(col.id, col.name, col.position + 1.5, col.wipLimit)}
                    className="p-1 rounded bg-white hover:bg-slate-100 border text-slate-600 disabled:opacity-30"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button 
                    onClick={() => handleDeleteColumnSubmit(col.id)}
                    className="p-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 ml-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add column form */}
          <form onSubmit={handleAddColumn} className="border-t pt-4 space-y-3">
            <h5 className="font-extrabold text-slate-800 text-xs">+ Add Custom Column</h5>
            <div className="grid grid-cols-2 gap-3">
              <Input 
                type="text" required placeholder="Column Name (e.g. Code Review)"
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                className="py-1 px-3 text-xs"
              />
              <Input 
                type="number" placeholder="WIP Limit (optional)"
                value={newColWip}
                onChange={e => setNewColWip(e.target.value === '' ? '' : Number(e.target.value))}
                className="py-1 px-3 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setConfigModal(false)} className="text-xs">Cancel</Button>
              <Button type="submit" variant="primary" className="text-xs">Add Column</Button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
};
