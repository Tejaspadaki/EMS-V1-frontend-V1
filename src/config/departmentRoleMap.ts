/**
 * Department <-> Role Mapping Configuration
 * Maps organizational departments to their primary roles and vice-versa.
 */

export interface DepartmentRoleMapping {
  department: string;
  code: string;
  leadRole: string;
  memberRoles: string[];
}

export const DEPARTMENT_ROLE_MAPPINGS: DepartmentRoleMapping[] = [
  {
    department: 'Engineering',
    code: 'ENG',
    leadRole: 'Engineering Lead',
    memberRoles: ['CTO', 'Engineering Lead', 'Eng Lead', 'Software Engineer', 'Developer', 'Intern'],
  },
  {
    department: 'Operations',
    code: 'OPS',
    leadRole: 'Operations Lead',
    memberRoles: ['Operations Lead', 'Operations'],
  },
  {
    department: 'Growth',
    code: 'GRW',
    leadRole: 'Growth Lead',
    memberRoles: ['Growth Lead', 'Growth', 'Sales Lead'],
  },
  {
    department: 'Product',
    code: 'PRD',
    leadRole: 'Product Lead',
    memberRoles: ['Product Lead', 'Product'],
  },
  {
    department: 'Design',
    code: 'DSG',
    leadRole: 'Design Lead',
    memberRoles: ['Design Lead', 'UI/UX Lead', 'Designer'],
  },
  {
    department: 'AI & ML',
    code: 'AIML',
    leadRole: 'AI Lead',
    memberRoles: ['AI Lead', 'AI / ML Lead', 'Data Scientist'],
  },
  {
    department: 'Security',
    code: 'SEC',
    leadRole: 'Security Lead',
    memberRoles: ['Security Lead', 'Security'],
  },
  {
    department: 'Finance',
    code: 'FIN',
    leadRole: 'Finance Lead',
    memberRoles: ['Finance Lead', 'Finance'],
  },
  {
    department: 'Human Resources',
    code: 'HR',
    leadRole: 'HR',
    memberRoles: ['HR', 'HR / Admin Executive'],
  },
  {
    department: 'Executive Management',
    code: 'EXEC',
    leadRole: 'CEO',
    memberRoles: ['Super Admin', 'CEO', 'CTO', 'Dept Head'],
  },
];

/**
 * Derives the appropriate Department based on a given Role name.
 */
export const getDepartmentForRole = (roleName: string): string => {
  if (!roleName) return 'General';
  const normRole = roleName.toLowerCase().trim();

  if (normRole.includes('super admin') || normRole.includes('ceo')) return 'Executive Management';
  if (normRole.includes('ops') || normRole.includes('operations')) return 'Operations';
  if (normRole.includes('growth') || normRole.includes('sales')) return 'Growth';
  if (normRole.includes('product')) return 'Product';
  if (normRole.includes('design') || normRole.includes('ui/ux')) return 'Design';
  if (normRole.includes('eng') || normRole.includes('cto') || normRole.includes('developer') || normRole.includes('software')) return 'Engineering';
  if (normRole.includes('ai') || normRole.includes('machine learning')) return 'AI & ML';
  if (normRole.includes('security')) return 'Security';
  if (normRole.includes('finance') || normRole.includes('accounts')) return 'Finance';
  if (normRole.includes('hr') || normRole.includes('human resources')) return 'Human Resources';

  return 'General';
};

/**
 * Returns available Roles associated with a given Department name.
 */
export const getRolesForDepartment = (deptName: string): string[] => {
  if (!deptName) return ['Employee', 'Team Lead', 'Dept Head'];
  const mapping = DEPARTMENT_ROLE_MAPPINGS.find(
    (m) => m.department.toLowerCase() === deptName.toLowerCase() || m.code.toLowerCase() === deptName.toLowerCase()
  );
  return mapping ? mapping.memberRoles : ['Employee', 'Team Lead', 'Dept Head'];
};
