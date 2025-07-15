
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyticsService, contactService, dealService, projectService } from "@/services/firestoreService";
import { FileDown, TrendingUp, BarChart3, PieChart, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ReportsModule = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user]);

  const loadReportData = async () => {
    if (!user) return;
    
    console.log('📊 Loading report data...');
    try {
      setLoading(true);
      
      const [contactsAnalytics, dealsAnalytics, projectsAnalytics] = await Promise.all([
        analyticsService.getContactsAnalytics(user.user_id),
        analyticsService.getDealsAnalytics(user.user_id),
        analyticsService.getProjectsAnalytics(user.user_id)
      ]);
      
      const analyticsData = {
        contacts: contactsAnalytics,
        deals: dealsAnalytics,
        projects: projectsAnalytics
      };
      
      setAnalytics(analyticsData);
      console.log('✅ Report data loaded successfully');
      console.log('📈 Analytics data:', analyticsData);
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

  const exportReport = () => {
    console.log('📄 Export report requested');
    toast({
      title: "Export Report",
      description: "Report export functionality would be implemented here",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No analytics data available</p>
          <p className="text-gray-400 text-sm mt-2">Add some contacts and deals to see analytics</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const pipelineValue = analytics.deals?.totalValue || 0;
  const winRate = analytics.contacts?.total > 0 ? 
    Math.round((analytics.contacts.win / analytics.contacts.total) * 100) : 0;
  const avgDealSize = analytics.deals?.total > 0 ? 
    Math.round(analytics.deals.totalValue / analytics.deals.total) : 0;
  const activeProjects = analytics.projects?.active || 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Business insights and performance metrics</p>
        </div>
        <Button onClick={exportReport} className="bg-gray-900 hover:bg-gray-800">
          <FileDown className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-green-600">${pipelineValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-blue-600">{winRate}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-purple-600">${avgDealSize.toLocaleString()}</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-orange-600">{activeProjects}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-3">By Category</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prospect</span>
                  <span className="font-semibold">{analytics.contacts?.prospect || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Client</span>
                  <span className="font-semibold">{analytics.contacts?.win || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lost</span>
                  <span className="font-semibold">{analytics.contacts?.lose || 0}</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-medium text-gray-700 mb-3">By Source</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Website</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cold Outreach</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Referral</span>
                    <span className="font-semibold">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Inbound</span>
                    <span className="font-semibold">1</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Pipeline Stages</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Proposal Sent</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Negotiation</span>
                  <span className="font-semibold">1</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Pipeline Value</span>
                    <span className="font-bold text-green-600">${pipelineValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Average Deal Size</span>
                    <span className="font-bold">${avgDealSize.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Win Rate</span>
                    <span className="font-bold text-blue-600">{winRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsModule;
