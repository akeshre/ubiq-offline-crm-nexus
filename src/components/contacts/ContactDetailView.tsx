
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { projectService, dealService, type Project, type Deal, type Contact } from "@/services/firestoreService";
import { ArrowLeft, Building, Calendar, Users, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
}

const ContactDetailView: React.FC<ContactDetailViewProps> = ({ contact, onBack }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user && contact.id) {
      loadContactProjects();
    }
  }, [user, contact.id]);

  const loadContactProjects = async () => {
    if (!user || !contact.id) return;
    
    console.log('🔍 Loading projects for contact:', contact.id);
    try {
      setLoading(true);
      const [contactProjects, allDeals] = await Promise.all([
        projectService.getByLead(user.user_id, contact.id),
        dealService.getAll(user.user_id, { showLost: true })
      ]);
      
      setProjects(contactProjects);
      setDeals(allDeals);
    } catch (error) {
      console.error('❌ Failed to load contact projects:', error);
      toast({
        title: "Error",
        description: "Failed to load contact projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'Prospect': return 'bg-blue-100 text-blue-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contacts
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
          <p className="text-gray-600 mt-1">{contact.company_name} • {contact.email}</p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contact Status</p>
                <Badge className={getContactStatusColor(contact.status)}>
                  {contact.status}
                </Badge>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projects Led</p>
                <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'Active').length}
                </p>
              </div>
              <Building className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Email:</span> {contact.email}</p>
                <p><span className="font-medium">Phone:</span> {contact.phone}</p>
                <p><span className="font-medium">Company:</span> {contact.company_name}</p>
                {contact.designation && (
                  <p><span className="font-medium">Designation:</span> {contact.designation}</p>
                )}
                {contact.industry && (
                  <p><span className="font-medium">Industry:</span> {contact.industry}</p>
                )}
                {contact.source && (
                  <p><span className="font-medium">Source:</span> {contact.source}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Additional Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Status:</span> {contact.status}</p>
                <p><span className="font-medium">Created:</span> {contact.createdAt?.toDate().toLocaleDateString()}</p>
                {contact.last_activity && (
                  <p><span className="font-medium">Last Activity:</span> {contact.last_activity.toDate().toLocaleDateString()}</p>
                )}
                {contact.assigned_to && (
                  <p><span className="font-medium">Assigned To:</span> {contact.assigned_to}</p>
                )}
              </div>
              
              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-gray-900 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {contact.notes && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{contact.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Led Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Projects Led ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Deal Linked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Team Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{getDealName(project.linked_deal_id)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.due_date ? format(project.due_date.toDate(), "MMM dd, yyyy") : "No due date"}
                    </TableCell>
                    <TableCell>{project.assigned_team?.length || 0} members</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No projects found</p>
              <p className="text-gray-400 text-sm mt-2">
                This contact is not currently leading any projects
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactDetailView;
