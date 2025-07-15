
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Contact, contactService, dealService, projectService } from "@/services/firestoreService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContactCard from "./ContactCard";
import ExcelImport from "./ExcelImport";
import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ContactsModule = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "Prospect" as "Prospect" | "Win" | "Lose"
    }
  });

  const fetchContacts = async () => {
    if (!user) return;
    
    console.log('📋 Fetching contacts for user:', user.user_id);
    try {
      setLoading(true);
      const contactsData = await contactService.getAll(user.user_id);
      console.log('📊 Contacts data loaded:', contactsData.length, 'contacts');
      setContacts(contactsData);
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  const handleSubmit = async (data: any) => {
    if (!user) return;
    
    console.log('📝 Contact creation:', data);
    
    try {
      const contactData = {
        ...data,
        userRef: user.user_id
      };
      
      console.log('🔥 Submitting contact data to Firestore:', contactData);
      await contactService.create(contactData);
      console.log('✅ Contact created successfully');

      if (data.status === 'Win') {
        console.log('🎯 Contact marked as Win - will auto-convert to Active Client and move to Deals');
      }
      
      form.reset();
      await fetchContacts();
      
      toast({
        title: "Contact added successfully",
        description: `${data.name} has been added to your contacts.`,
      });
    } catch (error) {
      console.error('❌ Error creating contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (contactId: string, newStatus: Contact['status']) => {
    if (!user) return;

    console.log('🔄 Contact status change:', { contactId, newStatus });

    try {
      // Update contact status in Firestore
      await updateDoc(doc(db, 'contacts', contactId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      // Update local state
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? { ...contact, status: newStatus } : contact
      ));

      const contact = contacts.find(c => c.id === contactId);
      
      // Handle Win status - create deal and project
      if (newStatus === 'Win' && contact) {
        console.log('🎯 Creating deal and project for Win contact:', contact.name);
        
        // Create deal
        const dealData = {
          contactRef: contactId,
          dealName: `Deal for ${contact.company}`,
          value: 50000, // Default value
          status: 'Completed' as const,
          startDate: Timestamp.now(),
          endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          userRef: user.user_id
        };
        
        console.log('🔥 Creating deal:', dealData);
        const dealId = await dealService.create(dealData);
        
        // Create project
        const projectData = {
          dealRef: dealId,
          title: `Project: ${contact.company}`,
          status: 'Active' as const,
          userRef: user.user_id
        };
        
        console.log('🔥 Creating project:', projectData);
        await projectService.create(projectData);
        
        console.log('✅ Deal and project created for Win contact');
      }

      // Handle Lose status - would hide/remove projects in real implementation
      if (newStatus === 'Lose' && contact) {
        console.log('❌ Contact marked as Lose - associated projects should be hidden/removed');
      }

      toast({
        title: "Status Updated",
        description: `${contact?.name} status changed to ${newStatus}`,
      });

    } catch (error) {
      console.error('❌ Error updating contact status:', error);
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your business contacts and leads</p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelImport onImportComplete={fetchContacts} />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">Add Contact</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Prospect">Prospect</SelectItem>
                            <SelectItem value="Win">Win</SelectItem>
                            <SelectItem value="Lose">Lose</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Add Contact</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onStatusChange={handleStatusChange}
            />
          ))}
          
          {contacts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No contacts found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first contact to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsModule;
