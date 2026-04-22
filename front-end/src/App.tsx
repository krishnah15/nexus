import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { LandingPage } from '@/pages/landing.page';
import { LoginPage } from '@/pages/auth/login.page';
import { RegisterPage } from '@/pages/auth/register.page';
import { DashboardPage } from '@/pages/dashboard.page';
import { JobsPage } from '@/pages/jobs.page';
import { LearningPage } from '@/pages/learning.page';
import { DsaPage } from '@/pages/dsa.page';
import { CountriesPage } from '@/pages/countries.page';
import { DocumentsPage } from '@/pages/documents.page';
import { AtsPage } from '@/pages/ats.page';
import { JobMatchingPage } from '@/pages/job-matching.page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/dsa" element={<DsaPage />} />
            <Route path="/abroad" element={<CountriesPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/ats" element={<AtsPage />} />
            <Route path="/job-matching" element={<JobMatchingPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
