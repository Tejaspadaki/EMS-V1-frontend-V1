import api from './axios';

export interface SearchResult {
  id: string;
  type: 'Employee' | 'Project' | 'Task';
  title: string;
  metadata: string; // e.g. "Engineering • Team Lead" or "Dev Stage • Mobile App"
  link: string;
}

// Mock DB removed in favor of live backend

export const globalSearch = async (query: string) => {
  if (!query.trim()) {
    return [];
  }
  
  const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
  const data = response.data.data;
  
  const results: SearchResult[] = [];
  
  if (data.employees) {
    data.employees.forEach((emp: any) => {
      results.push({
        id: emp.id,
        type: 'Employee',
        title: emp.name,
        metadata: `${emp.department || 'No Dept'} • ${emp.role}`,
        link: `/employees/${emp.id}`
      });
    });
  }
  
  if (data.projects) {
    data.projects.forEach((proj: any) => {
      results.push({
        id: proj.id,
        type: 'Project',
        title: proj.name,
        metadata: proj.status,
        link: `/projects/${proj.id}`
      });
    });
  }
  
  if (data.tasks) {
    data.tasks.forEach((task: any) => {
      results.push({
        id: task.id,
        type: 'Task',
        title: task.title,
        metadata: `Priority: ${task.priority}`,
        link: `/projects/${task.projectId || ''}`
      });
    });
  }
  
  return results;
};
