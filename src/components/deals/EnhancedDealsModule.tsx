
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { dealService, Deal, contactService, Contact } from "@/services/firestoreService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Search, Filter, Trash2, DollarSign, TrendingUp, Target, Users } from "lucide-react";
import { Timestamp } from 'firebase/firestore';

const EnhancedDealsModule = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [winContacts, setWinContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [showLost, setShowLost] = useState(false);

  const form = useForm({
    defaultValues: {
      deal_name: "",
      contact_id: "",
      company_name: "",
      value: 0,
      deal_stage: "Lead" as "Lead" | "Proposal Sent" | "Negotiation" | "Won" | "Lost",
      start_date: "",
      end_date: ""
    }
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, showLost]);

  useEffect(() => {
    applyFilters();
  }, [deals, searchTerm, stageFilter]);

  const fetchData = async () => {
    if (!user) return;
    
    console.log('💰 Fetching deals and win contacts for user:', user.user_id);
    try {
      setLoading(true);
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(user.user_id, { showLost }),
        contactService.getWinContacts(user.user_id)
      ]);
      setDeals(dealsData);
      setWinContacts(contactsData);
    } catch (error) {
      console.error('❌ Error fetching deals data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = deals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Stage filter
    if (stageFilter !== "all") {
      filtered = filtered.filter(deal => deal.deal_stage === stageFilter);
    }

    setFilteredDeals(filtered);
  };

  const handleSubmit = async (data: any) => {
    if (!user) return;
    
    console.log('📝 Deal form submission:', data);
    
    try {
      const selectedContact = winContacts.find(c => c.id === data.contact_id);
      
      const dealData = {
        contact_id: data.contact_id,
        company_id: selectedContact?.company_id,
        company_name: selectedContact?.company_name || data.company_name,
        deal_name: data.deal_name,
        deal_stage: data.deal_stage,
        value: Number(data.value),
        start_date: Timestamp.fromDate(new Date(data.start_date)),
        end_date: Timestamp.fromDate(new Date(data.end_date)),
        userRef: user.user_id
      };
      
      await dealService.create(dealData);
      
      form.reset();
      setShowAddForm(false);
      await fetchData();
      
      toast({
        title: "Deal created successfully",
        description: `${data.deal_name} has been added to your deals.`,
      });
    } catch (error) {
      console.error('❌ Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (dealId: string, dealName: string) => {
    if (!confirm(`Are you sure you want to delete "${dealName}" and all its linked projects and tasks?`)) {
      return;
    }

    try {
      await dealService.delete(dealId);
      await fetchData();
      toast({
        title: "Deal deleted",
        description: `${dealName} and all linked records have been removed.`,
      });
    } catch (error) {
      console.error('❌ Error deleting deal:', error);
      toast({
        title: "Error",
        description: "Failed to delete deal.",
        variant: "destructive",
      });
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Lead": return "bg-blue-100 text-blue-800";
      case "Proposal Sent": return "bg-yellow-100 text-yellow-800";
      case "Negotiation": return "bg-orange-100 text-orange-800";
      case "Won": return "bg-green-100 text-green-800";
      case "Lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStats = () => {
    return {
      total: deals.length,
      lead: deals.filter(d => d.deal_stage === 'Lead').length,
      proposal: deals.filter(d => d.deal_stage === 'Proposal Sent').length,
      negotiation: deals.filter(d => d.deal_stage === 'Negotiation').length,
      won: deals.filter(d => d.deal_stage === 'Won').length,
      lost: deals.filter(d => d.deal_stage === 'Lost').length,
      totalValue: deals.reduce((sum, deal) => sum + deal.value, 0)
    };
  };

  const stats = getStats();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-gray-600 mt-2">Manage your deals and track opportunities</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="deal_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter deal name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {winContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id || ""}>
                              {contact.name}
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
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter deal value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deal_stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                          <SelectItem value="Negotiation">Negotiation</SelectItem>
                          <SelectItem value="Won">Won</SelectItem>
                          <SelectItem value="Lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Add Deal</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-xl font-bold text-blue-600">{stats.lead + stats.proposal + stats.negotiation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Won Deals</p>
                <p className="text-xl font-bold text-green-600">{stats.won}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search deals, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showLost ? "default" : "outline"}
            onClick={() => setShowLost(!showLost)}
            className="whitespace-nowrap"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showLost ? "Hide Lost" : "Show Lost"}
          </Button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredDeals.length} of {deals.length} deals
        </p>
        {(searchTerm || stageFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStageFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Deals Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading deals...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.deal_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {winContacts.find(contact => contact.id === deal.contact_id)?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{deal.company_name}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">${deal.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStageColor(deal.deal_stage)}>
                        {deal.deal_stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {deal.start_date instanceof Timestamp ? format(deal.start_date.toDate(), "PPP") : "N/A"}
                    </TableCell>
                    <TableCell>
                      {deal.end_date instanceof Timestamp ? format(deal.end_date.toDate(), "PPP") : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(deal.id!, deal.deal_name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredDeals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <p className="text-gray-500 text-lg">No deals found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {searchTerm || stageFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Add your first deal to get started"
                        }
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDealsModule;
