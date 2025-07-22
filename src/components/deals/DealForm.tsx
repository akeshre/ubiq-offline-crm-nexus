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
import { dealService, contactService, type Contact } from "@/services/firestoreService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

interface DealFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DealForm: React.FC<DealFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const contactsData = await contactService.getAll(user.user_id, { showLost: false });
      setContacts(contactsData);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
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
      const selectedContact = contacts.find(c => c.id === data.contact_id);
      
      const dealData = {
        deal_name: data.deal_name,
        deal_stage: data.deal_stage,
        contact_id: data.contact_id,
        company_id: selectedContact?.company_name || '',
        company_name: selectedContact?.company_name || '',
        value: parseFloat(data.value) || 0,
        start_date: Timestamp.now(),
        end_date: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
        userRef: user.user_id
      };

      await dealService.create(dealData);
      
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="deal_name">Deal Name</Label>
        <Input
          id="deal_name"
          {...register("deal_name", { required: "Deal name is required" })}
          placeholder="Enter deal name"
        />
        {errors.deal_name && (
          <p className="text-red-500 text-sm mt-1">{errors.deal_name.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="deal_stage">Deal Stage</Label>
        <Select onValueChange={(value) => setValue("deal_stage", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Won">Won</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="contact_id">Contact</Label>
        <Select onValueChange={(value) => setValue("contact_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select contact" />
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
        <Label htmlFor="value">Deal Value</Label>
        <Input
          id="value"
          type="number"
          {...register("value")}
          placeholder="Enter deal value"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Deal"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default DealForm;
