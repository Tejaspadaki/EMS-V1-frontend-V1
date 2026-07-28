export type Permission =
  | 'view_system_overview'
  | 'view_admin_metrics'
  | 'view_executive_summary'
  | 'view_department_analytics'
  | 'view_team_queue'
  | 'view_employee_workspace'
  | 'view_ops_module'
  | 'view_growth_module'
  | 'view_product_module'
  | 'view_design_module'
  | 'view_engineering_module'
  | 'view_ai_module'
  | 'view_security_module'
  | 'view_finance_module'
  | 'view_intern_module'
  | 'view_hr_module'
  | 'manage_users'
  | 'manage_system';

export interface WidgetConfig {
  id: string;
  title: string;
  category: 'kpi' | 'chart' | 'action' | 'module' | 'feed';
  requiredPermissions: Permission[];
  gridSpan?: string;
}

// Extensible Role-to-Permissions Mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Super Admin': [
    'view_system_overview',
    'view_admin_metrics',
    'view_executive_summary',
    'view_department_analytics',
    'view_team_queue',
    'view_employee_workspace',
    'view_ops_module',
    'view_product_module',
    'view_design_module',
    'view_engineering_module',
    'view_ai_module',
    'view_security_module',
    'view_finance_module',
    'view_intern_module',
    'view_hr_module',
    'manage_users',
    'manage_system',
  ],
  'CEO': [
    'view_executive_summary',
    'view_system_overview',
    'view_department_analytics',
    'view_finance_module',
    'view_product_module',
    'view_ops_module',
    'view_employee_workspace',
  ],
  'CTO': [
    'view_executive_summary',
    'view_system_overview',
    'view_engineering_module',
    'view_ai_module',
    'view_security_module',
    'view_product_module',
    'view_employee_workspace',
  ],
  'HR': [
    'view_hr_module',
    'view_system_overview',
    'view_department_analytics',
    'view_team_queue',
    'view_employee_workspace',
    'manage_users',
  ],
  'Dept Head': [
    'view_department_analytics',
    'view_team_queue',
    'view_employee_workspace',
    'view_ops_module',
    'view_growth_module', // Granted exclusively to Department Heads
  ],
  'Team Lead': [
    'view_team_queue',
    'view_employee_workspace',
    'view_department_analytics',
  ],
  'Operations Lead': [
    'view_ops_module',
    'view_department_analytics',
    'view_employee_workspace',
  ],
  'Operations': [
    'view_ops_module',
    'view_employee_workspace',
  ],
  'Growth Lead': [
    'view_department_analytics',
    'view_employee_workspace',
  ],
  'Growth': [
    'view_employee_workspace',
  ],
  'Sales Lead': [
    'view_employee_workspace',
  ],
  'Product Lead': [
    'view_product_module',
    'view_department_analytics',
    'view_employee_workspace',
  ],
  'Product': [
    'view_product_module',
    'view_employee_workspace',
  ],
  'Design Lead': [
    'view_design_module',
    'view_employee_workspace',
  ],
  'UI/UX Lead': [
    'view_design_module',
    'view_employee_workspace',
  ],
  'Engineering Lead': [
    'view_engineering_module',
    'view_department_analytics',
    'view_employee_workspace',
  ],
  'Eng Lead': [
    'view_engineering_module',
    'view_employee_workspace',
  ],
  'AI Lead': [
    'view_ai_module',
    'view_employee_workspace',
  ],
  'AI / ML Lead': [
    'view_ai_module',
    'view_employee_workspace',
  ],
  'Security Lead': [
    'view_security_module',
    'view_employee_workspace',
  ],
  'Security': [
    'view_security_module',
    'view_employee_workspace',
  ],
  'Finance Lead': [
    'view_finance_module',
    'view_employee_workspace',
  ],
  'Finance': [
    'view_finance_module',
    'view_employee_workspace',
  ],
  'Intern': [
    'view_intern_module',
    'view_employee_workspace',
  ],
  'Employee': [
    'view_employee_workspace',
  ],
};

// Helper to get permissions for any role (with fallback for custom roles)
export const getRolePermissions = (roleName?: string | null): Permission[] => {
  if (!roleName) return ['view_employee_workspace'];
  const trimmedRole = roleName.trim();
  if (ROLE_PERMISSIONS[trimmedRole]) {
    return ROLE_PERMISSIONS[trimmedRole];
  }
  const lower = trimmedRole.toLowerCase();
  if (lower.includes('admin')) return ROLE_PERMISSIONS['Super Admin'];
  if (lower.includes('hr')) return ROLE_PERMISSIONS['HR'];
  if (lower.includes('ceo')) return ROLE_PERMISSIONS['CEO'];
  if (lower.includes('cto')) return ROLE_PERMISSIONS['CTO'];
  if (lower.includes('dept') || lower.includes('head')) return ROLE_PERMISSIONS['Dept Head'];
  if (lower.includes('lead')) return ROLE_PERMISSIONS['Team Lead'];
  if (lower.includes('intern')) return ROLE_PERMISSIONS['Intern'];

  return ['view_employee_workspace'];
};

// Check if current user has permission
export const hasPermission = (userPermissions: Permission[], required: Permission | Permission[]): boolean => {
  const reqs = Array.isArray(required) ? required : [required];
  return reqs.some(p => userPermissions.includes(p));
};

