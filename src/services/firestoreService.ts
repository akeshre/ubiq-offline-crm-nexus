import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Enhanced Contact Types
export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  company_id?: string;
  designation?: string;
  industry?: string;
  source?: 'Website' | 'Referral' | 'Outreach' | 'Cold Call' | 'Inbound';
  status: 'Prospect' | 'Negotiation' | 'Won' | 'Lost';
  tags: string[];
  last_activity?: Timestamp;
  assigned_to?: string;
  notes?: string;
  status_timeline: Array<{
    status: 'Prospect' | 'Negotiation' | 'Won' | 'Lost';
    changed_at: Timestamp;
    changed_by?: string;
  }>;
  userRef: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Deal {
  id?: string;
  contact_id: string;
  company_id?: string;
  company_name: string;
  deal_name: string;
  deal_stage: 'Lead' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  value: number;
  assigned_to?: string;
  tasks_count: number;
  linked_project_id?: string;
  start_date: Timestamp;
  end_date: Timestamp;
  userRef: string;
  createdAt: Timestamp;
}

export interface Project {
  id?: string;
  linked_deal_id: string;
  contact_id: string;
  company_id?: string;
  company_name: string;
  title: string;
  status: 'Active' | 'Completed' | 'Paused';
  lead_id: string;
  lead_name: string;
  due_date?: Timestamp;
  milestones: Array<{
    title: string;
    due_date: Timestamp;
    status: 'Pending' | 'In Progress' | 'Completed';
  }>;
  assigned_team: string[];
  timeline?: any;
  time_tracking?: Array<{
    user_id: string;
    hours: number;
    task_id?: string;
    date: Timestamp;
  }>;
  userRef: string;
  createdAt: Timestamp;
}

export interface Task {
  id?: string;
  linked_deal_id?: string;
  linked_project_id?: string;
  linked_contact_id?: string;
  linked_company_id?: string;
  taskTitle: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  assigned_to?: string;
  due_date: Timestamp;
  completed_at?: Timestamp;
  userRef: string;
  createdAt: Timestamp;
}

export interface Company {
  id?: string;
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  address?: string;
  userRef: string;
  createdAt: Timestamp;
}

