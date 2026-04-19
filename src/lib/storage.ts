// Local storage data management
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'pentester' | 'stakeholder';
  status: 'active' | 'inactive';
  projects: number;
  lastActive: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'Web' | 'Network' | 'API' | 'Mobile';
  status: 'Open' | 'In Progress' | 'Completed';
  assignedTo: string;
  deadline: string;
  progress: number;
  vulnerabilities: number;
  scope: string;
  createdAt: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  domain: string;
  status: 'Open' | 'In Progress' | 'Remediated' | 'Verified';
  discoveredDate: string;
  dueDate: string;
  assignedTo: string;
  projectId: string;
}

export interface Report {
  id: string;
  title: string;
  submittedBy: string;
  submittedDate: string;
  project: string;
  status: 'Received' | 'Under Review' | 'Shared' | 'Remediated';
  vulnerabilities: number;
  evidence: number;
  projectId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  recipient: 'All Pentesters' | 'All Stakeholders' | 'Specific User';
  recipientName?: string;
  sentDate: string;
  status: 'Sent' | 'Delivered' | 'Read';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'In QA' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string; // pentester name
  assignedBy: string; // admin name
  projectId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

class StorageService {
  private getKey(type: string): string {
    return `pentesecops_${type}`;
  }

  private getItems<T>(type: string): T[] {
    const data = localStorage.getItem(this.getKey(type));
    return data ? JSON.parse(data) : [];
  }

  private setItems<T>(type: string, items: T[]): void {
    localStorage.setItem(this.getKey(type), JSON.stringify(items));
  }

  // Users
  getUsers(): User[] {
    return this.getItems<User>('users');
  }

  addUser(user: Omit<User, 'id' | 'projects' | 'lastActive' | 'createdAt' | 'status'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `U${String(users.length + 1).padStart(3, '0')}`,
      status: 'active',
      projects: 0,
      lastActive: 'Just now',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.setItems('users', users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    this.setItems('users', users);
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    this.setItems('users', filtered);
    return true;
  }

  // Projects
  getProjects(): Project[] {
    return this.getItems<Project>('projects');
  }

  addProject(project: Omit<Project, 'id' | 'progress' | 'vulnerabilities' | 'createdAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: `P${String(projects.length + 1).padStart(3, '0')}`,
      progress: 0,
      vulnerabilities: 0,
      createdAt: new Date().toISOString(),
    };
    projects.push(newProject);
    this.setItems('projects', projects);
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...updates };
    this.setItems('projects', projects);
    return projects[index];
  }

  deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;
    this.setItems('projects', filtered);
    return true;
  }

  // Vulnerabilities
  getVulnerabilities(): Vulnerability[] {
    return this.getItems<Vulnerability>('vulnerabilities');
  }

  addVulnerability(vuln: Omit<Vulnerability, 'id'>): Vulnerability {
    const vulnerabilities = this.getVulnerabilities();
    const newVuln: Vulnerability = {
      ...vuln,
      id: `V${String(vulnerabilities.length + 1).padStart(3, '0')}`,
    };
    vulnerabilities.push(newVuln);
    this.setItems('vulnerabilities', vulnerabilities);
    return newVuln;
  }

  updateVulnerability(id: string, updates: Partial<Vulnerability>): Vulnerability | null {
    const vulnerabilities = this.getVulnerabilities();
    const index = vulnerabilities.findIndex(v => v.id === id);
    if (index === -1) return null;
    vulnerabilities[index] = { ...vulnerabilities[index], ...updates };
    this.setItems('vulnerabilities', vulnerabilities);
    return vulnerabilities[index];
  }

  deleteVulnerability(id: string): boolean {
    const vulnerabilities = this.getVulnerabilities();
    const filtered = vulnerabilities.filter(v => v.id !== id);
    if (filtered.length === vulnerabilities.length) return false;
    this.setItems('vulnerabilities', filtered);
    return true;
  }

  // Reports
  getReports(): Report[] {
    return this.getItems<Report>('reports');
  }

  addReport(report: Omit<Report, 'id'>): Report {
    const reports = this.getReports();
    const newReport: Report = {
      ...report,
      id: `R${String(reports.length + 1).padStart(3, '0')}`,
    };
    reports.push(newReport);
    this.setItems('reports', reports);
    return newReport;
  }

  updateReport(id: string, updates: Partial<Report>): Report | null {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) return null;
    reports[index] = { ...reports[index], ...updates };
    this.setItems('reports', reports);
    return reports[index];
  }

  deleteReport(id: string): boolean {
    const reports = this.getReports();
    const filtered = reports.filter(r => r.id !== id);
    if (filtered.length === reports.length) return false;
    this.setItems('reports', filtered);
    return true;
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.getItems<Notification>('notifications');
  }

  addNotification(notification: Omit<Notification, 'id' | 'sentDate' | 'status'>): Notification {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `N${String(notifications.length + 1).padStart(3, '0')}`,
      sentDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'Sent',
    };
    notifications.unshift(newNotification);
    this.setItems('notifications', notifications);
    return newNotification;
  }

  deleteNotification(id: string): boolean {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    if (filtered.length === notifications.length) return false;
    this.setItems('notifications', filtered);
    return true;
  }

  // Tasks
  getTasks(): Task[] {
    return this.getItems<Task>('tasks');
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: `T${String(tasks.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    this.setItems('tasks', tasks);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
    this.setItems('tasks', tasks);
    return tasks[index];
  }

  deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return false;
    this.setItems('tasks', filtered);
    return true;
  }

  getTasksByPentester(pentesterName: string): Task[] {
    return this.getTasks().filter(t => t.assignedTo === pentesterName);
  }

  getTasksByProject(projectId: string): Task[] {
    return this.getTasks().filter(t => t.projectId === projectId);
  }

  // Initialize with sample data if empty
  initializeData(): void {
    if (this.getUsers().length === 0) {
      const users = this.getUsers();
      const sampleUsers = [
        { name: 'Sarah Security', email: 'sarah@pentesecops.com', role: 'pentester' as const, status: 'active' as const },
        { name: 'John Pentester', email: 'john@pentesecops.com', role: 'pentester' as const, status: 'active' as const },
        { name: 'Mike Manager', email: 'mike@client.com', role: 'stakeholder' as const, status: 'active' as const },
        { name: 'Black Raptor', email: 'black@raptor.com', role: 'pentester' as const, status: 'active' as const },
        { name: 'NObi', email: 'nobi@gmail.com', role: 'pentester' as const, status: 'active' as const },
        { name: 'Killua', email: 'killua@gmail.com', role: 'pentester' as const, status: 'active' as const },
        { name: 'Mikasa', email: 'mikasa@gmail.com', role: 'pentester' as const, status: 'active' as const },

      ];
      
      sampleUsers.forEach(userData => {
        const newUser: User = {
          ...userData,
          id: `U${String(users.length + 1).padStart(3, '0')}`,
          projects: 0,
          lastActive: 'Just now',
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
      });
      
      this.setItems('users', users);
    }

    // Initialize sample tasks if empty
    if (this.getTasks().length === 0) {
      const tasks: Task[] = [
        {
          id: 'T001',
          title: 'Implement feedback collector',
          description: 'Add feedback collection mechanism to the application',
          status: 'To Do',
          priority: 'High',
          assignedTo: 'Black Raptor',
          assignedBy: 'Admin',
          projectId: 'P001',
          dueDate: '2025-10-25',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'T002',
          title: 'Update T&C copy with v1.9 from the writers',
          description: 'Update terms and conditions with latest version from writers',
          status: 'In Progress',
          priority: 'Medium',
          assignedTo: 'Black Raptor',
          assignedBy: 'Admin',
          projectId: 'P001',
          dueDate: '2025-10-22',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'T003',
          title: 'Bump version for new API for billing',
          description: 'Update API version for billing module',
          status: 'In Progress',
          priority: 'High',
          assignedTo: 'Black Raptor',
          assignedBy: 'Admin',
          projectId: 'P001',
          dueDate: '2025-10-20',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'T004',
          title: 'Add NPS feedback to wallboard',
          description: 'Integrate NPS feedback display on main wallboard',
          status: 'In QA',
          priority: 'Medium',
          assignedTo: 'Black Raptor',
          assignedBy: 'Admin',
          projectId: 'P002',
          dueDate: '2025-10-23',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'T005',
          title: 'Add analytics events to pricing page',
          description: 'Track user interactions on pricing page',
          status: 'In QA',
          priority: 'Medium',
          assignedTo: 'Black Raptor',
          assignedBy: 'Admin',
          projectId: 'P002',
          dueDate: '2025-10-24',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'T006',
          title: 'Resize the images for the upcoming campaign',
          description: 'Optimize and resize campaign images',
          status: 'Done',
          priority: 'Low',
          assignedTo: 'Black Raptor',
          assignedBy: 'Admin',
          projectId: 'P002',
          dueDate: '2025-10-19',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      this.setItems('tasks', tasks);
    }
  }
}

export const storage = new StorageService();