import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Step1Page from "./pages/Step1.tsx";
import Step2Page from "./pages/Step2.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import PostsAdmin from "./pages/admin/Posts.tsx";
import AdsAdmin from "./pages/admin/Ads.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/post/:id/step-1" element={<Step1Page />} />
          <Route path="/post/:id/step-2" element={<Step2Page />} />
          <Route path="/secret-admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="posts" element={<PostsAdmin />} />
            <Route path="ads" element={<AdsAdmin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