// Contact Services
export const contactService = {
  async create(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'status_timeline'>) {
    console.log('🔥 Creating enhanced contact with data:', contactData);
    try {
      const enhancedData = {
        ...contactData,
        status_timeline: [{
          status: contactData.status,
          changed_at: Timestamp.now(),
          changed_by: contactData.userRef
        }],
        last_activity: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'contacts'), enhancedData);
      console.log('✅ Enhanced contact created successfully with ID:', docRef.id);
      
      // Auto-create deal if status is Won or Negotiation
      if (contactData.status === 'Won' || contactData.status === 'Negotiation') {
        console.log('🎯 Auto-creating deal for contact status:', contactData.status);
        await dealService.createFromContact(docRef.id, enhancedData);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating enhanced contact:', error);
      throw error;
    }
  },

  async updateStatus(contactId: string, newStatus: Contact['status'], userRef: string) {
    console.log('🔄 Updating contact status:', contactId, 'to', newStatus);
    try {
      const contactRef = doc(db, 'contacts', contactId);
      const contactDoc = await getDoc(contactRef);
      
      if (!contactDoc.exists()) {
        throw new Error('Contact not found');
      }

      const currentData = contactDoc.data() as Contact;
      const updatedTimeline = [
        ...currentData.status_timeline,
        {
          status: newStatus,
          changed_at: Timestamp.now(),
          changed_by: userRef
        }
      ];

      await updateDoc(contactRef, {
        status: newStatus,
        status_timeline: updatedTimeline,
        last_activity: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Handle status change effects
      if (newStatus === 'Won') {
        console.log('🎯 Contact won - creating deal and project');
        await dealService.createFromContact(contactId, { ...currentData, status: newStatus });
      } else if (newStatus === 'Lost') {
        console.log('❌ Contact lost - hiding associated deals and projects');
        // Note: We'll implement visibility rules in the UI layer
      }

      console.log('✅ Contact status updated successfully');
    } catch (error) {
      console.error('❌ Error updating contact status:', error);
      throw error;
    }
  },

  async delete(contactId: string) {
    console.log('🗑️ Deleting contact and all linked records:', contactId);
    try {
      // First get all linked deals
      const dealsQuery = query(collection(db, 'deals'), where('contact_id', '==', contactId));
      const dealsSnapshot = await getDocs(dealsQuery);
      
      // Delete each linked deal and its projects/tasks
      for (const dealDoc of dealsSnapshot.docs) {
        await dealService.delete(dealDoc.id);
      }
      
      // Delete tasks directly linked to contact
      const tasksQuery = query(collection(db, 'tasks'), where('linked_contact_id', '==', contactId));
      const tasksSnapshot = await getDocs(tasksQuery);
      for (const taskDoc of tasksSnapshot.docs) {
        await deleteDoc(doc(db, 'tasks', taskDoc.id));
      }
      
      // Finally delete the contact
      await deleteDoc(doc(db, 'contacts', contactId));
      console.log('✅ Contact and all linked records deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      throw error;
    }
  },

  async getAll(userRef: string, filters?: {
    status?: Contact['status'];
    industry?: string;
    source?: string;
    assigned_to?: string;
    tags?: string[];
    showLost?: boolean;
  }) {
    console.log('🔍 Fetching enhanced contacts for user:', userRef, 'with filters:', filters);
    try {
      let q = query(collection(db, 'contacts'), where('userRef', '==', userRef));
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters?.industry) {
        q = query(q, where('industry', '==', filters.industry));
      }

      if (filters?.source) {
        q = query(q, where('source', '==', filters.source));
      }

      if (filters?.assigned_to) {
        q = query(q, where('assigned_to', '==', filters.assigned_to));
      }

      const querySnapshot = await getDocs(q);
      let contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];

      // Apply client-side filters for complex queries
      if (filters?.tags && filters.tags.length > 0) {
        contacts = contacts.filter(contact => 
          filters.tags!.some(tag => contact.tags?.includes(tag))
        );
      }

      if (!filters?.showLost) {
        contacts = contacts.filter(contact => contact.status !== 'Lost');
      }

      console.log('✅ Fetched enhanced contacts:', contacts.length, 'records');
      return contacts;
    } catch (error) {
      console.error('❌ Error fetching enhanced contacts:', error);
      throw error;
    }
  },

  async getWinContacts(userRef: string) {
    console.log('🏆 Fetching won contacts for user:', userRef);
    try {
      return await this.getAll(userRef, { status: 'Won' });
    } catch (error) {
      console.error('❌ Error fetching won contacts:', error);
      throw error;
    }
  }
};

// Deal Services
export const dealService = {
  async create(dealData: Omit<Deal, 'id' | 'createdAt' | 'tasks_count'>) {
    console.log('🔥 Creating enhanced deal with data:', dealData);
    try {
      const enhancedData = {
        ...dealData,
        tasks_count: 0,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'deals'), enhancedData);
      console.log('✅ Enhanced deal created successfully with ID:', docRef.id);
      
      // Auto-create project if deal is Won
      if (dealData.deal_stage === 'Won') {
        console.log('🚀 Deal won - creating project');
        await projectService.createFromDeal(docRef.id, enhancedData);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating enhanced deal:', error);
      throw error;
    }
  },

  async createFromContact(contactId: string, contactData: any) {
    console.log('🔄 Auto-creating deal from contact:', contactId);
    const dealData = {
      contact_id: contactId,
      company_name: contactData.company_name,
      deal_name: `Deal for ${contactData.company_name}`,
      deal_stage: contactData.status === 'Won' ? 'Won' as const : 'Lead' as const,
      value: 50000,
      start_date: Timestamp.now(),
      end_date: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      userRef: contactData.userRef
    };
    return await this.create(dealData);
  },

  async delete(dealId: string) {
    console.log('🗑️ Deleting deal and linked records:', dealId);
    try {
      // Delete linked projects
      const projectsQuery = query(collection(db, 'projects'), where('linked_deal_id', '==', dealId));
      const projectsSnapshot = await getDocs(projectsQuery);
      for (const projectDoc of projectsSnapshot.docs) {
        await projectService.delete(projectDoc.id);
      }
      
      // Delete linked tasks
      const tasksQuery = query(collection(db, 'tasks'), where('linked_deal_id', '==', dealId));
      const tasksSnapshot = await getDocs(tasksQuery);
      for (const taskDoc of tasksSnapshot.docs) {
        await deleteDoc(doc(db, 'tasks', taskDoc.id));
      }
      
      // Delete the deal
      await deleteDoc(doc(db, 'deals', dealId));
      console.log('✅ Deal and linked records deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting deal:', error);
      throw error;
    }
  },

  async getAll(userRef: string, filters?: {
    deal_stage?: Deal['deal_stage'];
    showLost?: boolean;
  }) {
    console.log('🔍 Fetching enhanced deals for user:', userRef, 'with filters:', filters);
    try {
      let q = query(collection(db, 'deals'), where('userRef', '==', userRef));
      
      if (filters?.deal_stage) {
        q = query(q, where('deal_stage', '==', filters.deal_stage));
      }

      const querySnapshot = await getDocs(q);
      let deals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];

      // Filter out deals linked to lost contacts unless explicitly requested
      if (!filters?.showLost) {
        const contacts = await contactService.getAll(userRef, { showLost: true });
        const lostContactIds = contacts.filter(c => c.status === 'Lost').map(c => c.id);
        deals = deals.filter(deal => !lostContactIds.includes(deal.contact_id));
      }

      console.log('✅ Fetched enhanced deals:', deals.length, 'records');
      return deals;
    } catch (error) {
      console.error('❌ Error fetching enhanced deals:', error);
      throw error;
    }
  }
};

// Project Services
export const projectService = {
  async create(projectData: Omit<Project, 'id' | 'createdAt'>) {
    console.log('🔥 Creating enhanced project with data:', projectData);
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: Timestamp.now()
      });
      console.log('✅ Enhanced project created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating enhanced project:', error);
      throw error;
    }
  },

  async createFromDeal(dealId: string, dealData: any) {
    console.log('🔄 Auto-creating project from deal:', dealId);
    
    // Get contact details for lead info
    const contactDoc = await getDoc(doc(db, 'contacts', dealData.contact_id));
    const contactData = contactDoc.data() as Contact;
    
    const projectData = {
      linked_deal_id: dealId,
      contact_id: dealData.contact_id,
      company_name: dealData.company_name,
      title: `Project: ${dealData.deal_name}`,
      status: 'Active' as const,
      lead_id: dealData.contact_id,
      lead_name: contactData?.name || 'Unknown Lead',
      due_date: dealData.end_date,
      milestones: [],
      assigned_team: [dealData.userRef],
      userRef: dealData.userRef
    };
    return await this.create(projectData);
  },

  async delete(projectId: string) {
    console.log('🗑️ Deleting project and updating linked tasks:', projectId);
    try {
      // Update linked tasks to remove project reference
      const tasksQuery = query(collection(db, 'tasks'), where('linked_project_id', '==', projectId));
      const tasksSnapshot = await getDocs(tasksQuery);
      for (const taskDoc of tasksSnapshot.docs) {
        await updateDoc(doc(db, 'tasks', taskDoc.id), { linked_project_id: null });
      }
      
      // Delete the project
      await deleteDoc(doc(db, 'projects', projectId));
      console.log('✅ Project deleted and task references updated');
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      throw error;
    }
  },

  async getAll(userRef: string, filters?: {
    status?: Project['status'];
    lead_id?: string;
    showLost?: boolean;
  }) {
    console.log('🔍 Fetching enhanced projects for user:', userRef, 'with filters:', filters);
    try {
      let q = query(collection(db, 'projects'), where('userRef', '==', userRef));
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.lead_id) {
        q = query(q, where('lead_id', '==', filters.lead_id));
      }

      const querySnapshot = await getDocs(q);
      let projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      // Filter out projects linked to lost contacts unless explicitly requested
      if (!filters?.showLost) {
        const contacts = await contactService.getAll(userRef, { showLost: true });
        const lostContactIds = contacts.filter(c => c.status === 'Lost').map(c => c.id);
        projects = projects.filter(project => !lostContactIds.includes(project.contact_id));
      }

      console.log('✅ Fetched enhanced projects:', projects.length, 'records');
      return projects;
    } catch (error) {
      console.error('❌ Error fetching enhanced projects:', error);
      throw error;
    }
  },

  async getByLead(userRef: string, leadId: string) {
    console.log('🔍 Fetching projects by lead:', leadId);
    try {
      return await this.getAll(userRef, { lead_id: leadId });
    } catch (error) {
      console.error('❌ Error fetching projects by lead:', error);
      throw error;
    }
  }
};

