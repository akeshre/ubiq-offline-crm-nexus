
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Contact, contactService } from "@/services/firestoreService";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import EnhancedContactCard from "./EnhancedContactCard";
import EnhancedContactForm from "./EnhancedContactForm";
import { Search, Filter, Plus, Users, TrendingUp, Target, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EnhancedContactsModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [showLost, setShowLost] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user, showLost]);

  useEffect(() => {
    applyFilters();
  }, [contacts, searchTerm, statusFilter, industryFilter, sourceFilter]);

  const fetchContacts = async () => {
    if (!user) return;
    
    console.log('📋 Fetching enhanced contacts for user:', user.user_id);
    try {
      setLoading(true);
      const contactsData = await contactService.getAll(user.user_id, { showLost });
      console.log('📊 Enhanced contacts data loaded:', contactsData.length, 'contacts');
      setContacts(contactsData);
    } catch (error) {
      console.error('❌ Error fetching enhanced contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(contact => contact.industry === industryFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter(contact => contact.source === sourceFilter);
    }

    console.log('🔍 Applied filters:', { searchTerm, statusFilter, industryFilter, sourceFilter });
    console.log('📊 Filtered results:', filtered.length, 'contacts');
    setFilteredContacts(filtered);
  };

  const handleStatusChange = async (contactId: string, newStatus: Contact['status']) => {
    if (!user) return;

    console.log('🔄 Enhanced contact status change:', { contactId, newStatus });

    try {
      await contactService.updateStatus(contactId, newStatus, user.user_id);

      // Update local state
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? { ...contact, status: newStatus } : contact
      ));

      const contact = contacts.find(c => c.id === contactId);
      
      toast({
        title: "Status Updated",
        description: `${contact?.name} status changed to ${newStatus}`,
      });

      // Refresh to get updated data including any auto-created deals/projects
      setTimeout(() => fetchContacts(), 1000);

    } catch (error) {
      console.error('❌ Error updating contact status:', error);
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  const getUniqueIndustries = () => {
    const industries = contacts.map(c => c.industry).filter(Boolean);
    return [...new Set(industries)];
  };

  const getUniqueSources = () => {
    const sources = contacts.map(c => c.source).filter(Boolean);
    return [...new Set(sources)];
  };

  const getStats = () => {
    return {
      total: contacts.length,
      prospects: contacts.filter(c => c.status === 'Prospect').length,
      negotiations: contacts.filter(c => c.status === 'Negotiation').length,
      won: contacts.filter(c => c.status === 'Won').length,
      lost: contacts.filter(c => c.status === 'Lost').length,
    };
  };

  const stats = getStats();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Contacts</h1>
          <p className="text-gray-600 mt-2">Intelligent contact management with advanced filtering</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <EnhancedContactForm 
                onSuccess={() => {
                  setIsFormOpen(false);
                  fetchContacts();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Prospects</p>
              <p className="text-xl font-bold text-blue-600">{stats.prospects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Negotiating</p>
              <p className="text-xl font-bold text-yellow-600">{stats.negotiations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Won</p>
              <p className="text-xl font-bold text-green-600">{stats.won}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Lost</p>
              <p className="text-xl font-bold text-red-600">{stats.lost}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search contacts, companies, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Prospect">Prospect</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {getUniqueIndustries().map(industry => (
                <SelectItem key={industry} value={industry!}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {getUniqueSources().map(source => (
                <SelectItem key={source} value={source!}>{source}</SelectItem>
              ))}
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
          Showing {filteredContacts.length} of {contacts.length} contacts
        </p>
        {(searchTerm || statusFilter !== "all" || industryFilter !== "all" || sourceFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setIndustryFilter("all");
              setSourceFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Contacts Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading enhanced contacts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContacts.map((contact) => (
            <EnhancedContactCard
              key={contact.id}
              contact={contact}
              onStatusChange={handleStatusChange}
            />
          ))}
          
          {filteredContacts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No contacts found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || statusFilter !== "all" || industryFilter !== "all" || sourceFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first contact to get started"
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedContactsModule;
