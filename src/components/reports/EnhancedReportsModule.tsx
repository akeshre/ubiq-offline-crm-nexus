
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyticsService } from "@/services/firestoreService";
import { FileDown, TrendingUp, BarChart3, PieChart, Users, Target, DollarSign, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const EnhancedReportsModule = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [projectsByLead, setProjectsByLead] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAdvancedReportData();
    }
  }, [user]);

  const loadAdvancedReportData = async () => {
    if (!user) return;
    
    console.log('📊 Loading advanced report data...');
    try {
      setLoading(true);
      const [analyticsData, projectsLeadData] = await Promise.all([
        analyticsService.getAdvancedAnalytics(user.user_id),
        analyticsService.getProjectsByLeadAnalytics(user.user_id)
      ]);
      
      setAnalytics(analyticsData);
      setProjectsByLead(projectsLeadData);
      console.log('✅ Advanced report data loaded successfully');
      console.log('📈 Projects by lead data:', projectsLeadData);
    } catch (error) {
      console.error('❌ Failed to load advanced report data:', error);
      toast({
        title: "Error",
        description: "Failed to load advanced analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    console.log('📄 Export advanced report requested');
    toast({
      title: "Export Report",
      description: "Advanced report export functionality would be implemented here",
    });
  };

  const handleLeadRowClick = (leadId: string) => {
    console.log('🔍 Filter projects by lead:', leadId);
    // This would navigate to projects page with lead filter
    toast({
      title: "Filter Projects",
      description: "Would filter projects page by selected lead",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No analytics data available</p>
          <p className="text-gray-400 text-sm mt-2">Add contacts, deals, and projects to see analytics</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare chart data
  const conversionData = [
    { name: 'Prospects', value: analytics.conversion.prospects, color: '#0088FE' },
    { name: 'Negotiations', value: analytics.conversion.negotiations, color: '#FFBB28' },
    { name: 'Won', value: analytics.conversion.won, color: '#00C49F' }
  ];

  const sourceData = Object.entries(analytics.sources || {}).map(([source, data]: [string, any]) => ({
    name: source,
    count: data.count,
    value: data.value
  }));

  const industryData = Object.entries(analytics.industries || {}).map(([industry, count]) => ({
    name: industry,
    value: count,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive business insights and performance metrics</p>
        </div>
        <Button onClick={exportReport} className="bg-gray-900 hover:bg-gray-800">
          <FileDown className="w-4 h-4 mr-2" />
          Export Advanced Report
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${analytics.pipeline.totalValue.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.pipeline.winRate}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${analytics.pipeline.avgDealSize.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.pipeline.activeProjects}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel & Projects by Lead */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Conversion Rate: <span className="font-bold text-green-600">{analytics.conversion.conversionRate}%</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by Lead</CardTitle>
          </CardHeader>
          <CardContent>
            {projectsByLead.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {projectsByLead.map((leadData, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleLeadRowClick(leadData.lead_id)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{leadData.lead_name}</p>
                      <p className="text-sm text-gray-600">Click to filter projects</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{leadData.project_count}</p>
                      <p className="text-xs text-gray-500">projects</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No project data available</p>
                <p className="text-gray-400 text-sm mt-1">Projects will appear here once created</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources & Industry Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? `$${value.toLocaleString()}` : value,
                    name === 'value' ? 'Revenue' : 'Count'
                  ]}
                />
                <Bar dataKey="count" fill="#0088FE" name="count" />
                <Bar dataKey="value" fill="#00C49F" name="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Task Management Efficiency */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Task Management Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tasks</span>
                <span className="font-bold">{analytics.tasks.total}</span>
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-bold text-green-600">{analytics.tasks.completed}</span>
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overdue</span>
                <span className="font-bold text-red-600">{analytics.tasks.overdue}</span>
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Efficiency</span>
                <span className="font-bold text-blue-600">{analytics.tasks.efficiency}%</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${analytics.tasks.efficiency}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source ROI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Source ROI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(analytics.sources || {}).map(([source, data]: [string, any]) => (
              <div key={source} className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900">{source}</h3>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-green-600">
                    ${data.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">{data.count} contacts</p>
                  <p className="text-xs text-gray-500">
                    Avg: ${data.count > 0 ? Math.round(data.value / data.count).toLocaleString() : 0} per contact
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedReportsModule;
