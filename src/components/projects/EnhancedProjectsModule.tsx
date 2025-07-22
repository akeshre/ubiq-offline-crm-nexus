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
import { projectService, type Project } from "@/services/firestoreService";
import { Plus, Briefcase, Clock, CheckCircle, Users, Search, Filter, Grid, List, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import ProjectForm from "./ProjectForm";
import ProjectOwnerEdit from "./ProjectOwnerEdit";

const EnhancedProjectsModule = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [showLost, setShowLost] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, showLost]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, statusFilter, ownerFilter]);

  const loadProjects = async () => {
    if (!user) return;
    
    console.log('🔄 Loading projects in EnhancedProjectsModule...');
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getAll(user.user_id, { showLost });
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.lead_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (ownerFilter !== "all") {
      filtered = filtered.filter(project => project.project_owner === ownerFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'Active').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      paused: projects.filter(p => p.status === 'Paused').length,
    };
  };

  const getUniqueOwners = () => {
    const owners = projects.map(p => p.project_owner).filter(Boolean);
    return [...new Set(owners)];
  };

  const groupProjectsByLead = () => {
    const grouped = filteredProjects.reduce((acc, project) => {
      const leadName = project.lead_name || 'Unknown Lead';
      if (!acc[leadName]) {
        acc[leadName] = [];
      }
      acc[leadName].push(project);
      return acc;
    }, {} as Record<string, Project[]>);

    return Object.entries(grouped).map(([leadName, projects]) => ({
      leadName,
      projects,
      count: projects.length
    }));
  };

  const stats = getStats();

  const renderCardView = () => {
    if (groupBy === 'lead') {
      const groupedData = groupProjectsByLead();
      return (
        <div className="space-y-6">
          {groupedData.map(({ leadName, projects, count }) => (
            <div key={leadName}>
              <h3 className="text-lg font-semibold mb-3">
                {leadName} ({count} Project{count !== 1 ? 's' : ''})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <p className="text-gray-600 text-sm mt-1">{project.company_name}</p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Owner:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{project.project_owner || 'Not assigned'}</span>
                            <ProjectOwnerEdit
                              projectId={project.id!}
                              currentOwner={project.project_owner}
                              onSuccess={loadProjects}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Due Date:</span>
                          <span className="text-sm">
                            {project.due_date ? format(project.due_date.toDate(), "PPP") : "No date"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Created:</span>
                          <span className="text-sm">{project.createdAt?.toDate().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">{project.company_name}</p>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lead:</span>
                  <span className="text-sm font-medium">{project.lead_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Owner:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{project.project_owner || 'Not assigned'}</span>
                    <ProjectOwnerEdit
                      projectId={project.id!}
                      currentOwner={project.project_owner}
                      onSuccess={loadProjects}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="text-sm">
                    {project.due_date ? format(project.due_date.toDate(), "PPP") : "No date"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">{project.createdAt?.toDate().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No projects found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter !== "all" || ownerFilter !== "all"
                ? "Try adjusting your filters"
                : "Add your first project to get started"
              }
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <p className="font-medium">{project.title}</p>
                </TableCell>
                <TableCell>{project.company_name}</TableCell>
                <TableCell>
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      // Navigate to lead detail page
                      console.log('Navigate to lead:', project.lead_id);
                    }}
                  >
                    {project.lead_name}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{project.project_owner || 'Not assigned'}</span>
                    <ProjectOwnerEdit
                      projectId={project.id!}
                      currentOwner={project.project_owner}
                      onSuccess={loadProjects}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.due_date ? format(project.due_date.toDate(), "PPP") : "No date"}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <p className="text-gray-500 text-lg">No projects found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchTerm || statusFilter !== "all" || ownerFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Add your first project to get started"
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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Track and manage ongoing projects</p>
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
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              <ProjectForm 
                onSuccess={() => {
                  setIsFormOpen(false);
                  loadProjects();
                }}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-600" />
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
                placeholder="Search projects..."
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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {getUniqueOwners().map((owner) => (
                <SelectItem key={owner} value={owner!}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Grouping</SelectItem>
              <SelectItem value="lead">Group by Lead</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showLost ? "default" : "outline"}
            onClick={() => setShowLost(!showLost)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showLost ? "Hide Lost" : "Show Lost"}
          </Button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
        {(searchTerm || statusFilter !== "all" || ownerFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setOwnerFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Projects Display */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      ) : viewMode === 'card' ? renderCardView() : renderTableView()}
    </div>
  );
};

export default EnhancedProjectsModule;