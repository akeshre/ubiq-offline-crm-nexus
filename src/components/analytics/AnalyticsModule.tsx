
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService } from "@/services/firestoreService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AnalyticsModule = () => {
  const [contactsData, setContactsData] = useState<any>(null);
  const [dealsData, setDealsData] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any>(null);
  const [tasksData, setTasksData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    console.log('📊 Loading analytics data...');
    try {
      setLoading(true);
      
      const [contacts, deals, projects, tasks] = await Promise.all([
        analyticsService.getContactsAnalytics(),
        analyticsService.getDealsAnalytics(),
        analyticsService.getProjectsAnalytics(),
        analyticsService.getTasksAnalytics()
      ]);

      setContactsData(contacts);
      setDealsData(deals);
      setProjectsData(projects);
      setTasksData(tasks);

      console.log('✅ Chart load success');
      console.log('📈 Data pulled for charts:', { contacts, deals, projects, tasks });
      
    } catch (error) {
      console.error('❌ Failed to load analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const contactsPieData = contactsData ? [
    { name: 'Prospects', value: contactsData.prospect, color: '#0088FE' },
    { name: 'Wins', value: contactsData.win, color: '#00C49F' },
    { name: 'Losses', value: contactsData.lose, color: '#FF8042' }
  ] : [];

  const dealsBarData = dealsData ? [
    { name: 'Ongoing', value: dealsData.ongoing, color: '#0088FE' },
    { name: 'Completed', value: dealsData.completed, color: '#00C49F' }
  ] : [];

  const projectsBarData = projectsData ? [
    { name: 'Active', value: projectsData.active, color: '#00C49F' },
    { name: 'Completed', value: projectsData.completed, color: '#0088FE' }
  ] : [];

  const tasksBarData = tasksData ? [
    { name: 'Pending', value: tasksData.pending, color: '#FFBB28' },
    { name: 'In Progress', value: tasksData.inProgress, color: '#0088FE' },
    { name: 'Done', value: tasksData.done, color: '#00C49F' }
  ] : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Visual insights from your CRM data</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-blue-600">{contactsData?.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deal Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(dealsData?.totalValue || 0).toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-purple-600">{projectsData?.active || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-orange-600">{tasksData?.done || 0}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts by Status - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contacts by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contactsPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contactsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deals by Stage - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealsBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projects: Active vs Completed - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Projects: Active vs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectsBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Completion - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {contactsData?.total > 0 ? 
                  Math.round((contactsData.win / contactsData.total) * 100) : 0}%
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Avg Deal Value</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${dealsData?.total > 0 ? 
                  Math.round(dealsData.totalValue / dealsData.total).toLocaleString() : 0}
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Project Completion</h3>
              <p className="text-2xl font-bold text-purple-600">
                {projectsData?.total > 0 ? 
                  Math.round((projectsData.completed / projectsData.total) * 100) : 0}%
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Task Efficiency</h3>
              <p className="text-2xl font-bold text-orange-600">
                {tasksData?.total > 0 ? 
                  Math.round((tasksData.done / tasksData.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsModule;
