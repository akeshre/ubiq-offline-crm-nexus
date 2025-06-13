
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getContacts, getDeals, getProjects, getTasks } from "@/utils/dataUtils";
import { Download, BarChart3, PieChart, TrendingUp } from "lucide-react";

const ReportsModule = () => {
  const [data, setData] = useState({
    contacts: [] as any[],
    deals: [] as any[],
    projects: [] as any[],
    tasks: [] as any[]
  });

  useEffect(() => {
    setData({
      contacts: getContacts(),
      deals: getDeals(),
      projects: getProjects(),
      tasks: getTasks()
    });
  }, []);

  // Analytics calculations
  const analytics = {
    totalContacts: data.contacts.length,
    contactsByCategory: data.contacts.reduce((acc: any, contact) => {
      acc[contact.category] = (acc[contact.category] || 0) + 1;
      return acc;
    }, {}),
    contactsBySource: data.contacts.reduce((acc: any, contact) => {
      acc[contact.source] = (acc[contact.source] || 0) + 1;
      return acc;
    }, {}),
    
    totalDeals: data.deals.length,
    dealsByStage: data.deals.reduce((acc: any, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {}),
    pipelineValue: data.deals.reduce((sum, deal) => sum + (deal.value || 0), 0),
    avgDealSize: data.deals.length > 0 ? 
      data.deals.reduce((sum, deal) => sum + (deal.value || 0), 0) / data.deals.length : 0,
    winRate: data.deals.length > 0 ? 
      (data.deals.filter(d => d.stage === 'Closed Won').length / data.deals.length) * 100 : 0,

    totalProjects: data.projects.length,
    projectsByStatus: data.projects.reduce((acc: any, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {}),
    totalBudget: data.projects.reduce((sum, project) => sum + (project.budget || 0), 0),

    totalTasks: data.tasks.length,
    tasksByStatus: data.tasks.reduce((acc: any, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {}),
    tasksByPriority: data.tasks.reduce((acc: any, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {})
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Business insights and performance metrics</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.pipelineValue)}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.winRate.toFixed(1)}%
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.avgDealSize)}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.projectsByStatus['In Progress'] || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">By Category</h4>
                {Object.entries(analytics.contactsByCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">By Source</h4>
                {Object.entries(analytics.contactsBySource).map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{source}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
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
              <div>
                <h4 className="font-medium mb-2">Pipeline Stages</h4>
                {Object.entries(analytics.dealsByStage).map(([stage, count]) => (
                  <div key={stage} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{stage}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Total Pipeline Value</span>
                  <span className="font-medium">{formatCurrency(analytics.pipelineValue)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Average Deal Size</span>
                  <span className="font-medium">{formatCurrency(analytics.avgDealSize)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-medium">{analytics.winRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">By Status</h4>
                {Object.entries(analytics.projectsByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Total Budget</span>
                  <span className="font-medium">{formatCurrency(analytics.totalBudget)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Task Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">By Status</h4>
                {Object.entries(analytics.tasksByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">By Priority</h4>
                {Object.entries(analytics.tasksByPriority).map(([priority, count]) => (
                  <div key={priority} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{priority}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsModule;