// Task Services
export const taskService = {
  async create(taskData: Omit<Task, 'id' | 'createdAt'>) {
    console.log('🔥 Creating enhanced task with data:', taskData);
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: Timestamp.now()
      });
      console.log('✅ Enhanced task created successfully with ID:', docRef.id);
      
      // Update tasks count if linked to deal
      if (taskData.linked_deal_id) {
        await this.updateDealTasksCount(taskData.linked_deal_id);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating enhanced task:', error);
      throw error;
    }
  },

  async updateDealTasksCount(dealId: string) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('linked_deal_id', '==', dealId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasksCount = tasksSnapshot.size;
      
      await updateDoc(doc(db, 'deals', dealId), { tasks_count: tasksCount });
      console.log('✅ Updated deal tasks count:', dealId, tasksCount);
    } catch (error) {
      console.error('❌ Error updating deal tasks count:', error);
    }
  },

  async delete(taskId: string) {
    console.log('🗑️ Deleting task:', taskId);
    try {
      // Get task to update deal tasks count if needed
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (taskDoc.exists()) {
        const taskData = taskDoc.data() as Task;
        if (taskData.linked_deal_id) {
          await this.updateDealTasksCount(taskData.linked_deal_id);
        }
      }
      
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ Task deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  },

  async getAll(userRef: string, filters?: {
    status?: Task['status'];
    priority?: Task['priority'];
    overdue?: boolean;
    assigned_to?: string;
  }) {
    console.log('🔍 Fetching enhanced tasks for user:', userRef, 'with filters:', filters);
    try {
      let q = query(collection(db, 'tasks'), where('userRef', '==', userRef));
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }

      if (filters?.assigned_to) {
        q = query(q, where('assigned_to', '==', filters.assigned_to));
      }

      const querySnapshot = await getDocs(q);
      let tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];

      // Check for overdue tasks and update status
      const now = new Date();
      tasks = tasks.map(task => {
        const isOverdue = task.due_date.toDate() < now && task.status !== 'Completed';
        if (isOverdue && task.status !== 'Overdue') {
          this.updateStatus(task.id!, 'Overdue');
          return { ...task, status: 'Overdue' as const };
        }
        return task;
      });

      if (filters?.overdue) {
        tasks = tasks.filter(task => task.status === 'Overdue');
      }

      console.log('✅ Fetched enhanced tasks:', tasks.length, 'records');
      return tasks;
    } catch (error) {
      console.error('❌ Error fetching enhanced tasks:', error);
      throw error;
    }
  },

  async updateStatus(taskId: string, status: Task['status']) {
    console.log('🔄 Updating task status:', taskId, 'to', status);
    try {
      const updateData: any = { status };
      if (status === 'Completed') {
        updateData.completed_at = Timestamp.now();
      }
      
      await updateDoc(doc(db, 'tasks', taskId), updateData);
      console.log('✅ Task status updated successfully');
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      throw error;
    }
  }
};

