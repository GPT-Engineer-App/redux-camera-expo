import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Home, LogIn, LogOut, Settings, BarChart2 } from "lucide-react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Layout from "./layouts/default";
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import TensorFlowSettings from "./pages/TensorFlowSettings.jsx";
import History from "./pages/History.jsx";
import { Provider } from 'react-redux';
import store from './redux/store';
import { useState, useEffect } from 'react';

const queryClient = new QueryClient();

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "TensorFlow Settings",
    to: "/tensorflow-settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "History",
    to: "/history",
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    title: "Login",
    to: "/login",
    icon: <LogIn className="h-4 w-4" />,
  },
];

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <Index />
                      <button onClick={handleLogout} className="absolute top-4 right-4 flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </Layout>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/tensorflow-settings"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <TensorFlowSettings />
                    </Layout>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/history"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <History />
                    </Layout>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Login />
                  )
                }
              />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;