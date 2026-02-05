import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

// Pages
import Login from './pages/Login';
import RoleBasedDashboard from './components/layout/RoleBasedDashboard';
import CreateInternalOrder from './pages/CreateInternalOrder';

// Receiving Flow (M3-M6)
import ReceptionList from './pages/ReceptionList';
import ReceptionStart from './pages/ReceptionStart';
import ProductScanning from './pages/ProductScanning';
import LocationAssignment from './pages/LocationAssignment';
import ReceptionConfirmation from './pages/ReceptionConfirmation';

// Dispatch Flow (M7-M10)
import OrderList from './pages/OrderList';
import PickingProcess from './pages/PickingProcess';
import Packing from './pages/Packing';
import DispatchConfirmation from './pages/DispatchConfirmation';

// Query & Profile (M11-M12)
import QueryModule from './pages/QueryModule';
import ReportModule from './pages/ReportModule';
import Profile from './pages/Profile';
import WarehouseMap from './pages/WarehouseMap';

import ComingSoon from './pages/ComingSoon';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />

        {/* Workshop Routes */}
        <Route
          path="/workshop/create-order"
          element={
            <ProtectedRoute allowedRoles={['workshop']}>
              <CreateInternalOrder />
            </ProtectedRoute>
          }
        />

        {/* Receiving Flow */}
        <Route
          path="/reception/list"
          element={
            <ProtectedRoute>
              <ReceptionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reception/start"
          element={
            <ProtectedRoute>
              <ReceptionStart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reception/scan"
          element={
            <ProtectedRoute>
              <ProductScanning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reception/location-assignment"
          element={
            <ProtectedRoute>
              <LocationAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reception/confirmation"
          element={
            <ProtectedRoute>
              <ReceptionConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Dispatch Flow */}
        <Route
          path="/dispatch/orders"
          element={
            <ProtectedRoute>
              <OrderList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispatch/picking/:orderId"
          element={
            <ProtectedRoute>
              <PickingProcess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispatch/packing/:orderId"
          element={
            <ProtectedRoute>
              <Packing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispatch/confirmation/:orderId"
          element={
            <ProtectedRoute>
              <DispatchConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Query Module */}
        <Route
          path="/query"
          element={
            <ProtectedRoute>
              <QueryModule />
            </ProtectedRoute>
          }
        />

        {/* Warehouse Map */}
        <Route
          path="/warehouse-map"
          element={
            <ProtectedRoute>
              <WarehouseMap />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportModule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Mis Tareas"
                description="La vista detallada de tareas está en desarrollo. Aquí verás todas tus asignaciones pendientes."
              />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard or login */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
