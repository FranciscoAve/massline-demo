import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import Dashboard from '../../pages/Dashboard';
import WorkshopDashboard from '../../pages/WorkshopDashboard';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuthStore();

  if (user?.role === 'workshop') {
    return <WorkshopDashboard />;
  }

  return <Dashboard />;
};

export default RoleBasedDashboard;
