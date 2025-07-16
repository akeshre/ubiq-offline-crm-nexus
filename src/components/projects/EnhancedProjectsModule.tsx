
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectService, dealService, type Project, type Deal } from "@/services/firestoreService";
import { Plus, Calendar, Users, Search, Filter, Trash2, Building, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const EnhancedProjectsModule = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showLost, setShowLost] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProjects();
      loadDeals();
    }
  }, [user, showLost]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, statusFilter]);

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

  const loadDeals = async () => {
    if (!user) return;
    
    try {
      const fetchedDeals = await dealService.getAll(user.user_id, { showLost: true });
      setDeals(fetchedDeals);
    } catch (error) {
      console.error('❌ Failed to load deals for projects:', error);
    }
  };

  const applyFilters = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This will also remove project references from linked tasks.`)) {
      return;
    }

    try {
      await projectService.delete(projectId);
      await loadProjects();
      toast({
        title: "Project deleted",
        description: `${projectTitle} has been removed and task references updated.`,
      });
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    }
  };

  const getDealName = (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.deal_name : "Unknown Deal";
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

  const stats = getStats();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track project delivery linked to completed deals</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Building className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paused Projects</p>
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
                placeholder="Search projects, companies..."
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

          <Button
            variant={showLost ? "default" : "outline"}
            onClick={() => setShowLost(!showLost)}
            className="whitespace-nowrap"
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
        {(searchTerm || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <p className="text-gray-600 mt-1">Linked to: {getDealName(project.linked_deal_id)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(project.id!, project.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Project Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Project Info</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Deal Reference:</span> {project.linked_deal_id}</p>
                      <p><span className="font-medium">Status:</span> {project.status}</p>
                      <p><span className="font-medium">Company:</span> {project.company_name}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Timeline
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>Created: {project.createdAt?.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Team */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Team ({project.assigned_team?.length || 0})
                    </h4>
                    <div className="text-sm text-gray-600">
                      {project.assigned_team?.length ? (
                        <p>{project.assigned_team.length} member(s) assigned</p>
                      ) : (
                        <p>No team members assigned</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Milestones</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.milestones.map((milestone, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium text-sm">{milestone.title}</h5>
                            <Badge 
                              variant="outline" 
                              className={milestone.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                        milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-gray-100 text-gray-800'}
                            >
                              {milestone.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Due: {format(milestone.due_date.toDate(), "MMM dd, yyyy")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Add Task
                    </Button>
                    <Button variant="outline" size="sm">
                      Add Milestone
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found</p>
            <p className="text-gray-400 mt-2">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Projects are automatically created from completed deals"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProjectsModule;
