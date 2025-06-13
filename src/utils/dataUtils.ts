
import { v4 as uuidv4 } from 'uuid';

// Data type definitions
export interface Contact {
  contact_id: string;
  company_name: string;
  contact_person: string;
  title?: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  website?: string;
  industry: 'Technology' | 'Healthcare' | 'Finance' | 'Retail' | 'Manufacturing' | 'Other';
  category: 'Prospect' | 'Active Client' | 'Past Client' | 'Partner';
  source: 'Website' | 'Cold Outreach' | 'Referral' | 'Event' | 'Inbound' | 'Social Media';
  assigned_to: 'Founder' | 'CEO';
  notes?: string;
  tags?: string[];
  social_profiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  created_date: string;
  modified_date: string;
  last_contact_date?: string;
  contact_frequency: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly';
}

export interface Deal {
  deal_id: string;
  contact_id: string;
  deal_name: string;
  description?: string;
  value?: number;
  currency: 'USD' | 'EUR' | 'INR';
  probability: number;
  stage: 'Lead' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  expected_close_date?: string;
  actual_close_date?: string;
  proposal_sent_date?: string;
  assigned_to: 'Founder' | 'CEO';
  services_requested?: string[];
  competition?: string;
  decision_makers?: string[];
  deal_source: 'Inbound' | 'Outbound' | 'Referral' | 'Partner';
  lost_reason?: string;
  created_date: string;
  modified_date: string;
  notes?: string;
  attachments?: string[];
}

export interface Project {
  project_id: string;
  client_id: string;
  deal_id?: string;
  project_name: string;
  service_type: string[];
  technology_stack?: string[];
  start_date?: string;
  end_date?: string;
  actual_end_date?: string;
  status: 'Planned' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  assigned_cto: string;
  team_members?: string[];
  budget?: number;
  actual_cost?: number;
  description?: string;
  objectives?: string[];
  deliverables?: string[];
  milestones?: Milestone[];
  risks?: string[];
  client_satisfaction?: number;
}

export interface Milestone {
  milestone_id: string;
  name: string;
  description?: string;
  due_date?: string;
  completion_date?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  deliverables?: string[];
  approval_required: boolean;
  approved_by?: string;
  approval_date?: string;
}

export interface Task {
  task_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  created_by: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
  due_date?: string;
  start_date?: string;
  completion_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  related_to?: {
    type: 'contact' | 'deal' | 'project';
    id: string;
  };
  tags?: string[];
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    created_date: string;
  }>;
  attachments?: string[];
}

export interface Activity {
  activity_id: string;
  contact_id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Proposal' | 'Follow-up';
  subject: string;
  description?: string;
  date: string;
  duration?: number;
  outcome: 'Successful' | 'No Response' | 'Scheduled Follow-up' | 'Closed';
  follow_up_date?: string;
  follow_up_reminder: boolean;
  created_by: string;
  attachments?: string[];
}

// Storage keys
const STORAGE_KEYS = {
  CONTACTS: 'ubiq_contacts',
  DEALS: 'ubiq_deals',
  PROJECTS: 'ubiq_projects',
  TASKS: 'ubiq_tasks',
  ACTIVITIES: 'ubiq_activities',
  INITIALIZED: 'ubiq_data_initialized'
};

