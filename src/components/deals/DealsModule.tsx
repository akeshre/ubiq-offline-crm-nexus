
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dealService, contactService, type Deal, type Contact } from "@/services/firestoreService";
import { Plus, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

const DealsModule = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [winContacts, setWinContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      dealName: "",
      contactRef: "",
      value: 0,
      status: "Ongoing" as const,
      startDate: "",
      endDate: ""
    }
  });

  const stages = [
    { name: "Ongoing", color: "bg-blue-100" },
    { name: "Completed", color: "bg-green-100" }
  ];

  useEffect(() => {
    loadDeals();
    loadWinContacts();
  }, []);

  const loadDeals = async () => {
    console.log('🔄 Loading deals in DealsModule...');
    try {
      setLoading(true);
      const fetchedDeals = await dealService.getAll();
      setDeals(fetchedDeals);
    } catch (error) {
      console.error('❌ Failed to load deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWinContacts = async () => {
    console.log('🔄 Loading Win contacts for deals...');
    try {
      const contacts = await contactService.getWinContacts();
      setWinContacts(contacts);
    } catch (error) {
      console.error('❌ Failed to load Win contacts:', error);
    }
  };

  const getContactName = (contactId: string) => {
    const contact = winContacts.find(c => c.id === contactId);
    return contact ? contact.company : "Unknown Contact";
  };

  const getDealsByStage = (stageName: string) => {
    return deals.filter(deal => deal.status === stageName);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const onSubmit = async (data: any) => {
    console.log('📝 Deal form input:', data);
    console.log('🔗 Associated contact reference:', data.contactRef);
    
    try {
      setLoading(true);
      
      const dealData = {
        ...data,
        value: Number(data.value),
        startDate: Timestamp.fromDate(new Date(data.startDate)),
        endDate: Timestamp.fromDate(new Date(data.endDate))
      };

      await dealService.create(dealData);
      console.log('✅ Deal creation confirmation');
      
      toast({
        title: "Success",
        description: "Deal created successfully!",
      });

      form.reset();
      setIsDialogOpen(false);
      await loadDeals();
    } catch (error) {
      console.error('❌ Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (value: string) => {
    console.log('📊 Contact selection:', value);
    form.setValue('contactRef', value);
  };

  const handleStatusSelect = (value: string) => {
    console.log('📊 Deal status selection:', value);
    form.setValue('status', value as 'Ongoing' | 'Completed');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-2">Track and manage your sales opportunities</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dealName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter deal name" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactRef"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Contact</FormLabel>
                      <Select onValueChange={handleContactSelect}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {winContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id || ""}>
                              {contact.company} - {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                      <Select onValueChange={handleStatusSelect} defaultValue="Ongoing">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ongoing">Ongoing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Deal"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(deals.reduce((sum, deal) => sum + (deal.value || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deals.filter(d => d.status === 'Ongoing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Deals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deals.filter(d => d.status === 'Completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.name);
          const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
          
          return (
            <div key={stage.name} className="min-h-96">
              <div className={`p-4 rounded-lg ${stage.color} mb-4`}>
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {stageDeals.length} deals • {formatCurrency(stageValue)}
                </p>
              </div>

              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{deal.dealName}</h4>
                      <p className="text-sm text-gray-600 mb-2">{getContactName(deal.contactRef)}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-600">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                      {deal.endDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          Expected: {deal.endDate.toDate().toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {deals.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No deals found</p>
          <p className="text-gray-400 mt-2">Create your first deal from Win status contacts</p>
        </div>
      )}
    </div>
  );
};

export default DealsModule;
