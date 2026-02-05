import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Hash, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';
import BottomNav from '../components/layout/BottomNav';

// Mapeo de roles a texto legible
const roleLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  operator: { label: 'Operador de Bodega', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  supervisor: { label: 'Supervisor', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  admin: { label: 'Administrador', color: 'text-red-700', bgColor: 'bg-red-100' },
  workshop: { label: 'Taller de Ensamblaje', color: 'text-green-700', bgColor: 'bg-green-100' },
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleInfo = roleLabels[user.role] || { label: user.role, color: 'text-gray-700', bgColor: 'bg-gray-100' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Mi Perfil</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          {/* Avatar y Nombre */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
              {roleInfo.label}
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Correo electrónico</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rol en el sistema</p>
                <p className="text-sm font-medium text-gray-900">{roleInfo.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">ID de Usuario</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="danger"
          fullWidth
          className="flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </Button>

        {/* App Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>SmartStock v1.0.0</p>
          <p className="mt-1">© 2025 MASSLINE</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Profile;
