
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskService, projectService, dealService, type Task, type Project, type Deal } from "@/services/firestoreService";
import { Plus, Clock, CheckSquare, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Timestamp } from "firebase/firestore";

const TasksModule = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      taskTitle: "",
      description: "",
      due_date: "",
      priority: "Medium" as "High" | "Medium" | "Low",
      status: "Pending" as "Pending" | "In Progress" | "Completed",
      linked_project_id: "",
      linked_deal_id: ""
    }
  });

  useEffect(() => {
    if (user) {
      loadTasks();
      loadProjects();
      loadDeals();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    console.log('🔄 Loading tasks in TasksModule...');
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getAll(user.user_id);
      console.log('🔗 Linked project/deal for tasks:', fetchedTasks.map(t => ({ 
        id: t.id, 
        linked_project_id: t.linked_project_id, 
        linked_deal_id: t.linked_deal_id 
      })));
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('❌ Failed to load tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      const fetchedProjects = await projectService.getAll(user.user_id);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('❌ Failed to load projects for tasks:', error);
    }
  };

  const loadDeals = async () => {
    if (!user) return;
    
    try {
      const fetchedDeals = await dealService.getAll(user.user_id);
      setDeals(fetchedDeals);
    } catch (error) {
      console.error('❌ Failed to load deals for tasks:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: any) => {
    if (!dueDate) return false;
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    return due < new Date();
  };

  const tasksByStatus = {
    'Pending': tasks.filter(t => t.status === 'Pending'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Completed': tasks.filter(t => t.status === 'Completed'),
    'Overdue': tasks.filter(t => isOverdue(t.due_date) && t.status !== 'Completed')
  };

  const onSubmit = async (data: any) => {
    if (!user) return;
    
    console.log('📝 Task data input:', data);
    console.log('🔗 Linked project/deal:', data.linked_project_id || data.linked_deal_id);
    
    try {
      setLoading(true);
      
      const taskData = {
        taskTitle: data.taskTitle,
        description: data.description,
        due_date: Timestamp.fromDate(new Date(data.due_date)),
        priority: data.priority,
        status: data.status,
        userRef: user.user_id,
        ...(data.linked_project_id && { linked_project_id: data.linked_project_id }),
        ...(data.linked_deal_id && { linked_deal_id: data.linked_deal_id })
      };

      await taskService.create(taskData);
      
      toast({
        title: "Success",
        description: "Task created successfully!",
      });

      form.reset();
      setIsDialogOpen(false);
      await loadTasks();
    } catch (error) {
      console.error('❌ Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    console.log('🔄 Task status update:', taskId, 'to', newStatus);
    try {
      await taskService.updateStatus(taskId, newStatus);
      await loadTasks();
      toast({
        title: "Success",
        description: "Task status updated!",
      });
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const getLinkedName = (task: Task) => {
    if (task.linked_project_id) {
      const project = projects.find(p => p.id === task.linked_project_id);
      return project ? `Project: ${project.title}` : 'Unknown Project';
    }
    if (task.linked_deal_id) {
      const deal = deals.find(d => d.id === task.linked_deal_id);
      return deal ? `Deal: ${deal.deal_name}` : 'Unknown Deal';
    }
    return 'No Link';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage tasks under projects and deals</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="taskTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Task description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue="Medium">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue="Pending">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="linked_project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Project (Optional)</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id || ""}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="linked_deal_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Deal (Optional)</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a deal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deals.map((deal) => (
                            <SelectItem key={deal.id} value={deal.id || ""}>
                              {deal.deal_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{tasksByStatus['In Progress'].length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{tasksByStatus['Completed'].length}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{tasksByStatus['Overdue'].length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status}>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              {status === 'Overdue' && <AlertCircle className="w-4 h-4 mr-2 text-red-600" />}
              {status} ({statusTasks.length})
            </h3>
            <div className="space-y-3">
              {statusTasks.map((task) => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{task.taskTitle}</h4>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Linked to:</span>
                        <span className="font-medium text-xs">{getLinkedName(task)}</span>
                      </div>
                      
                      {task.due_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Due:</span>
                          <span className={`font-medium ${isOverdue(task.due_date) ? 'text-red-600' : ''}`}>
                            {task.due_date.toDate().toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Status:</span>
                        <Select 
                          onValueChange={(value) => handleStatusUpdate(task.id!, value as Task['status'])}
                          defaultValue={task.status}
                        >
                          <SelectTrigger className="w-auto h-auto p-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-gray-400 mt-2">Create your first task to get started</p>
        </div>
      )}
    </div>
  );
};

export default TasksModule;
