
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DashboardContent from "./DashboardContent";
import ContactsModule from "@/components/contacts/ContactsModule";
import DealsModule from "@/components/deals/DealsModule";
import ProjectsModule from "@/components/projects/ProjectsModule";
import TasksModule from "@/components/tasks/TasksModule";
import ReportsModule from "@/components/reports/ReportsModule";
import AnalyticsModule from "@/components/analytics/AnalyticsModule";

const Dashboard = () => {
  const { user } = useAuth();
  const [currentModule, setCurrentModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderModule = () => {
    console.log('🔄 Navigating to module:', currentModule);
    switch (currentModule) {
      case "dashboard":
        return <DashboardContent />;
      case "contacts":
        return <ContactsModule />;
      case "deals":
        return <DealsModule />;
      case "projects":
        return <ProjectsModule />;
      case "tasks":
        return <TasksModule />;
      case "reports":
        return <ReportsModule />;
      case "analytics":
        return <AnalyticsModule />;
      default:
        return <DashboardContent />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        collapsed={sidebarCollapsed}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header
          user={user}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
