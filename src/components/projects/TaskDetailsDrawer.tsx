import React, { useEffect, useState } from 'react';
import { 
  getTaskDetails, 
  createSubtask, 
  createChecklistItem, 
  toggleChecklistItem, 
  deleteChecklistItem, 
  addTaskDependency, 
  removeTaskDependency, 
  addTaskComment, 
  addTaskAttachment,
  updateTaskSprintAndEstimate,
  updateTaskAssignee,
  updateTaskColumn,
  getTasks
} from '../../api/projects.api';
import { getSprints, type Sprint } from '../../api/sprints.api';
import { getEpics, type Epic } from '../../api/epics.api';
import { 
  X, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Paperclip, 
  MessageSquare, 
  History, 
  Tag, 
  UserPlus, 
  FolderGit2, 
  Calendar,
  AlertTriangle,
  Play
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from '../../utils/toast';

interface TaskDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  projectId: string;
  projectMembers: { id: string; name: string }[];
  onTaskUpdated: () => void;
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ 
  isOpen, 
  onClose, 
  taskId, 
  projectId, 
  projectMembers,
  onTaskUpdated 
}) => {
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [allProjectTasks, setAllProjectTasks] = useState<any[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);

  // Mutation states
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  
  // Dependency selection state
  const [depTaskId, setDepTaskId] = useState('');
  const [depType, setDepType] = useState<'blocks' | 'blocked_by'>('blocks');

  // Attachment helper state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileUrl, setUploadFileUrl] = useState('');

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await getTaskDetails(taskId);
      setDetails(data);
      
      const [projTasks, sprintData, epicData] = await Promise.all([
        getTasks(projectId),
        getSprints(projectId),
        getEpics(projectId)
      ]);
      setAllProjectTasks(projTasks.filter(t => t.id !== taskId));
      setSprints(sprintData);
      setEpics(epicData);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load task details.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      loadDetails();
    }
  }, [isOpen, taskId]);

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      await createSubtask(taskId, { title: newSubtaskTitle });
      setNewSubtaskTitle('');
      toast.success('Subtask added.');
      loadDetails();
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create subtask.');
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    try {
      await createChecklistItem(taskId, newChecklistItem);
      setNewChecklistItem('');
      toast.success('Checklist item added.');
      loadDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add checklist item.');
    }
  };

  const handleToggleCheck = async (itemId: string, isCompleted: boolean) => {
    try {
      await toggleChecklistItem(itemId, isCompleted);
      loadDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCheck = async (itemId: string) => {
    try {
      await deleteChecklistItem(itemId);
      loadDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      await addTaskComment(taskId, newCommentText);
      setNewCommentText('');
      toast.success('Comment posted.');
      loadDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to post comment.');
    }
  };

  const handleAddAttachmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim() || !uploadFileUrl.trim()) return;
    try {
      await addTaskAttachment(taskId, {
        fileName: uploadFileName,
        fileUrl: uploadFileUrl,
        fileType: 'link'
      });
      setUploadFileName('');
      setUploadFileUrl('');
      toast.success('Link attachment registered.');
      loadDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add attachment link.');
    }
  };

  const handleAddDependencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depTaskId) return;
    try {
      await addTaskDependency(taskId, depTaskId, depType);
      setDepTaskId('');
      toast.success('Task dependency mapped.');
      loadDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create dependency linkage.');
    }
  };

  const handleRemoveDependency = async (depId: string) => {
    try {
      await removeTaskDependency(depId);
      toast.success('Dependency linkage removed.');
      loadDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    try {
      await updateTaskAssignee(taskId, userId);
      toast.success('Assignee updated.');
      loadDetails();
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update assignee.');
    }
  };

  const handleSprintEstimateEpicChange = async (fields: { sprintId?: string | null; storyPoints?: number | null; epicId?: string | null }) => {
    try {
      await updateTaskSprintAndEstimate(taskId, fields);
      toast.success('Task metrics updated.');
      loadDetails();
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task metrics.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[650px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col transition-all duration-300 ease-in-out">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Task Detail Panel</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : !details ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">Task details not found.</div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main workspace (Left/Center area) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 border-b md:border-b-0 md:border-r border-slate-100">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{details.title}</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold uppercase">Status: <span className="text-indigo-600">{details.status}</span></p>
            </div>

            {/* Checklists item log */}
            <div className="space-y-3 bg-slate-50/40 border border-slate-100 rounded-xl p-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                <CheckSquare size={15} className="text-indigo-500" /> Checklist
              </h4>
              <div className="space-y-1.5">
                {details.checklists.map((chk: any) => (
                  <div key={chk.id} className="flex items-center justify-between gap-3 text-xs bg-white border border-slate-100 p-2 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={chk.isCompleted}
                        onChange={(e) => handleToggleCheck(chk.id, e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={chk.isCompleted ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-extrabold'}>
                        {chk.itemText}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteCheck(chk.id)} className="text-slate-300 hover:text-rose-600 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1.5">
                <Input 
                  type="text" 
                  placeholder="+ Add list item..."
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  className="py-1 px-3 text-xs shadow-none"
                />
                <Button type="submit" variant="secondary" className="text-xs py-1 px-3">Add</Button>
              </form>
            </div>

            {/* Subtasks block */}
            <div className="space-y-3 bg-slate-50/40 border border-slate-100 rounded-xl p-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                <FolderGit2 size={15} className="text-indigo-500" /> Nested Subtasks
              </h4>
              <div className="space-y-1.5">
                {details.subtasks.map((sub: any) => (
                  <div key={sub.id} className="flex items-center justify-between gap-3 text-xs bg-white border border-slate-100 p-2.5 rounded-lg shadow-2xs">
                    <span className="font-extrabold text-slate-700">{sub.title}</span>
                    <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]">{sub.status}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleCreateSubtask} className="flex gap-2 pt-1.5">
                <Input 
                  type="text" 
                  placeholder="+ Create subtask..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  className="py-1 px-3 text-xs shadow-none"
                />
                <Button type="submit" variant="secondary" className="text-xs py-1 px-3">Create</Button>
              </form>
            </div>

            {/* Dependencies block */}
            <div className="space-y-3 bg-slate-50/40 border border-slate-100 rounded-xl p-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-indigo-500" /> Blocker Links & Dependencies
              </h4>
              <div className="space-y-1.5">
                {details.dependencies.map((dep: any) => (
                  <div key={dep.id} className="flex items-center justify-between gap-3 text-xs bg-white border border-slate-100 p-2.5 rounded-lg shadow-2xs">
                    <div>
                      <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 border rounded mr-2 bg-indigo-50 text-indigo-600">
                        {dep.type === 'blocks' ? 'Blocks' : 'Blocked By'}
                      </span>
                      <span className="font-extrabold text-slate-700">{dep.title}</span>
                    </div>
                    <button onClick={() => handleRemoveDependency(dep.id)} className="text-slate-300 hover:text-rose-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddDependencySubmit} className="flex gap-2 pt-1.5 flex-wrap">
                <select
                  value={depTaskId}
                  onChange={e => setDepTaskId(e.target.value)}
                  className="ems-input text-xs py-1 px-2.5 flex-1 min-w-[120px]"
                >
                  <option value="">Select Target Task...</option>
                  {allProjectTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <select
                  value={depType}
                  onChange={e => setDepType(e.target.value as any)}
                  className="ems-input text-xs py-1 px-2.5 w-28"
                >
                  <option value="blocks">Blocks</option>
                  <option value="blocked_by">Blocked By</option>
                </select>
                <Button type="submit" variant="secondary" className="text-xs py-1 px-3">Link</Button>
              </form>
            </div>

            {/* Comments Thread logs */}
            <div className="space-y-3 bg-slate-50/40 border border-slate-100 rounded-xl p-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                <MessageSquare size={15} className="text-indigo-500" /> Collaboration & Comments
              </h4>
              
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input 
                  type="text" 
                  placeholder="Ask a question or post progress updates..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  className="py-1 px-3 text-xs shadow-none"
                />
                <Button type="submit" variant="primary" className="text-xs py-1 px-4">Post</Button>
              </form>

              <div className="space-y-2 mt-3 max-h-[220px] overflow-y-auto pr-1">
                {details.comments.map((comment: any) => (
                  <div key={comment.id} className="bg-white border rounded-xl p-2.5 shadow-2xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-1">
                      <span className="text-indigo-600 font-extrabold">{comment.userName}</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-snug">{comment.commentText}</p>
                  </div>
                ))}
                {details.comments.length === 0 && (
                  <p className="text-center py-4 text-[10px] text-slate-400 italic">No developer conversations logged.</p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area (Right area: fields, uploads, audit logs) */}
          <div className="w-full md:w-[240px] shrink-0 bg-slate-50/30 p-5 overflow-y-auto space-y-6">
            
            {/* Properties fields selector */}
            <div className="space-y-4">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide border-b pb-2">Properties</h4>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Assignee</label>
                <select
                  value={details.assigneeId || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="ems-input text-xs w-full py-1 font-bold bg-white"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Story Points</label>
                <input 
                  type="number"
                  min={0}
                  value={details.storyPoints !== null ? details.storyPoints : ''}
                  onChange={(e) => handleSprintEstimateEpicChange({ storyPoints: e.target.value === '' ? null : Number(e.target.value) })}
                  className="ems-input text-xs w-full py-1 font-bold text-center bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Sprint</label>
                <select
                  value={details.sprintId || ''}
                  onChange={(e) => handleSprintEstimateEpicChange({ sprintId: e.target.value === '' ? null : e.target.value })}
                  className="ems-input text-xs w-full py-1 font-bold bg-white"
                >
                  <option value="">Backlog</option>
                  {sprints.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Epic</label>
                <select
                  value={details.epicId || ''}
                  onChange={(e) => handleSprintEstimateEpicChange({ epicId: e.target.value === '' ? null : e.target.value })}
                  className="ems-input text-xs w-full py-1 font-bold bg-white"
                >
                  <option value="">No Epic</option>
                  {epics.map(ep => (
                    <option key={ep.id} value={ep.id}>{ep.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Links and Attachments Upload manager */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide border-b pb-2 flex items-center gap-1">
                <Paperclip size={13} /> Attachments
              </h4>
              
              <form onSubmit={handleAddAttachmentSubmit} className="space-y-2">
                <Input 
                  type="text" placeholder="Link label..." required
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  className="py-0.5 text-xs shadow-none bg-white"
                />
                <Input 
                  type="url" placeholder="https://..." required
                  value={uploadFileUrl}
                  onChange={e => setUploadFileUrl(e.target.value)}
                  className="py-0.5 text-xs shadow-none bg-white"
                />
                <Button type="submit" variant="secondary" className="w-full text-xs py-1">Attach Link</Button>
              </form>

              <div className="space-y-1.5 mt-2">
                {details.attachments.map((attach: any) => (
                  <a 
                    key={attach.id} 
                    href={attach.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block text-xs font-bold text-indigo-600 hover:underline bg-white border border-slate-100 p-2 rounded-lg truncate shadow-2xs"
                  >
                    📎 {attach.fileName}
                  </a>
                ))}
              </div>
            </div>

            {/* Audit Logs events logger */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide border-b pb-2 flex items-center gap-1">
                <History size={13} /> History Logs
              </h4>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {details.auditLogs.map((log: any) => (
                  <div key={log.id} className="text-[10px] text-slate-500 leading-normal border-l-2 border-slate-200 pl-2">
                    <p className="font-bold">
                      {log.userName}{' '}
                      <span className="text-slate-400 font-semibold text-[9px]">
                        {log.action === 'status_changed' ? 'changed status' :
                         log.action === 'assignee_changed' ? 'changed assignee' :
                         log.action === 'estimate_changed' ? 'adjusted story points' : 'modified attributes'}
                      </span>
                    </p>
                    <p className="text-[9px] font-medium text-slate-400">
                      {log.fromValue !== 'null' && log.fromValue !== null ? `"${log.fromValue}"` : 'None'} ➡️{' '}
                      {log.toValue !== 'null' && log.toValue !== null ? `"${log.toValue}"` : 'None'}
                    </p>
                  </div>
                ))}
                {details.auditLogs.length === 0 && (
                  <p className="text-[9px] text-slate-400 italic">No audit history recorded.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
