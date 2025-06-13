
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "@/components/auth/LoginPage";
import Dashboard from "@/components/dashboard/Dashboard";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Dashboard />;
};

export default Index;
