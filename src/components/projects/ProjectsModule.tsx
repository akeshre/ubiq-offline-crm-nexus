
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { projectService, dealService, type Project, type Deal } from "@/services/firestoreService";
import { Plus, Calendar, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ProjectsModule = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProjects();
      loadDeals();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    console.log('🔄 Loading projects in ProjectsModule...');
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getAll(user.user_id);
      console.log('🔗 Deal linkage for projects:', fetchedProjects.map(p => ({ id: p.id, linked_deal_id: p.linked_deal_id })));
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
      const fetchedDeals = await dealService.getAll(user.user_id);
      setDeals(fetchedDeals);
    } catch (error) {
      console.error('❌ Failed to load deals for projects:', error);
    }
  };

  const getDealName = (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.deal_name : "Unknown Deal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeCounts = projects.filter(p => p.status === 'Active').length;
  const completedCounts = projects.filter(p => p.status === 'Completed').length;

  console.log('📈 Counts breakdown - Active:', activeCounts, 'Completed:', completedCounts);

  return (
    <div className="p-6">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-green-600">{activeCounts}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                <p className="text-2xl font-bold text-gray-600">{completedCounts}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <p className="text-gray-600 mt-1">Linked to: {getDealName(project.linked_deal_id)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
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

                {/* Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Add Task
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No projects found</p>
          <p className="text-gray-400 mt-2">Projects are automatically created from completed deals</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsModule;