// Enhanced Analytics Services
export const analyticsService = {
  async getContactsAnalytics(userRef: string) {
    console.log('📊 Fetching contacts analytics for user:', userRef);
    try {
      const contacts = await contactService.getAll(userRef, { showLost: true });
      return {
        total: contacts.length,
        prospect: contacts.filter(c => c.status === 'Prospect').length,
        win: contacts.filter(c => c.status === 'Won').length,
        lose: contacts.filter(c => c.status === 'Lost').length,
        negotiation: contacts.filter(c => c.status === 'Negotiation').length
      };
    } catch (error) {
      console.error('❌ Error fetching contacts analytics:', error);
      throw error;
    }
  },

  async getDealsAnalytics(userRef: string) {
    console.log('📊 Fetching deals analytics for user:', userRef);
    try {
      const deals = await dealService.getAll(userRef, { showLost: true });
      return {
        total: deals.length,
        ongoing: deals.filter(d => d.deal_stage !== 'Won' && d.deal_stage !== 'Lost').length,
        completed: deals.filter(d => d.deal_stage === 'Won').length,
        totalValue: deals.reduce((sum, deal) => sum + deal.value, 0)
      };
    } catch (error) {
      console.error('❌ Error fetching deals analytics:', error);
      throw error;
    }
  },

  async getProjectsAnalytics(userRef: string) {
    console.log('📊 Fetching projects analytics for user:', userRef);
    try {
      const projects = await projectService.getAll(userRef, { showLost: true });
      return {
        total: projects.length,
        active: projects.filter(p => p.status === 'Active').length,
        completed: projects.filter(p => p.status === 'Completed').length
      };
    } catch (error) {
      console.error('❌ Error fetching projects analytics:', error);
      throw error;
    }
  },

  async getTasksAnalytics(userRef: string) {
    console.log('📊 Fetching tasks analytics for user:', userRef);
    try {
      const tasks = await taskService.getAll(userRef);
      return {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        done: tasks.filter(t => t.status === 'Completed').length
      };
    } catch (error) {
      console.error('❌ Error fetching tasks analytics:', error);
      throw error;
    }
  },

  async getProjectsByLeadAnalytics(userRef: string) {
    console.log('📊 Fetching projects by lead analytics for user:', userRef);
    try {
      const projects = await projectService.getAll(userRef, { showLost: true });
      const projectsByLead = projects.reduce((acc, project) => {
        const leadName = project.lead_name || 'Unknown Lead';
        if (!acc[leadName]) {
          acc[leadName] = { count: 0, lead_id: project.lead_id };
        }
        acc[leadName].count++;
        return acc;
      }, {} as Record<string, { count: number; lead_id: string }>);

      return Object.entries(projectsByLead).map(([leadName, data]) => ({
        lead_name: leadName,
        lead_id: data.lead_id,
        project_count: data.count
      }));
    } catch (error) {
      console.error('❌ Error fetching projects by lead analytics:', error);
      throw error;
    }
  },

  async getAdvancedAnalytics(userRef: string) {
    console.log('📊 Fetching advanced analytics for user:', userRef);
    try {
      const [contacts, deals, projects, tasks] = await Promise.all([
        contactService.getAll(userRef, { showLost: true }),
        dealService.getAll(userRef, { showLost: true }),
        projectService.getAll(userRef, { showLost: true }),
        taskService.getAll(userRef)
      ]);

      // Pipeline metrics
      const pipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
      const wonDeals = deals.filter(d => d.deal_stage === 'Won');
      const winRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;
      const avgDealSize = deals.length > 0 ? pipelineValue / deals.length : 0;

      // Conversion funnel
      const prospectContacts = contacts.filter(c => c.status === 'Prospect').length;
      const wonContacts = contacts.filter(c => c.status === 'Won').length;
      const negotiationContacts = contacts.filter(c => c.status === 'Negotiation').length;
      
      // Source analysis
      const sourceAnalysis = contacts.reduce((acc, contact) => {
        const source = contact.source || 'Unknown';
        if (!acc[source]) {
          acc[source] = { count: 0, value: 0 };
        }
        acc[source].count++;
        
        // Add deal value for this contact
        const contactDeals = deals.filter(d => d.contact_id === contact.id);
        acc[source].value += contactDeals.reduce((sum, deal) => sum + deal.value, 0);
        
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      // Industry breakdown
      const industryBreakdown = contacts.reduce((acc, contact) => {
        const industry = contact.industry || 'Unknown';
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const analytics = {
        pipeline: {
          totalValue: pipelineValue,
          winRate: Math.round(winRate),
          avgDealSize: Math.round(avgDealSize),
          activeProjects: projects.filter(p => p.status === 'Active').length
        },
        conversion: {
          prospects: prospectContacts,
          negotiations: negotiationContacts,
          won: wonContacts,
          conversionRate: prospectContacts > 0 ? Math.round((wonContacts / prospectContacts) * 100) : 0
        },
        sources: sourceAnalysis,
        industries: industryBreakdown,
        tasks: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'Completed').length,
          overdue: tasks.filter(t => t.status === 'Overdue').length,
          efficiency: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0
        }
      };

      console.log('📈 Advanced analytics calculated:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching advanced analytics:', error);
      throw error;
    }
  }
};
