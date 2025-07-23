import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { taskService, dealService, projectService, type Task, type Deal, type Project } from "@/services/firestoreService";
import { Plus, Calendar, AlertTriangle, Search, Filter, Trash2, Clock, CheckCircle, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import TaskForm from "./TaskForm";

const EnhancedTasksModule = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTasks();
      loadDeals();
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const loadTasks = async () => {
    if (!user) return;
    
    console.log('🔄 Loading tasks in EnhancedTasksModule...');
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getAll(user.user_id);
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

  const loadDeals = async () => {
    if (!user) return;
    
    try {
      const fetchedDeals = await dealService.getAll(user.user_id, { showLost: true });
      setDeals(fetchedDeals);
    } catch (error) {
      console.error('❌ Failed to load deals for tasks:', error);
    }
  };

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      const fetchedProjects = await projectService.getAll(user.user_id, { showLost: true });
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('❌ Failed to load projects for tasks:', error);
    }
  };

  const applyFilters = () => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleDelete = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      return;
    }

    try {
      await taskService.delete(taskId);
      await loadTasks();
      toast({
        title: "Task deleted",
        description: `${taskTitle} has been removed.`,
      });
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      await loadTasks();
      toast({
        title: "Status updated",
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const getDealName = (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.deal_name : "Unknown Deal";
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : "Unknown Project";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => t.status === 'Overdue').length,
    };
  };

  const stats = getStats();

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTasks.map((task) => (
        <Card key={task.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{task.taskTitle}</CardTitle>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
              </div>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task.id!, value as Task['status'])}
                >
                  <SelectTrigger className="w-32">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="text-sm">
                  {task.due_date instanceof Date ? format(task.due_date, "PPP") : 
                   task.due_date ? format(task.due_date.toDate(), "PPP") : "No date"}
                </span>
              </div>

              {(task.linked_deal_id || task.linked_project_id) && (
                <div className="space-y-1">
                  {task.linked_deal_id && (
                    <Badge variant="outline" className="text-xs">
                      Deal: {getDealName(task.linked_deal_id)}
                    </Badge>
                  )}
                  {task.linked_project_id && (
                    <Badge variant="outline" className="text-xs">
                      Project: {getProjectName(task.linked_project_id)}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(task.id!, task.taskTitle)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {filteredTasks.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your filters"
              : "Add your first task to get started"
            }
          </p>
        </div>
      )}
    </div>
  );

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Linked To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{task.taskTitle}</p>
                    {task.description && (
                      <p className="text-sm text-gray-600 truncate max-w-xs">{task.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(task.id!, value as Task['status'])}
                  >
                    <SelectTrigger className="w-32">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.due_date instanceof Date ? format(task.due_date, "PPP") : 
                   task.due_date ? format(task.due_date.toDate(), "PPP") : "No date"}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {task.linked_deal_id && (
                      <Badge variant="outline" className="text-xs">
                        Deal: {getDealName(task.linked_deal_id)}
                      </Badge>
                    )}
                    {task.linked_project_id && (
                      <Badge variant="outline" className="text-xs">
                        Project: {getProjectName(task.linked_project_id)}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(task.id!, task.taskTitle)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-gray-500 text-lg">No tasks found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Add your first task to get started"
                    }
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage and track tasks across deals and projects</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <Grid className="w-4 h-4 mr-2" />
              Cards
            </Button>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => {
                  console.log('🔄 New Task button clicked, opening dialog');
                  setIsFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              {isFormOpen && (
                <TaskForm 
                  onSuccess={() => {
                    console.log('✅ Task created successfully, closing dialog');
                    setIsFormOpen(false);
                    loadTasks();
                  }}
                  onCancel={() => {
                    console.log('❌ Task creation cancelled, closing dialog');
                    setIsFormOpen(false);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
        {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Tasks Display */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : viewMode === 'card' ? renderCardView() : renderTableView()}
    </div>
  );
};

export default EnhancedTasksModule;
