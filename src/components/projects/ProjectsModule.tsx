
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProjects, getContacts, Project, Contact } from "@/utils/dataUtils";
import { Plus, Calendar, Users, DollarSign } from "lucide-react";

const ProjectsModule = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    setProjects(getProjects());
    setContacts(getContacts());
  }, []);

  const getClientName = (clientId: string) => {
    const contact = contacts.find(c => c.contact_id === clientId);
    return contact ? contact.company_name : "Unknown Client";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track project delivery</p>
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
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'Completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.project_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{project.project_name}</CardTitle>
                  <p className="text-gray-600 mt-1">{getClientName(project.client_id)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Project Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                  <div className="space-y-1">
                    {project.service_type.map((service, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Timeline
                  </h4>
                  <div className="text-sm text-gray-600">
                    {project.start_date && (
                      <p>Start: {new Date(project.start_date).toLocaleDateString()}</p>
                    )}
                    {project.end_date && (
                      <p>End: {new Date(project.end_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {/* Team */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Team
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">CTO:</span> {project.assigned_cto}</p>
                    {project.team_members && project.team_members.length > 0 && (
                      <p><span className="font-medium">Team:</span> {project.team_members.join(', ')}</p>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Budget
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Budget:</span> {formatCurrency(project.budget)}</p>
                    {project.actual_cost && (
                      <p><span className="font-medium">Spent:</span> {formatCurrency(project.actual_cost)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              {project.technology_stack && project.technology_stack.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Technology Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technology_stack.map((tech, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {project.description && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No projects found</p>
          <p className="text-gray-400 mt-2">Create your first project to get started</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsModule;
