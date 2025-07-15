
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Handshake, 
  FolderOpen, 
  CheckSquare, 
  FileText,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (module: string) => void;
  collapsed: boolean;
}

const Sidebar = ({ currentModule, setCurrentModule, collapsed }: SidebarProps) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "deals", label: "Deals", icon: Handshake },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleModuleClick = (moduleId: string) => {
    console.log('🔄 Sidebar navigation to:', moduleId);
    setCurrentModule(moduleId);
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <div className="flex items-center">
          {!collapsed && (
            <h1 className="text-xl font-bold text-gray-800">UBIQ CRM</h1>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleModuleClick(item.id)}
              className={cn(
                "w-full flex items-center text-left transition-colors duration-200",
                collapsed ? "px-4 py-3 justify-center" : "px-6 py-3",
                isActive
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
