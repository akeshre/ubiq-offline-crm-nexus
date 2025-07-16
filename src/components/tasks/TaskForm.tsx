import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskService, dealService, projectService, type Deal, type Project } from "@/services/firestoreService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

interface TaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
      const [dealsData, projectsData] = await Promise.all([
        dealService.getAll(user.user_id, { showLost: false }),
        projectService.getAll(user.user_id, { showLost: false })
      ]);
      setDeals(dealsData);
      setProjects(projectsData);
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
      
      const taskData = {
        taskTitle: data.task_name,
        description: data.description || '',
        status: 'Pending' as const,
        priority: data.priority,
        due_date: data.due_date ? Timestamp.fromDate(new Date(data.due_date)) : Timestamp.now(),
        linked_deal_id: data.linked_deal_id || '',
        linked_project_id: data.linked_project_id || '',
        assigned_to: user.user_id,
        userRef: user.user_id
      };

      await taskService.create(taskData);
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="task_name">Task Name</Label>
        <Input
          id="task_name"
          {...register("task_name", { required: "Task name is required" })}
          placeholder="Enter task name"
        />
        {errors.task_name && (
          <p className="text-red-500 text-sm mt-1">{errors.task_name.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter task description"
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select onValueChange={(value) => setValue("priority", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
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

      <div>
        <Label htmlFor="linked_deal_id">Linked Deal (Optional)</Label>
        <Select onValueChange={(value) => setValue("linked_deal_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select deal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id!}>
                {deal.deal_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="linked_project_id">Linked Project (Optional)</Label>
        <Select onValueChange={(value) => setValue("linked_project_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id!}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Task"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
