/**
 * App Component
 * Root component with routing configuration
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@components/layout';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { LoginPage, RegisterPage } from '@features/auth';
import { DashboardPage } from '@features/dashboard';
import { DocumentsPage } from '@features/documents/DocumentsPage';
import { DocumentDetailPage } from '@features/documents/DocumentDetailPage';
import { WorkflowsPage } from '@features/workflows/WorkflowsPage';
import { WorkflowCreatePage } from '@features/workflows/WorkflowCreatePage';
import { FieldDiscoveryPage } from '@features/field-discovery/FieldDiscoveryPage';
import { UploadPage } from '@features/upload/UploadPage';
import { CreditAnalysisPage } from '@features/credit-analysis/CreditAnalysisPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes with AppLayout (Sidebar + Header) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="credit-analysis" element={<CreditAnalysisPage />} />
          <Route path="profile" element={<div>Profile Page (Coming Soon)</div>} />
        </Route>

        {/* Protected Routes without AppLayout (Full Screen) */}
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <DocumentDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Workflow Creation/Edit Routes (Full Screen) */}
        <Route
          path="/workflows/create"
          element={
            <ProtectedRoute>
              <WorkflowCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workflows/:id/edit"
          element={
            <ProtectedRoute>
              <WorkflowCreatePage />
            </ProtectedRoute>
          }
        />

        {/* Field Discovery Route (Full Screen) */}
        <Route
          path="/field-discovery"
          element={
            <ProtectedRoute>
              <FieldDiscoveryPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
