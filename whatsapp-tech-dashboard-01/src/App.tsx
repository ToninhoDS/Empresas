import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import PredefinedMessages from './pages/PredefinedMessages';
import Login from './pages/Login';
import Users from './pages/Users';
import Departments from './pages/Departments';
import InternalChat from './pages/InternalChat';
import Settings from './pages/Settings';
import TeamSupervision from './pages/TeamSupervision';
import AdvancedSearch from './pages/AdvancedSearch';
import Contacts from './pages/Contacts';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/pipeline" element={
            <ProtectedRoute>
              <Pipeline />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/contacts" element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          } />
          <Route path="/predefined-messages" element={
            <ProtectedRoute>
              <PredefinedMessages />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/departments" element={
            <ProtectedRoute>
              <Departments />
            </ProtectedRoute>
          } />
          <Route path="/advanced-search" element={
            <ProtectedRoute>
              <AdvancedSearch />
            </ProtectedRoute>
          } />
          <Route path="/team-supervision" element={
            <ProtectedRoute>
              <TeamSupervision />
            </ProtectedRoute>
          } />
          <Route path="/internal-chat" element={
            <ProtectedRoute>
              <InternalChat />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
