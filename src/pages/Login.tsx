import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';
import { useAuthStore } from '../stores/authStore';
import { mockApi } from '../services/mockApi';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await mockApi.auth.login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (response.success && response.user && response.token) {
        login(response.user, response.token);
        navigate('/dashboard');
      } else {
        setErrorMessage(response.error || 'Error al iniciar sesión');
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setFormData({ ...formData, password: '' });
      }
    } catch {
      setErrorMessage('Error de conexión. Verifique su internet.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-secondary to-bg-primary flex flex-col">
      {/* Error Banner */}
      {errorMessage && (
        <div className="w-full bg-error text-white px-5 py-3 text-center animate-slide-up">
          <p className="text-sm font-medium">❌ {errorMessage}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-5">
        {/* Header Section (20%) */}
        <div className="text-center mb-8 animate-fade-in">
          <Logo variant="massline" size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-text-secondary">
            Sistema Integral de Gestión de Inventarios
          </p>
        </div>

        {/* Form Section (60%) */}
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md space-y-5 ${shake ? 'animate-shake' : ''}`}
        >
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Ingrese su usuario"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            icon={<User className="h-5 w-5" />}
            fullWidth
            autoComplete="username"
            disabled={isLoading}
          />

          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Ingrese su contraseña"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock className="h-5 w-5" />}
            fullWidth
            autoComplete="current-password"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-5 w-5 rounded border-border-medium text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-sm text-text-secondary">
                Recordar sesión
              </span>
            </label>

            <button
              type="button"
              className="text-sm text-primary font-medium hover:underline touch-target"
              disabled={isLoading}
            >
              ¿Olvidó contraseña?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!formData.username || !formData.password || isLoading}
          >
            INICIAR SESIÓN
          </Button>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-info-bg border border-info-border rounded-lg">
            <p className="text-xs text-info font-medium mb-2">
              Credenciales de prueba:
            </p>
            <div className="text-xs text-text-secondary space-y-1">
              <p>
                <strong>Operador:</strong> operator / operator123
              </p>
              <p>
                <strong>Admin:</strong> admin / admin123
              </p>
              <p>
                <strong>Taller:</strong> taller / taller123
              </p>
            </div>
          </div>
        </form>

        {/* Footer Section (20%) */}
        <div className="mt-auto pt-8 text-center space-y-3">
          <p className="text-xs text-text-tertiary">v1.0.0</p>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
          >
            ¿Necesita ayuda? Contacte a IT
          </button>
          <Logo variant="mototrack" size="sm" className="mx-auto opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default Login;
