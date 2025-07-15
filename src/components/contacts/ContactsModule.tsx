import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { contactService, type Contact } from "@/services/firestoreService";
import { useToast } from "@/hooks/use-toast";

const ContactsModule = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "Prospect" as "Prospect" | "Win" | "Lose"
    }
  });

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    console.log('🔄 Loading contacts in ContactsModule...');
    try {
      setLoading(true);
      const fetchedContacts = await contactService.getAll();
      setContacts(fetchedContacts);
      setFilteredContacts(fetchedContacts);
    } catch (error) {
      console.error('❌ Failed to load contacts:', error);
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
    console.log('📝 Contact form data before submission:', data);
    try {
      setLoading(true);
      await contactService.create(data);
      
      if (data.status === 'Win') {
        console.log('🎯 Moved to Deals');
        toast({
          title: "Success",
          description: "Contact created and moved to Deals!",
        });
      } else {
        toast({
          title: "Success",
          description: "Contact created successfully!",
        });
      }

      form.reset();
      setIsDialogOpen(false);
      await loadContacts(); // Reload contacts
    } catch (error) {
      console.error('❌ Error creating contact:', error);
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSelect = (value: string) => {
    console.log('📊 Dropdown selection - Status:', value);
    form.setValue('status', value as 'Prospect' | 'Win' | 'Lose');
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your business contacts and leads</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} required />
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
                        <Input type="email" placeholder="email@example.com" {...field} required />
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
                        <Input placeholder="+1 (555) 000-0000" {...field} required />
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
                        <Input placeholder="Company name" {...field} required />
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
                      <FormLabel>Prospect Status</FormLabel>
                      <Select onValueChange={handleStatusSelect} defaultValue="Prospect">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
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
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Contact"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{contact.company}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{contact.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contact.status === 'Win' ? 'bg-green-100 text-green-800' :
                  contact.status === 'Prospect' ? 'bg-blue-100 text-blue-800' :
                  contact.status === 'Lose' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {contact.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{contact.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{contact.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No contacts found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search criteria or add a new contact</p>
        </div>
      )}
    </div>
  );
};

export default ContactsModule;
