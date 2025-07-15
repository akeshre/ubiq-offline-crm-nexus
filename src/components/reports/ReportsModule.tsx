import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyticsService, contactService, dealService, type Contact, type Deal } from "@/services/firestoreService";
import { FileDown, Filter, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ReportsModule = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredData, setFilteredData] = useState<{contacts: Contact[], deals: Deal[]}>({contacts: [], deals: []});
  const [filters, setFilters] = useState({
    contactId: "",
    dealStatus: "",
    dateFrom: "",
    dateTo: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, contacts, deals]);

  const loadReportData = async () => {
    if (!user) return;
    
    console.log('📊 Loading report data...');
    try {
      setLoading(true);
      const [contactsData, dealsData] = await Promise.all([
        contactService.getAll(user.user_id),
        dealService.getAll(user.user_id)
      ]);
      setContacts(contactsData);
      setDeals(dealsData);
      setFilteredData({ contacts: contactsData, deals: dealsData });
      console.log('✅ Report data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('🔍 Applied filters:', filters);
    
    let filteredContacts = [...contacts];
    let filteredDeals = [...deals];

    // Filter by contact
    if (filters.contactId) {
      filteredContacts = filteredContacts.filter(c => c.id === filters.contactId);
      filteredDeals = filteredDeals.filter(d => d.contactRef === filters.contactId);
    }

    // Filter by deal status
    if (filters.dealStatus) {
      filteredDeals = filteredDeals.filter(d => d.status === filters.dealStatus);
    }

    // Filter by date range
    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      
      filteredContacts = filteredContacts.filter(c => {
        const createdDate = c.createdAt.toDate();
        return createdDate >= fromDate && createdDate <= toDate;
      });
      
      filteredDeals = filteredDeals.filter(d => {
        const createdDate = d.createdAt.toDate();
        return createdDate >= fromDate && createdDate <= toDate;
      });
    }

    setFilteredData({ contacts: filteredContacts, deals: filteredDeals });
    console.log('📈 Report results:', {
      contacts: filteredContacts.length,
      deals: filteredDeals.length
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      contactId: "",
      dealStatus: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const exportToPDF = () => {
    console.log('📄 PDF export requested');
    toast({
      title: "Export",
      description: "PDF export functionality would be implemented here",
    });
  };

  const getMetrics = () => {
    return {
      totalContacts: filteredData.contacts.length,
      prospectContacts: filteredData.contacts.filter(c => c.status === 'Prospect').length,
      winContacts: filteredData.contacts.filter(c => c.status === 'Win').length,
      loseContacts: filteredData.contacts.filter(c => c.status === 'Lose').length,
      totalDeals: filteredData.deals.length,
      ongoingDeals: filteredData.deals.filter(d => d.status === 'Ongoing').length,
      completedDeals: filteredData.deals.filter(d => d.status === 'Completed').length,
      totalDealValue: filteredData.deals.reduce((sum, deal) => sum + deal.value, 0),
      avgDealValue: filteredData.deals.length > 0 ? 
        filteredData.deals.reduce((sum, deal) => sum + deal.value, 0) / filteredData.deals.length : 0
    };
  };

  const metrics = getMetrics();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Aggregated reports and analytics</p>
        </div>
        <Button onClick={exportToPDF}>
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Contact</label>
              <Select onValueChange={(value) => handleFilterChange('contactId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All contacts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All contacts</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id || ""}>
                      {contact.company} - {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Deal Status</label>
              <Select onValueChange={(value) => handleFilterChange('dealStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.totalContacts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-3xl font-bold text-green-600">
                {metrics.totalContacts > 0 ? 
                  Math.round((metrics.winContacts / metrics.totalContacts) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Deal Value</p>
              <p className="text-3xl font-bold text-purple-600">
                ${metrics.totalDealValue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg Deal Value</p>
              <p className="text-3xl font-bold text-orange-600">
                ${Math.round(metrics.avgDealValue).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prospects</span>
                <span className="font-medium">{metrics.prospectContacts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Wins</span>
                <span className="font-medium text-green-600">{metrics.winContacts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Losses</span>
                <span className="font-medium text-red-600">{metrics.loseContacts}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-bold">{metrics.totalContacts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deal Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ongoing Deals</span>
                <span className="font-medium text-blue-600">{metrics.ongoingDeals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Deals</span>
                <span className="font-medium text-green-600">{metrics.completedDeals}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Deals</span>
                <span className="font-bold">{metrics.totalDeals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Value</span>
                <span className="font-bold text-green-600">${metrics.totalDealValue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading report data...</p>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;
