
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectService, dealService, contactService, type Deal, type Contact } from "@/services/firestoreService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(user.user_id, { showLost: false }),
        contactService.getAll(user.user_id, { showLost: false })
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user) return;

    try {
      setSubmitting(true);
      const selectedDeal = deals.find(d => d.id === data.deal_id);
      const selectedContact = contacts.find(c => c.id === data.lead_id);
      
      const projectData = {
        title: data.project_name,
        linked_deal_id: data.deal_id,
        company_name: selectedDeal?.company_name || '',
        lead_id: data.lead_id,
        lead_name: selectedContact?.name || '',
        status: 'Active' as const,
        due_date: data.due_date ? new Date(data.due_date) : undefined,
        assigned_team: [user.user_id],
        milestones: [],
        userRef: user.user_id
      };

      await projectService.create(projectData);
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="project_name">Project Name</Label>
        <Input
          id="project_name"
          {...register("project_name", { required: "Project name is required" })}
          placeholder="Enter project name"
        />
        {errors.project_name && (
          <p className="text-red-500 text-sm mt-1">{errors.project_name.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="deal_id">Linked Deal</Label>
        <Select onValueChange={(value) => setValue("deal_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select deal" />
          </SelectTrigger>
          <SelectContent>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id!}>
                {deal.deal_name} - {deal.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="lead_id">Project Lead</Label>
        <Select onValueChange={(value) => setValue("lead_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select lead" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id!}>
                {contact.name} - {contact.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          type="date"
          {...register("due_date")}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Project"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