// Master Dashboard Widgets Register
export const DASHBOARD_WIDGETS: WidgetConfig[] = [
  // KPI Widgets
  { id: 'kpi_my_tasks', title: 'My Active Tasks', category: 'kpi', requiredPermissions: ['view_employee_workspace'] },
  { id: 'kpi_pending_leaves', title: 'Pending Leaves', category: 'kpi', requiredPermissions: ['view_employee_workspace'] },
  { id: 'kpi_approval_queue', title: 'Pending Approvals', category: 'kpi', requiredPermissions: ['view_team_queue'] },
  { id: 'kpi_system_users', title: 'Total Headcount', category: 'kpi', requiredPermissions: ['view_system_overview', 'view_hr_module'] },
  { id: 'kpi_active_projects', title: 'Active Projects', category: 'kpi', requiredPermissions: ['view_system_overview', 'view_department_analytics', 'view_engineering_module'] },
  { id: 'kpi_system_health', title: 'System Health', category: 'kpi', requiredPermissions: ['view_system_overview', 'view_security_module'] },
  { id: 'kpi_growth_leads', title: 'Department Active Leads', category: 'kpi', requiredPermissions: ['view_growth_module'] },
  { id: 'kpi_finance_quotations', title: 'Pending Quotations', category: 'kpi', requiredPermissions: ['view_finance_module', 'view_executive_summary'] },

  // Quick Action Widgets
  { id: 'action_checkin', title: 'Daily Check-In', category: 'action', requiredPermissions: ['view_employee_workspace'] },
  { id: 'action_tasks', title: 'My Tasks', category: 'action', requiredPermissions: ['view_employee_workspace'] },
  { id: 'action_crm', title: 'Department Leads Hub', category: 'action', requiredPermissions: ['view_growth_module'] },
  { id: 'action_approvals', title: 'Approval Queue', category: 'action', requiredPermissions: ['view_team_queue'] },
  { id: 'action_onboard', title: 'Onboard Employee', category: 'action', requiredPermissions: ['view_hr_module', 'manage_users'] },
  { id: 'action_reports', title: 'System Reports', category: 'action', requiredPermissions: ['view_system_overview', 'view_hr_module'] },

  // Modules & Charts
  { id: 'module_attendance_trend', title: 'Daily Attendance Trend', category: 'chart', requiredPermissions: ['view_system_overview', 'view_hr_module', 'view_department_analytics'], gridSpan: 'col-span-full md:col-span-2' },
  { id: 'module_dept_distribution', title: 'Department Distribution', category: 'chart', requiredPermissions: ['view_system_overview', 'view_hr_module', 'view_department_analytics'], gridSpan: 'col-span-full md:col-span-1' },
  { id: 'module_task_workload', title: 'Task Workload Distribution', category: 'chart', requiredPermissions: ['view_employee_workspace'], gridSpan: 'col-span-full md:col-span-1' },
  { id: 'module_upcoming_tasks', title: 'Upcoming Tasks', category: 'module', requiredPermissions: ['view_employee_workspace'], gridSpan: 'col-span-full md:col-span-1' },
  { id: 'module_my_requests', title: 'Recent Requests', category: 'module', requiredPermissions: ['view_employee_workspace'], gridSpan: 'col-span-full md:col-span-1' },
  { id: 'module_approval_queue', title: 'Approval Queue', category: 'module', requiredPermissions: ['view_team_queue'], gridSpan: 'col-span-full md:col-span-1' },

  // Specialized Domain Modules
  { id: 'module_ops', title: 'Operations Management & SOPs', category: 'module', requiredPermissions: ['view_ops_module'], gridSpan: 'col-span-full' },
  { id: 'module_growth', title: 'Growth Pipeline & Lead Conversion', category: 'module', requiredPermissions: ['view_growth_module'], gridSpan: 'col-span-full' },
  { id: 'module_product', title: 'Product Roadmap & Dependencies', category: 'module', requiredPermissions: ['view_product_module'], gridSpan: 'col-span-full' },
  { id: 'module_design', title: 'Design Team Workload & Assets', category: 'module', requiredPermissions: ['view_design_module'], gridSpan: 'col-span-full' },
  { id: 'module_engineering', title: 'Engineering Projects & Sprint Burndown', category: 'module', requiredPermissions: ['view_engineering_module'], gridSpan: 'col-span-full' },
  { id: 'module_ai', title: 'AI Initiatives & Model Tasks', category: 'module', requiredPermissions: ['view_ai_module'], gridSpan: 'col-span-full' },
  { id: 'module_security', title: 'Security Audits & Access Logs', category: 'module', requiredPermissions: ['view_security_module'], gridSpan: 'col-span-full' },
  { id: 'module_finance', title: 'Financial Compliance & Quotations', category: 'module', requiredPermissions: ['view_finance_module'], gridSpan: 'col-span-full' },
  { id: 'module_intern', title: 'Intern Learning & Hours Tracker', category: 'module', requiredPermissions: ['view_intern_module'], gridSpan: 'col-span-full' },

  // Feeds
  { id: 'feed_recent_activity', title: 'Recent System Activity', category: 'feed', requiredPermissions: ['view_system_overview', 'view_hr_module', 'view_executive_summary'], gridSpan: 'col-span-full md:col-span-1' },
  { id: 'feed_birthdays', title: 'Upcoming Birthdays', category: 'feed', requiredPermissions: ['view_employee_workspace'], gridSpan: 'col-span-full md:col-span-1' },
];