// Initialize sample data
export const initializeSampleData = () => {
  if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    return; // Data already initialized
  }

  // Sample Contacts
  const sampleContacts: Contact[] = [
    // Prospects
    {
      contact_id: uuidv4(),
      company_name: "TechStart Inc",
      contact_person: "John Smith",
      title: "CTO",
      email: "john.smith@techstart.com",
      phone: "+1-555-0123",
      industry: "Technology",
      category: "Prospect",
      source: "Website",
      assigned_to: "Founder",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
      contact_frequency: "Weekly",
      notes: "Interested in AI/ML solutions for their platform."
    },
    {
      contact_id: uuidv4(),
      company_name: "Innovation Labs",
      contact_person: "Sarah Johnson",
      title: "Product Manager",
      email: "sarah@innovationlabs.com",
      phone: "+1-555-0124",
      industry: "Technology",
      category: "Prospect",
      source: "Cold Outreach",
      assigned_to: "CEO",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
      contact_frequency: "Bi-weekly"
    },
    {
      contact_id: uuidv4(),
      company_name: "HealthTech Solutions",
      contact_person: "Dr. Michael Chen",
      title: "Chief Medical Officer",
      email: "m.chen@healthtech.com",
      phone: "+1-555-0125",
      industry: "Healthcare",
      category: "Prospect",
      source: "Referral",
      assigned_to: "Founder",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
      contact_frequency: "Monthly"
    },
    // Active Clients
    {
      contact_id: uuidv4(),
      company_name: "Digital Solutions Corp",
      contact_person: "Lisa Wang",
      title: "VP of Technology",
      email: "lisa.wang@digitalsolutions.com",
      phone: "+1-555-0126",
      industry: "Technology",
      category: "Active Client",
      source: "Referral",
      assigned_to: "CEO",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
      contact_frequency: "Weekly"
    },
    {
      contact_id: uuidv4(),
      company_name: "Finance Forward",
      contact_person: "Robert Davis",
      title: "Director of IT",
      email: "r.davis@financeforward.com",
      phone: "+1-555-0127",
      industry: "Finance",
      category: "Active Client",
      source: "Inbound",
      assigned_to: "Founder",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
      contact_frequency: "Bi-weekly"
    }
  ];

  // Sample Deals
  const sampleDeals: Deal[] = [
    {
      deal_id: uuidv4(),
      contact_id: sampleContacts[0].contact_id,
      deal_name: "AI Platform Integration",
      description: "Custom AI/ML solution for customer analytics",
      value: 75000,
      currency: "USD",
      probability: 60,
      stage: "Proposal Sent",
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_to: "Founder",
      services_requested: ["AI/ML", "Web Development"],
      deal_source: "Inbound",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString()
    },
    {
      deal_id: uuidv4(),
      contact_id: sampleContacts[1].contact_id,
      deal_name: "Mobile App Development",
      description: "Cross-platform mobile application",
      value: 45000,
      currency: "USD",
      probability: 80,
      stage: "Negotiation",
      expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_to: "CEO",
      services_requested: ["Mobile Development"],
      deal_source: "Outbound",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString()
    }
  ];

  // Sample Projects
  const sampleProjects: Project[] = [
    {
      project_id: uuidv4(),
      client_id: sampleContacts[3].contact_id,
      project_name: "E-commerce Platform Redesign",
      service_type: ["Web Development", "UI/UX Design"],
      technology_stack: ["React", "Node.js", "MongoDB"],
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: "In Progress",
      assigned_cto: "CTO One",
      team_members: ["Developer One", "Developer Two"],
      budget: 60000,
      description: "Complete redesign of existing e-commerce platform",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString()
    }
  ];

  // Sample Tasks
  const sampleTasks: Task[] = [
    {
      task_id: uuidv4(),
      title: "Prepare AI proposal presentation",
      description: "Create slides for TechStart Inc proposal meeting",
      assigned_to: "Developer One",
      created_by: "Founder",
      priority: "High",
      status: "In Progress",
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_hours: 8,
      related_to: {
        type: "deal",
        id: sampleDeals[0].deal_id
      }
    }
  ];

  // Sample Activities
  const sampleActivities: Activity[] = [
    {
      activity_id: uuidv4(),
      contact_id: sampleContacts[0].contact_id,
      type: "Call",
      subject: "Initial discovery call",
      description: "Discussed AI/ML requirements and timeline",
      date: new Date().toISOString(),
      duration: 45,
      outcome: "Successful",
      follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      follow_up_reminder: true,
      created_by: "Founder"
    }
  ];

  // Store sample data
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(sampleContacts));
  localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(sampleDeals));
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(sampleProjects));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(sampleTasks));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(sampleActivities));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
};

// CRUD operations for Contacts
export const getContacts = (): Contact[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  return data ? JSON.parse(data) : [];
};

export const saveContact = (contact: Contact): void => {
  const contacts = getContacts();
  const existingIndex = contacts.findIndex(c => c.contact_id === contact.contact_id);
  
  if (existingIndex >= 0) {
    contacts[existingIndex] = { ...contact, modified_date: new Date().toISOString() };
  } else {
    contacts.push(contact);
  }
  
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
};

export const deleteContact = (contactId: string): void => {
  const contacts = getContacts().filter(c => c.contact_id !== contactId);
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
};

// CRUD operations for Deals
export const getDeals = (): Deal[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DEALS);
  return data ? JSON.parse(data) : [];
};

export const saveDeal = (deal: Deal): void => {
  const deals = getDeals();
  const existingIndex = deals.findIndex(d => d.deal_id === deal.deal_id);
  
  if (existingIndex >= 0) {
    deals[existingIndex] = { ...deal, modified_date: new Date().toISOString() };
  } else {
    deals.push(deal);
  }
  
  localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
};

export const deleteDeal = (dealId: string): void => {
  const deals = getDeals().filter(d => d.deal_id !== dealId);
  localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
};

// CRUD operations for Projects
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.project_id === project.project_id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const deleteProject = (projectId: string): void => {
  const projects = getProjects().filter(p => p.project_id !== projectId);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

// CRUD operations for Tasks
export const getTasks = (): Task[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const saveTask = (task: Task): void => {
  const tasks = getTasks();
  const existingIndex = tasks.findIndex(t => t.task_id === task.task_id);
  
  if (existingIndex >= 0) {
    tasks[existingIndex] = task;
  } else {
    tasks.push(task);
  }
  
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const deleteTask = (taskId: string): void => {
  const tasks = getTasks().filter(t => t.task_id !== taskId);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// CRUD operations for Activities
export const getActivities = (): Activity[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  return data ? JSON.parse(data) : [];
};

export const saveActivity = (activity: Activity): void => {
  const activities = getActivities();
  const existingIndex = activities.findIndex(a => a.activity_id === activity.activity_id);
  
  if (existingIndex >= 0) {
    activities[existingIndex] = activity;
  } else {
    activities.push(activity);
  }
  
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
};

export const deleteActivity = (activityId: string): void => {
  const activities = getActivities().filter(a => a.activity_id !== activityId);
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
};

// Search functionality
export const searchAll = (query: string) => {
  const contacts = getContacts();
  const deals = getDeals();
  const projects = getProjects();
  const tasks = getTasks();

  const results = {
    contacts: contacts.filter(c => 
      c.company_name.toLowerCase().includes(query.toLowerCase()) ||
      c.contact_person.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    ),
    deals: deals.filter(d => 
      d.deal_name.toLowerCase().includes(query.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(query.toLowerCase()))
    ),
    projects: projects.filter(p => 
      p.project_name.toLowerCase().includes(query.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
    ),
    tasks: tasks.filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
    )
  };

  return results;
};
