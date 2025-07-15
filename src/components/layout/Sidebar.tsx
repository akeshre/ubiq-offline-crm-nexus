
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Target,
  FolderOpen,
  CheckSquare,
  BarChart3,
  Settings,
} from "lucide-react";

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (module: string) => void;
  collapsed: boolean;
}

const Sidebar = ({ currentModule, setCurrentModule, collapsed }: SidebarProps) => {
  const { user, hasPermission } = useAuth();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: null,
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: Users,
      permission: "contacts",
    },
    {
      id: "deals",
      label: "Deals",
      icon: Target,
      permission: "deals",
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
      permission: "projects",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      permission: "tasks",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      permission: "reports",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      permission: "settings",
    },
  ];

  const visibleItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission) || hasPermission("all")
  );

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">U</span>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">UBIQ CRM</h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentModule(item.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
