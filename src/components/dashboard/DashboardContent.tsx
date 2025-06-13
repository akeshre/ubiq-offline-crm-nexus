
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Target, 
  FolderOpen, 
  CheckSquare,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { getContacts, getDeals, getProjects, getTasks } from "@/utils/dataUtils";

const DashboardContent = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    activeDeals: 0,
    activeProjects: 0,
    pendingTasks: 0,
    pipelineValue: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    // Calculate dashboard statistics
    const contacts = getContacts();
    const deals = getDeals();
    const projects = getProjects();
    const tasks = getTasks();

    const activeDeals = deals.filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage));
    const activeProjects = projects.filter(project => project.status === 'In Progress');
    const pendingTasks = tasks.filter(task => task.status !== 'Completed');
    
    const pipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const closedWonDeals = deals.filter(deal => deal.stage === 'Closed Won');
    const monthlyRevenue = closedWonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

    setStats({
      totalContacts: contacts.length,
      activeDeals: activeDeals.length,
      activeProjects: activeProjects.length,
      pendingTasks: pendingTasks.length,
      pipelineValue,
      monthlyRevenue,
    });
  }, []);

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Deals",
      value: stats.activeDeals,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: FolderOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: CheckSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pipeline Value",
      value: `$${(stats.pipelineValue / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Monthly Revenue",
      value: `$${(stats.monthlyRevenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New deal "Web Development Project" created</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Contact "John Smith" updated</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Project milestone completed</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium">Add Contact</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Target className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-sm font-medium">Create Deal</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FolderOpen className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium">New Project</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <CheckSquare className="w-6 h-6 text-orange-600 mb-2" />
                <p className="text-sm font-medium">Add Task</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
