import React, { useEffect, useState } from 'react';
import { 
  getSprints, 
  createSprint, 
  startSprint, 
  completeSprint, 
  deleteSprint, 
  type Sprint 
} from '../../api/sprints.api';
import { 
  getEpics, 
  createEpic, 
  deleteEpic, 
  type Epic 
} from '../../api/epics.api';
import { 
  getTasks, 
  createTask, 
  updateTaskSprintAndEstimate, 
  updateTaskAssignee, 
  type ProjectTask, 
  type Project 
} from '../../api/projects.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { SprintBurndownModal } from '../../components/projects/SprintBurndownModal';
import { 
  Calendar, 
  Plus, 
  MoreVertical, 
  TrendingDown, 
  CheckCircle, 
  Bookmark, 
  ChevronRight, 
  Filter, 
  FolderGit2, 
  Play, 
  User, 
  Trash2,
  ListTodo
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface BacklogPageProps {
  projectId: string;
  project: Project;
  isAllowedToEdit: boolean;
}

export const BacklogPage: React.FC<BacklogPageProps> = ({ projectId, project, isAllowedToEdit }) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEpicFilter, setSelectedEpicFilter] = useState<string | null>(null);

  // Modals / Sprints Creation state
  const [createSprintModal, setCreateSprintModal] = useState(false);
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '' });

  // Epics Creation state
  const [createEpicModal, setCreateEpicModal] = useState(false);
  const [epicForm, setEpicForm] = useState({ name: '', description: '' });

  // Complete Sprint state
  const [completeSprintModal, setCompleteSprintModal] = useState(false);
  const [selectedSprintToClose, setSelectedSprintToClose] = useState<Sprint | null>(null);
  const [rolloverSprintId, setRolloverSprintId] = useState<string>('');

  // Burndown state
  const [burndownOpen, setBurndownOpen] = useState(false);
  const [activeBurndownSprintId, setActiveBurndownSprintId] = useState('');

  // Inline Quick Task Create state
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const loadData = async () => {
    try {
      const [sprintData, epicData, taskData] = await Promise.all([
        getSprints(projectId),
        getEpics(projectId),
        getTasks(projectId)
      ]);
      setSprints(sprintData);
      setEpics(epicData);
      setTasks(taskData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sprint planning data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSprint({ ...sprintForm, projectId });
      setCreateSprintModal(false);
      setSprintForm({ name: '', goal: '' });
      toast.success('Sprint created successfully.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create sprint.');
    }
  };

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEpic({ ...epicForm, projectId });
      setCreateEpicModal(false);
      setEpicForm({ name: '', description: '' });
      toast.success('Epic created successfully.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create epic.');
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await startSprint(sprintId);
      toast.success('Sprint activated successfully.');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.message || 'Failed to start sprint.');
    }
  };

  const handleOpenCloseModal = (sprint: Sprint) => {
    setSelectedSprintToClose(sprint);
    const options = sprints.filter(s => s.status === 'planning' && s.id !== sprint.id);
    setRolloverSprintId(options[0]?.id || 'backlog');
    setCompleteSprintModal(true);
  };

  const handleCompleteSprintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprintToClose) return;
    try {
      const rolloverTarget = rolloverSprintId === 'backlog' ? null : rolloverSprintId;
      await completeSprint(selectedSprintToClose.id, rolloverTarget);
      setCompleteSprintModal(false);
      setSelectedSprintToClose(null);
      toast.success('Sprint completed and tasks rolled over.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete sprint.');
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Are you sure you want to delete this sprint? Linked tasks will return to the backlog.')) return;
    try {
      await deleteSprint(sprintId);
      toast.success('Sprint deleted.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete sprint.');
    }
  };

  const handleDeleteEpic = async (epicId: string) => {
    if (!confirm('Are you sure you want to delete this epic? Linked tasks will retain their backlog priority.')) return;
    try {
      await deleteEpic(epicId);
      toast.success('Epic deleted.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete epic.');
    }
  };

  const handleQuickCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    try {
      await createTask(projectId, {
        title: quickTaskTitle,
        priority: 'Medium',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setQuickTaskTitle('');
      toast.success('Task added to backlog.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create task.');
    }
  };

  const handleUpdateTaskAttributes = async (taskId: string, fields: { sprintId?: string | null; storyPoints?: number | null; epicId?: string | null }) => {
    try {
      await updateTaskSprintAndEstimate(taskId, fields);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task.');
    }
  };

  const handleUpdateTaskAssignee = async (taskId: string, assigneeId: string) => {
    try {
      await updateTaskAssignee(taskId, assigneeId);
      toast.success('Task assignee updated.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign task.');
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetSprintId: string | null) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    await handleUpdateTaskAttributes(taskId, { sprintId: targetSprintId });
    toast.success('Task moved.');
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  // Filter tasks based on epic filter
  const filteredTasks = tasks.filter(t => {
    if (selectedEpicFilter && t.epicId !== selectedEpicFilter) return false;
    return true;
  });

  const backlogTasks = filteredTasks.filter(t => !t.sprintId);

  const getEpicBadgeStyle = (epicName: string) => {
    const sum = epicName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-indigo-50 text-indigo-700 border-indigo-100',
      'bg-emerald-50 text-emerald-700 border-emerald-100',
      'bg-rose-50 text-rose-700 border-rose-100',
      'bg-amber-50 text-amber-700 border-amber-100',
      'bg-sky-50 text-sky-700 border-sky-100',
      'bg-violet-50 text-violet-700 border-violet-100',
    ];
    return colors[sum % colors.length];
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start h-full w-full min-h-0">
      
      {/* Sprints and Backlog planning section */}
      <div className="flex-1 space-y-6 w-full overflow-y-auto pr-2 max-h-[calc(100vh-14rem)]">
        
        {/* Controls */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-sm">Sprint Planning Board</h3>
          </div>
          {isAllowedToEdit && (
            <Button variant="secondary" onClick={() => setCreateSprintModal(true)} className="flex items-center gap-1.5 text-xs">
              <Plus size={14} /> Create Sprint
            </Button>
          )}
        </div>

        {/* Sprints buckets list */}
        {sprints.map(sprint => {
          const sprintTasks = filteredTasks.filter(t => t.sprintId === sprint.id);
          const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
          
          return (
            <div 
              key={sprint.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, sprint.id)}
              className={`p-4 rounded-2xl border transition-all ${
                sprint.status === 'active' 
                  ? 'bg-gradient-to-br from-indigo-50/30 to-indigo-100/10 border-indigo-200/60 shadow-indigo-100/30 shadow-md' 
                  : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-slate-900">{sprint.name}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      sprint.status === 'active' ? 'bg-indigo-600 text-white animate-pulse' :
                      sprint.status === 'completed' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {sprint.status}
                    </span>
                  </div>
                  {sprint.goal && <p className="text-xs text-slate-400 mt-1 font-medium italic">Goal: {sprint.goal}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-600">
                    {totalPoints} SP
                  </div>

                  {sprint.status === 'planning' && isAllowedToEdit && (
                    <Button variant="primary" onClick={() => handleStartSprint(sprint.id)} className="flex items-center gap-1 text-[11px] py-1 px-3">
                      <Play size={11} /> Start Sprint
                    </Button>
                  )}

                  {sprint.status === 'active' && (
                    <>
                      <Button variant="secondary" onClick={() => { setActiveBurndownSprintId(sprint.id); setBurndownOpen(true); }} className="flex items-center gap-1 text-[11px] py-1 px-3">
                        <TrendingDown size={12} /> Burn-down
                      </Button>
                      {isAllowedToEdit && (
                        <Button variant="secondary" onClick={() => handleOpenCloseModal(sprint)} className="flex items-center gap-1 text-[11px] py-1 px-3 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                          <CheckCircle size={12} /> Complete Sprint
                        </Button>
                      )}
                    </>
                  )}

                  {isAllowedToEdit && sprint.status !== 'completed' && (
                    <button onClick={() => handleDeleteSprint(sprint.id)} className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks List within Sprint */}
              <div className="space-y-2 mt-3 min-h-[50px] border-2 border-dashed border-transparent hover:border-indigo-200/50 rounded-xl transition-colors">
                {sprintTasks.map(task => (
                  <div 
                    key={task.id}
                    draggable={isAllowedToEdit}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="p-3 bg-white hover:bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 shadow-sm hover:scale-[1.005] active:scale-[0.995] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Bookmark size={15} className="text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-slate-800 truncate pr-2" title={task.title}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {task.epicName && (
                            <span className={`px-2 py-0.5 border rounded text-[9px] font-bold ${getEpicBadgeStyle(task.epicName)}`}>
                              {task.epicName}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            task.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{task.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Assignee select */}
                      <div className="flex items-center gap-1">
                        <User size={13} className="text-slate-400" />
                        <select
                          value={task.assigneeId || ''}
                          onChange={(e) => handleUpdateTaskAssignee(task.id, e.target.value)}
                          className="bg-transparent border-0 text-xs font-semibold text-slate-600 focus:ring-0 cursor-pointer max-w-[100px]"
                        >
                          <option value="">Unassigned</option>
                          {project.members.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Story points inline input */}
                      <input 
                        type="number"
                        min={0}
                        placeholder="SP"
                        value={task.storyPoints !== null && task.storyPoints !== undefined ? task.storyPoints : ''}
                        onChange={(e) => handleUpdateTaskAttributes(task.id, { storyPoints: e.target.value === '' ? null : Number(e.target.value) })}
                        className="w-12 text-center text-xs font-black text-slate-800 border rounded p-1 bg-slate-50 border-slate-200"
                        title="Story Points Estimation"
                      />

                      {/* Sprint selector helper */}
                      <select
                        value={task.sprintId || ''}
                        onChange={(e) => handleUpdateTaskAttributes(task.id, { sprintId: e.target.value === '' ? null : e.target.value })}
                        className="bg-transparent border-0 text-xs font-semibold text-slate-400 focus:ring-0 cursor-pointer"
                      >
                        <option value="">Move to Backlog</option>
                        {sprints.filter(s => s.id !== sprint.id).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {sprintTasks.length === 0 && (
                  <p className="text-center py-4 text-xs text-slate-400 font-medium">Sprint is empty. Drag backlog items here.</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Backlog Section */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, null)}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ListTodo size={18} className="text-indigo-600" />
              <h4 className="font-black text-slate-800 text-base">Backlog Tasks</h4>
            </div>
            <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-0.5 rounded-full font-bold text-slate-600">
              {backlogTasks.length} Cards
            </span>
          </div>

          {/* Quick Create Backlog Task Form */}
          {isAllowedToEdit && (
            <form onSubmit={handleQuickCreateTaskSubmit} className="flex gap-2 mb-4">
              <Input 
                type="text" 
                placeholder="+ Create new backlog item..."
                value={quickTaskTitle}
                onChange={e => setQuickTaskTitle(e.target.value)}
                className="flex-1 py-1.5 text-xs shadow-none border-dashed"
              />
              <Button type="submit" variant="primary" className="text-xs py-1 px-4">Add</Button>
            </form>
          )}

          {/* Backlog items list */}
          <div className="space-y-2 min-h-[100px]">
            {backlogTasks.map(task => (
              <div 
                key={task.id}
                draggable={isAllowedToEdit}
                onDragStart={(e) => handleDragStart(e, task.id)}
                className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 shadow-xs transition-all hover:scale-[1.002]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Bookmark size={15} className="text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm text-slate-800 truncate pr-2">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {task.epicName && (
                        <span className={`px-2 py-0.5 border rounded text-[9px] font-bold ${getEpicBadgeStyle(task.epicName)}`}>
                          {task.epicName}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        task.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{task.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Assignee select */}
                  <div className="flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    <select
                      value={task.assigneeId || ''}
                      onChange={(e) => handleUpdateTaskAssignee(task.id, e.target.value)}
                      className="bg-transparent border-0 text-xs font-semibold text-slate-600 focus:ring-0 cursor-pointer max-w-[100px]"
                    >
                      <option value="">Unassigned</option>
                      {project.members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Story points input */}
                  <input 
                    type="number"
                    min={0}
                    placeholder="SP"
                    value={task.storyPoints !== null && task.storyPoints !== undefined ? task.storyPoints : ''}
                    onChange={(e) => handleUpdateTaskAttributes(task.id, { storyPoints: e.target.value === '' ? null : Number(e.target.value) })}
                    className="w-12 text-center text-xs font-black text-slate-800 border rounded p-1 bg-slate-100 border-slate-200"
                  />

                  {/* Sprint selector */}
                  <select
                    value={task.sprintId || ''}
                    onChange={(e) => handleUpdateTaskAttributes(task.id, { sprintId: e.target.value === '' ? null : e.target.value })}
                    className="bg-transparent border-0 text-xs font-semibold text-slate-400 focus:ring-0 cursor-pointer"
                  >
                    <option value="">Backlog</option>
                    {sprints.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {backlogTasks.length === 0 && (
              <p className="text-center py-8 text-sm text-slate-500 font-medium bg-slate-50/20 rounded-xl border border-dashed border-slate-100">
                Backlog is empty.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Epics Manager Sidebar Panel */}
      <div className="w-full lg:w-[280px] bg-white p-4 border border-slate-100 rounded-2xl shadow-sm space-y-4 shrink-0">
        <div className="flex justify-between items-center border-b pb-3">
          <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
            <FolderGit2 size={16} className="text-indigo-600" /> Epics
          </h4>
          {isAllowedToEdit && (
            <button onClick={() => setCreateEpicModal(true)} className="p-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
              <Plus size={14} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {/* Default filter options */}
          <button
            onClick={() => setSelectedEpicFilter(null)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold flex justify-between items-center transition-colors ${
              selectedEpicFilter === null ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Board Cards</span>
            <ChevronRight size={14} />
          </button>

          {/* Epics list */}
          {epics.map(epic => (
            <div 
              key={epic.id}
              className={`w-full rounded-xl border border-slate-100 flex items-center justify-between p-1.5 transition-all ${
                selectedEpicFilter === epic.id ? 'bg-indigo-50/50 border-indigo-200' : 'hover:bg-slate-50/30'
              }`}
            >
              <button
                onClick={() => setSelectedEpicFilter(epic.id)}
                className="flex-1 text-left px-1.5 py-1 text-xs font-bold text-slate-700 truncate"
                title={epic.name}
              >
                {epic.name}
              </button>
              {isAllowedToEdit && (
                <button 
                  onClick={() => handleDeleteEpic(epic.id)}
                  className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}

          {epics.length === 0 && (
            <p className="text-center py-6 text-[10px] text-slate-400 font-semibold italic">No Epics configured.</p>
          )}
        </div>
      </div>

      {/* Sprint Creation Modal */}
      <Modal isOpen={createSprintModal} onClose={() => setCreateSprintModal(false)} title="Create New Sprint">
        <form onSubmit={handleCreateSprint} className="p-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sprint Name</label>
            <Input 
              type="text" required placeholder="e.g. Q4 Sprint 1"
              value={sprintForm.name}
              onChange={e => setSprintForm({ ...sprintForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sprint Goal</label>
            <textarea
              className="novynth-input w-full min-h-[80px]"
              placeholder="e.g. Deliver Auth and Project dashboards..."
              value={sprintForm.goal}
              onChange={e => setSprintForm({ ...sprintForm, goal: e.target.value })}
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setCreateSprintModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Sprint</Button>
          </div>
        </form>
      </Modal>

      {/* Epic Creation Modal */}
      <Modal isOpen={createEpicModal} onClose={() => setCreateEpicModal(false)} title="Create New Epic">
        <form onSubmit={handleCreateEpic} className="p-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Epic Name</label>
            <Input 
              type="text" required placeholder="e.g. User Authentication"
              value={epicForm.name}
              onChange={e => setEpicForm({ ...epicForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="novynth-input w-full min-h-[80px]"
              placeholder="e.g. Setup tokens, RBAC models, login interfaces..."
              value={epicForm.description}
              onChange={e => setEpicForm({ ...epicForm, description: e.target.value })}
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setCreateEpicModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Epic</Button>
          </div>
        </form>
      </Modal>

      {/* Complete Sprint Modal */}
      <Modal isOpen={completeSprintModal} onClose={() => setCompleteSprintModal(false)} title="Complete Sprint">
        {selectedSprintToClose && (
          <form onSubmit={handleCompleteSprintSubmit} className="p-2 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-700">
                You are about to complete <strong>{selectedSprintToClose.name}</strong>.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Any incomplete tasks remaining in this sprint must be rolled over.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Move incomplete tasks to:</label>
              <select
                className="novynth-input w-full font-bold"
                value={rolloverSprintId}
                onChange={e => setRolloverSprintId(e.target.value)}
              >
                <option value="backlog">General Backlog</option>
                {sprints.filter(s => s.status === 'planning' && s.id !== selectedSprintToClose.id).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setCompleteSprintModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Complete Sprint</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Burn-down Modal */}
      <SprintBurndownModal 
        isOpen={burndownOpen} 
        onClose={() => setBurndownOpen(false)} 
        sprintId={activeBurndownSprintId} 
      />

    </div>
  );
};
