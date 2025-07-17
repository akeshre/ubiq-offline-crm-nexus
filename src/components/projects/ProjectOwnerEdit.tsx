
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

interface ProjectOwnerEditProps {
  projectId: string;
  currentOwner?: string;
  onSuccess: () => void;
}

const TEAM_MEMBERS = [
  'Arpit',
  'Sarvjeet', 
  'Rahul',
  'Rohit',
  'Praveen'
];

const ProjectOwnerEdit: React.FC<ProjectOwnerEditProps> = ({
  projectId,
  currentOwner,
  onSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(currentOwner || '');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!selectedOwner) {
      toast({
        title: "Error",
        description: "Please select a project owner",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);
      await projectService.updateProjectOwner(projectId, selectedOwner);
      
      toast({
        title: "Success",
        description: "Project owner updated successfully",
      });
      
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating project owner:', error);
      toast({
        title: "Error",
        description: "Failed to update project owner",
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
          Edit Owner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Project Owner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Owner:</label>
            <p className="text-sm text-gray-600">{currentOwner || 'Not assigned'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium">New Owner:</label>
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map((member) => (
                  <SelectItem key={member} value={member}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleUpdate} 
              disabled={updating || !selectedOwner}
              className="flex-1"
            >
              {updating ? "Updating..." : "Update Owner"}
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

export default ProjectOwnerEdit;
