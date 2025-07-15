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

// Contact Types
export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation?: string;
  industry?: string;
  source?: string;
  assignedTo?: string;
  notes?: string;
  status: 'Prospect' | 'Win' | 'Lose';
  userRef: string; // Reference to the user who created this contact
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Deal {
  id?: string;
  contactRef: string;
  dealName: string;
  value: number;
  status: 'Ongoing' | 'Completed';
  startDate: Timestamp;
  endDate: Timestamp;
  userRef: string; // Reference to the user who created this deal
  createdAt: Timestamp;
}

export interface Project {
  id?: string;
  dealRef: string;
  title: string;
  status: 'Active' | 'Completed';
  userRef: string; // Reference to the user who created this project
  createdAt: Timestamp;
}

export interface Task {
  id?: string;
  projectRef?: string;
  dealRef?: string;
  taskTitle: string;
  description: string;
  dueDate: Timestamp;
  status: 'Pending' | 'In Progress' | 'Done';
  userRef: string; // Reference to the user who created this task
  createdAt: Timestamp;
}

// Contact Services
export const contactService = {
  async create(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    console.log('🔥 Creating contact with data:', contactData);
    try {
      const docRef = await addDoc(collection(db, 'contacts'), {
        ...contactData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Contact created successfully with ID:', docRef.id);
      
      // If status is Win, automatically create a deal
      if (contactData.status === 'Win') {
        console.log('🎯 Status is Win - moving to Deals');
        await dealService.createFromContact(docRef.id, contactData);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating contact:', error);
      throw error;
    }
  },

  async getAll(userRef: string) {
    console.log('🔍 Fetching all contacts for user:', userRef);
    try {
      const q = query(collection(db, 'contacts'), where('userRef', '==', userRef));
      const querySnapshot = await getDocs(q);
      const contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      console.log('✅ Fetched contacts:', contacts.length, 'records for user:', userRef);
      console.log('📊 Contacts data:', contacts);
      return contacts;
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      throw error;
    }
  },

  async getWinContacts(userRef: string) {
    console.log('🔍 Fetching Win status contacts for user:', userRef);
    try {
      const q = query(
        collection(db, 'contacts'), 
        where('userRef', '==', userRef),
        where('status', '==', 'Win')
      );
      const querySnapshot = await getDocs(q);
      const contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      console.log('✅ Fetched Win contacts:', contacts.length, 'records for user:', userRef);
      return contacts;
    } catch (error) {
      console.error('❌ Error fetching Win contacts:', error);
      throw error;
    }
  }
};

// Deal Services
export const dealService = {
  async create(dealData: Omit<Deal, 'id' | 'createdAt'>) {
    console.log('🔥 Creating deal with data:', dealData);
    try {
      const docRef = await addDoc(collection(db, 'deals'), {
        ...dealData,
        createdAt: Timestamp.now()
      });
      console.log('✅ Deal created successfully with ID:', docRef.id);
      
      // If deal is completed, create a project
      if (dealData.status === 'Completed') {
        console.log('🚀 Deal completed - creating project');
        await projectService.createFromDeal(docRef.id, dealData);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating deal:', error);
      throw error;
    }
  },

  async createFromContact(contactId: string, contactData: any) {
    console.log('🔄 Auto-creating deal from contact:', contactId);
    const dealData = {
      contactRef: contactId,
      dealName: `Deal for ${contactData.company}`,
      value: 50000,
      status: 'Completed' as const,
      startDate: Timestamp.now(),
      endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      userRef: contactData.userRef
    };
    return await this.create(dealData);
  },

  async getAll(userRef: string) {
    console.log('🔍 Fetching all deals for user:', userRef);
    try {
      const q = query(collection(db, 'deals'), where('userRef', '==', userRef));
      const querySnapshot = await getDocs(q);
      const deals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
      console.log('✅ Fetched deals:', deals.length, 'records for user:', userRef);
      console.log('📊 Deals data:', deals);
      return deals;
    } catch (error) {
      console.error('❌ Error fetching deals:', error);
      throw error;
    }
  },

  async getCompletedDeals(userRef: string) {
    console.log('🔍 Fetching completed deals for user:', userRef);
    try {
      const q = query(
        collection(db, 'deals'), 
        where('userRef', '==', userRef),
        where('status', '==', 'Completed')
      );
      const querySnapshot = await getDocs(q);
      const deals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
      console.log('✅ Fetched completed deals:', deals.length, 'records for user:', userRef);
      return deals;
    } catch (error) {
      console.error('❌ Error fetching completed deals:', error);
      throw error;
    }
  }
};

// Project Services
export const projectService = {
  async create(projectData: Omit<Project, 'id' | 'createdAt'>) {
    console.log('🔥 Creating project with data:', projectData);
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: Timestamp.now()
      });
      console.log('✅ Project created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating project:', error);
      throw error;
    }
  },

  async createFromDeal(dealId: string, dealData: any) {
    console.log('🔄 Auto-creating project from deal:', dealId);
    const projectData = {
      dealRef: dealId,
      title: `Project: ${dealData.dealName}`,
      status: 'Active' as const,
      userRef: dealData.userRef
    };
    return await this.create(projectData);
  },

  async getAll(userRef: string) {
    console.log('🔍 Fetching all projects for user:', userRef);
    try {
      const q = query(collection(db, 'projects'), where('userRef', '==', userRef));
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      console.log('✅ Fetched projects:', projects.length, 'records for user:', userRef);
      console.log('📊 Projects data:', projects);
      
      const activeCounts = projects.filter(p => p.status === 'Active').length;
      const completedCounts = projects.filter(p => p.status === 'Completed').length;
      console.log('📈 Project counts - Active:', activeCounts, 'Completed:', completedCounts);
      
      return projects;
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      throw error;
    }
  }
};

// Task Services
export const taskService = {
  async create(taskData: Omit<Task, 'id' | 'createdAt'>) {
    console.log('🔥 Creating task with data:', taskData);
    console.log('🔗 Linked to project/deal:', taskData.projectRef || taskData.dealRef);
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: Timestamp.now()
      });
      console.log('✅ Task created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  },

  async getAll(userRef: string) {
    console.log('🔍 Fetching all tasks for user:', userRef);
    try {
      const q = query(collection(db, 'tasks'), where('userRef', '==', userRef));
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      console.log('✅ Fetched tasks:', tasks.length, 'records for user:', userRef);
      console.log('📊 Tasks data:', tasks);
      return tasks;
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      throw error;
    }
  },

  async updateStatus(taskId: string, status: Task['status']) {
    console.log('🔄 Updating task status:', taskId, 'to', status);
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status });
      console.log('✅ Task status updated successfully');
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      throw error;
    }
  }
};

// Analytics Services
export const analyticsService = {
  async getContactsAnalytics(userRef: string) {
    console.log('📊 Fetching contacts analytics for user:', userRef);
    try {
      const contacts = await contactService.getAll(userRef);
      const analytics = {
        prospect: contacts.filter(c => c.status === 'Prospect').length,
        win: contacts.filter(c => c.status === 'Win').length,
        lose: contacts.filter(c => c.status === 'Lose').length,
        total: contacts.length
      };
      console.log('📈 Contacts analytics:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching contacts analytics:', error);
      throw error;
    }
  },

  async getDealsAnalytics(userRef: string) {
    console.log('📊 Fetching deals analytics for user:', userRef);
    try {
      const deals = await dealService.getAll(userRef);
      const analytics = {
        ongoing: deals.filter(d => d.status === 'Ongoing').length,
        completed: deals.filter(d => d.status === 'Completed').length,
        total: deals.length,
        totalValue: deals.reduce((sum, deal) => sum + deal.value, 0)
      };
      console.log('📈 Deals analytics:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching deals analytics:', error);
      throw error;
    }
  },

  async getProjectsAnalytics(userRef: string) {
    console.log('📊 Fetching projects analytics for user:', userRef);
    try {
      const projects = await projectService.getAll(userRef);
      const analytics = {
        active: projects.filter(p => p.status === 'Active').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        total: projects.length
      };
      console.log('📈 Projects analytics:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching projects analytics:', error);
      throw error;
    }
  },

  async getTasksAnalytics(userRef: string) {
    console.log('📊 Fetching tasks analytics for user:', userRef);
    try {
      const tasks = await taskService.getAll(userRef);
      const analytics = {
        pending: tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        done: tasks.filter(t => t.status === 'Done').length,
        total: tasks.length
      };
      console.log('📈 Tasks analytics:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching tasks analytics:', error);
      throw error;
    }
  }
};
