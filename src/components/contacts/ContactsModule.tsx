
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Contact, contactService } from "@/services/firestoreService";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    
    console.log('📝 Contact form submission:', data);
    
    try {
      const contactData = {
        ...data,
        userRef: user.user_id
      };
      
      console.log('🔥 Submitting contact data to Firestore:', contactData);
      await contactService.create(contactData);
      console.log('✅ Contact created successfully');

      // If status is Win, log the auto-conversion
      if (data.status === 'Win') {
        console.log('🎯 Contact marked as Win - will auto-convert to Active Client and move to Deals');
      }
      
      // Reset form and close dialog
      form.reset();
      
      // Refresh contacts list
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

  const getStatusBadge = (status: string) => {
    const variants = {
      'Prospect': 'bg-blue-100 text-blue-800 border-blue-200',
      'Win': 'bg-green-100 text-green-800 border-green-200',
      'Lose': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return variants[status as keyof typeof variants] || variants.Prospect;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your business contacts and leads</p>
        </div>
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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{contact.name}</h3>
                <Badge 
                  className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(contact.status)}`}
                >
                  {contact.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p className="truncate">
                  <span className="font-medium">Email:</span> {contact.email}
                </p>
                <p className="truncate">
                  <span className="font-medium">Phone:</span> {contact.phone}
                </p>
                <p className="truncate">
                  <span className="font-medium">Company:</span> {contact.company}
                </p>
              </div>
              
              {contact.status === 'Win' && (
                <div className="mt-3 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ Active Client
                </div>
              )}
            </div>
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
