import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { projectService } from "@/services/firestoreService";
import { useToast } from "@/hooks/use-toast";
import { Edit, User } from "lucide-react";

interface ProjectLeadEditProps {
  projectId: string;
  currentLead?: string;
  onSuccess: () => void;
}

const LEAD_MEMBERS = [
  'Rahul',
  'Rohit', 
  'Arpit',
  'Praveen',
  'sarvjeet'
];

const ProjectLeadEdit: React.FC<ProjectLeadEditProps> = ({
  projectId,
  currentLead,
  onSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(currentLead || '');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!selectedLead) {
      toast({
        title: "Error",
        description: "Please select a lead",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);
      await projectService.updateProjectLead(projectId, selectedLead);
      
      toast({
        title: "Success",
        description: "Project lead updated successfully",
      });
      
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating project lead:', error);
      toast({
        title: "Error",
        description: "Failed to update project lead",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-1" />
          Edit Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] overflow-visible">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Project Lead
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Lead:</label>
            <p className="text-sm text-gray-600">{currentLead || 'Not assigned'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium">New Lead:</label>
            <Select value={selectedLead} onValueChange={setSelectedLead}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select lead member" />
              </SelectTrigger>
              <SelectContent 
                className="z-[100] bg-white border shadow-lg"
                position="popper"
                sideOffset={4}
              >
                {LEAD_MEMBERS.map((member) => (
                  <SelectItem 
                    key={member} 
                    value={member}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleUpdate} 
              disabled={updating || !selectedLead}
              className="flex-1"
            >
              {updating ? "Updating..." : "Update Lead"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectLeadEdit;