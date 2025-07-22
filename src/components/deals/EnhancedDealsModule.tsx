
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
import { dealService, type Deal } from "@/services/firestoreService";
import { Plus, DollarSign, TrendingUp, Clock, Users, Search, Filter, Grid, List, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import DealForm from "./DealForm";

const EnhancedDealsModule = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [showLost, setShowLost] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDeals();
    }
  }, [user, showLost]);

  useEffect(() => {
    applyFilters();
  }, [deals, searchTerm, stageFilter]);

  const loadDeals = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const dealsData = await dealService.getAll(user.user_id, { showLost });
      setDeals(dealsData);
    } catch (error) {
      console.error('Failed to load deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = deals;

    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stageFilter !== "all") {
      filtered = filtered.filter(deal => deal.deal_stage === stageFilter);
    }

    setFilteredDeals(filtered);
  };

  const handleFileUpload = async (file: File, documentType: 'proposal' | 'quotation') => {
    if (!selectedDeal) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dealId', selectedDeal.id!);
      formData.append('leadName', selectedDeal.company_name);
      formData.append('documentType', documentType);
      formData.append('dealName', selectedDeal.deal_name);

      const response = await fetch('https://crm7.app.n8n.cloud/webhook/upload-to-onedrive', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${documentType} uploaded successfully to OneDrive`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${documentType}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStats = () => {
    return {
      total: deals.length,
      totalValue: deals.reduce((sum, deal) => sum + (deal.value || 0), 0),
      qualified: deals.filter(d => d.deal_stage === 'Proposal Sent').length,
      won: deals.filter(d => d.deal_stage === 'Won').length,
    };
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'bg-gray-100 text-gray-800';
      case 'Proposal Sent': return 'bg-blue-100 text-blue-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = getStats();

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDeals.map((deal) => (
        <Card key={deal.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{deal.deal_name}</CardTitle>
                <p className="text-gray-600 text-sm mt-1">{deal.company_name}</p>
              </div>
              <Badge className={getStageColor(deal.deal_stage)}>
                {deal.deal_stage}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Value:</span>
                <span className="font-medium">${(deal.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tasks:</span>
                <Badge variant="outline">{deal.tasks_count || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm">{deal.createdAt?.toDate().toLocaleDateString()}</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDeal(deal);
                    setIsDocumentsOpen(true);
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Documents
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {filteredDeals.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No deals found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || stageFilter !== "all"
              ? "Try adjusting your filters"
              : "Add your first deal to get started"
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
              <TableHead>Deal Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell>
                  <p className="font-medium">{deal.deal_name}</p>
                </TableCell>
                <TableCell>{deal.company_name}</TableCell>
                <TableCell>
                  <Badge className={getStageColor(deal.deal_stage)}>
                    {deal.deal_stage}
                  </Badge>
                </TableCell>
                <TableCell>${(deal.value || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">{deal.tasks_count || 0}</Badge>
                </TableCell>
                <TableCell>{deal.createdAt?.toDate().toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDeal(deal);
                      setIsDocumentsOpen(true);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Documents
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredDeals.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
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
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-2">Track and manage your sales pipeline</p>
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
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Deal</DialogTitle>
              </DialogHeader>
              <DealForm 
                onSuccess={() => {
                  setIsFormOpen(false);
                  loadDeals();
                }}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
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
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-blue-600">{stats.qualified}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
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
              <Clock className="w-8 h-8 text-green-600" />
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
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
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

      {/* Deals Display */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading deals...</p>
        </div>
      ) : viewMode === 'card' ? renderCardView() : renderTableView()}

      {/* Documents Dialog */}
      <Dialog open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Documents for {selectedDeal?.deal_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Upload documents for <strong>{selectedDeal?.company_name}</strong>
            </div>
            
            <div className="flex justify-center">
              <div>
                <label htmlFor="documents-upload">
                  <Button 
                    variant="outline" 
                    className="w-full h-20 flex flex-col items-center justify-center cursor-pointer"
                    disabled={uploading}
                    asChild
                  >
                    <div>
                      <Upload className="w-6 h-6 mb-2" />
                      Upload Documents
                    </div>
                  </Button>
                </label>
                <input
                  id="documents-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, 'proposal');
                    }
                  }}
                />
              </div>
            </div>
            
            {uploading && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Uploading to OneDrive...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedDealsModule;
