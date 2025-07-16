
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
import { projectService, dealService, contactService, type Project, type Deal, type Contact } from "@/services/firestoreService";
import { Plus, Calendar, Users, Search, Filter, Trash2, Building, Target, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";

const EnhancedProjectsModule = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leadFilter, setLeadFilter] = useState<string>("all");
  const [groupByLead, setGroupByLead] = useState(false);
  const [showLost, setShowLost] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, showLost]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, statusFilter, leadFilter]);

  const loadData = async () => {
    if (!user) return;
    
    console.log('🔄 Loading projects data...');
    try {
      setLoading(true);
      const [fetchedProjects, fetchedDeals, fetchedContacts] = await Promise.all([
        projectService.getAll(user.user_id, { showLost }),
        dealService.getAll(user.user_id, { showLost: true }),
        contactService.getAll(user.user_id, { showLost: true })
      ]);
      
      setProjects(fetchedProjects);
      setDeals(fetchedDeals);
      setContacts(fetchedContacts);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load projects data",
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

    if (leadFilter !== "all") {
      filtered = filtered.filter(project => project.lead_id === leadFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This will also remove project references from linked tasks.`)) {
      return;
    }

    try {
      await projectService.delete(projectId);
      await loadData();
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

  const handleLeadClick = (leadId: string) => {
    navigate(`/contacts/${leadId}`);
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

  const getUniqueLeads = () => {
    const leads = projects.map(p => ({ id: p.lead_id, name: p.lead_name }));
    const uniqueLeads = leads.filter((lead, index, self) => 
      index === self.findIndex(l => l.id === lead.id)
    );
    return uniqueLeads;
  };

  const getGroupedProjects = () => {
    if (!groupByLead) return { ungrouped: filteredProjects };
    
    const grouped: { [key: string]: Project[] } = {};
    filteredProjects.forEach(project => {
      const leadKey = project.lead_name || 'Unassigned';
      if (!grouped[leadKey]) {
        grouped[leadKey] = [];
      }
      grouped[leadKey].push(project);
    });
    
    return grouped;
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
  const groupedProjects = getGroupedProjects();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track project delivery with lead assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={viewMode === 'table' ? "default" : "outline"}
            onClick={() => setViewMode('table')}
            size="sm"
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'cards' ? "default" : "outline"}
            onClick={() => setViewMode('cards')}
            size="sm"
          >
            Card View
          </Button>
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
                  loadData();
                }}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
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
                placeholder="Search projects, companies, leads..."
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

          <Select value={leadFilter} onValueChange={setLeadFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              {getUniqueLeads().map(lead => (
                <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={groupByLead ? "default" : "outline"}
            onClick={() => setGroupByLead(!groupByLead)}
            className="whitespace-nowrap"
          >
            Group by Lead
          </Button>

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
        {(searchTerm || statusFilter !== "all" || leadFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setLeadFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Projects Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="space-y-6">
          {groupByLead ? (
            Object.entries(groupedProjects).map(([leadName, leadProjects]) => (
              <Card key={leadName}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {leadName} ({leadProjects.length} projects)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Deal Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>{getDealName(project.linked_deal_id)}</TableCell>
                          <TableCell>{project.company_name}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.due_date ? format(project.due_date.toDate(), "MMM dd, yyyy") : "No due date"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(project.id!, project.title)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Lead Name</TableHead>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 hover:text-blue-800"
                          onClick={() => handleLeadClick(project.lead_id)}
                        >
                          <User className="w-4 h-4 mr-1" />
                          {project.lead_name}
                        </Button>
                      </TableCell>
                      <TableCell>{getDealName(project.linked_deal_id)}</TableCell>
                      <TableCell>{project.company_name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {project.due_date ? format(project.due_date.toDate(), "MMM dd, yyyy") : "No due date"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(project.id!, project.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No projects found</p>
                  <p className="text-gray-400 mt-2">
                    {searchTerm || statusFilter !== "all" || leadFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Projects are automatically created from completed deals"
                    }
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      ) : (
        // Card View
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <p className="text-gray-600 mt-1">
                      Lead: <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600 hover:text-blue-800"
                        onClick={() => handleLeadClick(project.lead_id)}
                      >
                        {project.lead_name}
                      </Button>
                    </p>
                    <p className="text-gray-600">Linked to: {getDealName(project.linked_deal_id)}</p>
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
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Project Info</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Deal Reference:</span> {project.linked_deal_id}</p>
                      <p><span className="font-medium">Status:</span> {project.status}</p>
                      <p><span className="font-medium">Company:</span> {project.company_name}</p>
                      <p><span className="font-medium">Lead:</span> {project.lead_name}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Timeline
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>Created: {project.createdAt?.toDate().toLocaleDateString()}</p>
                      {project.due_date && (
                        <p>Due: {format(project.due_date.toDate(), "MMM dd, yyyy")}</p>
                      )}
                    </div>
                  </div>

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
          ))}
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No projects found</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || statusFilter !== "all" || leadFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Projects are automatically created from completed deals"
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedProjectsModule;
