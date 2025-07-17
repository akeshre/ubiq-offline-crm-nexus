
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { contactService, type Contact } from "@/services/firestoreService";
import { Plus, Users, TrendingUp, Award, AlertTriangle, Search, Filter, Trash2, Grid, List, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import EnhancedContactForm from "./EnhancedContactForm";

const EnhancedContactsModule = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [showLost, setShowLost] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user, showLost]);

  useEffect(() => {
    applyFilters();
  }, [contacts, searchTerm, statusFilter, industryFilter, sourceFilter]);

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const contactsData = await contactService.getAll(user.user_id, { showLost });
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

  const applyFilters = () => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    if (industryFilter !== "all") {
      filtered = filtered.filter(contact => contact.industry === industryFilter);
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter(contact => contact.source === sourceFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleDelete = async (contactId: string, contactName: string) => {
    if (!confirm(`Are you sure you want to delete "${contactName}"? This will also delete all linked deals, projects, and tasks.`)) {
      return;
    }

    try {
      await contactService.delete(contactId);
      await loadContacts();
      toast({
        title: "Contact deleted",
        description: `${contactName} and all linked records have been removed.`,
      });
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Negotiation': return 'bg-blue-100 text-blue-800';
      case 'Prospect': return 'bg-yellow-100 text-yellow-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    return {
      total: contacts.length,
      prospects: contacts.filter(c => c.status === 'Prospect').length,
      negotiation: contacts.filter(c => c.status === 'Negotiation').length,
      won: contacts.filter(c => c.status === 'Won').length,
      lost: contacts.filter(c => c.status === 'Lost').length,
    };
  };

  const getUniqueIndustries = () => {
    const industries = contacts.map(c => c.industry).filter(Boolean);
    return [...new Set(industries)];
  };

  const getUniqueSources = () => {
    const sources = contacts.map(c => c.source).filter(Boolean);
    return [...new Set(sources)];
  };

  const stats = getStats();

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContacts.map((contact) => (
        <Card key={contact.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <p className="text-sm text-gray-600">{contact.company_name}</p>
                  {contact.designation && (
                    <p className="text-xs text-gray-500">{contact.designation}</p>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(contact.status)}>
                {contact.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email: {contact.email}</p>
                <p className="text-sm text-gray-600">Phone: {contact.phone}</p>
              </div>
              
              {contact.industry && (
                <div>
                  <Badge variant="outline" className="text-xs">
                    {contact.industry}
                  </Badge>
                </div>
              )}

              {contact.source && (
                <div>
                  <span className="text-xs text-gray-500">Source: {contact.source}</span>
                </div>
              )}

              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">
                  Created: {contact.createdAt?.toDate().toLocaleDateString()}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(contact.id!, contact.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
  );

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    {contact.designation && (
                      <p className="text-sm text-gray-600">{contact.designation}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{contact.company_name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(contact.status)}>
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {contact.industry && (
                    <Badge variant="outline" className="text-xs">
                      {contact.industry}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags?.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags && contact.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{contact.tags.length - 2}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(contact.id!, contact.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <p className="text-gray-500 text-lg">No contacts found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchTerm || statusFilter !== "all" || industryFilter !== "all" || sourceFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Add your first contact to get started"
                    }
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your contact relationships and track engagement</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <Grid className="w-4 h-4 mr-2" />
              Cards
            </Button>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800">
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
                  loadContacts();
                }}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prospects</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.prospects}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Negotiation</p>
                <p className="text-2xl font-bold text-blue-600">{stats.negotiation}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Won</p>
                <p className="text-2xl font-bold text-green-600">{stats.won}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lost</p>
                <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
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
                placeholder="Search contacts..."
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
              {getUniqueIndustries().map((industry) => (
                <SelectItem key={industry} value={industry!}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {getUniqueSources().map((source) => (
                <SelectItem key={source} value={source!}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showLost ? "default" : "outline"}
            onClick={() => setShowLost(!showLost)}
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

      {/* Contacts Display */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      ) : viewMode === 'card' ? renderCardView() : renderTableView()}
    </div>
  );
};

export default EnhancedContactsModule;
