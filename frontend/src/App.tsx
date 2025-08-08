import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LogProvider } from "./context/LogContext";
import { TraceProvider } from "./context/TraceContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Metrics } from "./pages/Metrics";
import { LogDetails } from "./pages/LogDetails";
import { TracesListPage } from "./pages/traces/TracesListPage";
import { TraceDetailPage } from "./pages/traces/TraceDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LogProvider>
        <TraceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/metrics" element={
                  <PrivateRoute>
                    <Metrics />
                  </PrivateRoute>
                } />
                <Route path="/traces" element={
                  <PrivateRoute>
                    <TracesListPage />
                  </PrivateRoute>
                } />
                <Route path="/traces/:traceId" element={
                  <PrivateRoute>
                    <TraceDetailPage />
                  </PrivateRoute>
                } />
                <Route path="/logs/:id" element={
                  <PrivateRoute>
                    <LogDetails />
                  </PrivateRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TraceProvider>
      </LogProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
