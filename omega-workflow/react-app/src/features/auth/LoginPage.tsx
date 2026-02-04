/**
 * LoginPage Component
 * User authentication with form validation
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input, Button, Card, CardContent } from '@components/ui';
import { useAuthStore } from '@stores/authStore';
import { useUIStore } from '@stores/uiStore';
import { authService } from '@services';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface FormErrors {
  username?: string;
  password?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useUIStore((state) => state.addToast);

  // Get the page the user was trying to access (if redirected from ProtectedRoute)
  const from = (location.state as any)?.from || '/';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
      });

      setAuth(response);
      addToast('success', 'Login successful!');
      // Redirect to the page user was trying to access, or home if direct login
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || 'Login failed. Please try again.';
      addToast('error', errorMessage);
      setErrors({ password: 'Invalid username or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM65 70H55V60C55 57.239 52.761 55 50 55C47.239 55 45 57.239 45 60V70H35V60C35 51.716 41.716 45 50 45C58.284 45 65 51.716 65 60V70ZM50 35C44.477 35 40 30.523 40 25C40 19.477 44.477 15 50 15C55.523 15 60 19.477 60 25C60 30.523 55.523 35 50 35Z" fill="#FEC62C"/>
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">OMEGA</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {from !== '/' ? (
              <>Sign in to access the requested page</>
            ) : (
              <>Sign in to your account to continue</>
            )}
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={errors.username}
                placeholder="Enter your username"
                leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                autoComplete="username"
                autoFocus
              />

              {/* Password Input */}
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                placeholder="Enter your password"
                leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                autoComplete="current-password"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Sign in
              </Button>

              {/* Register Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Omega Credit Analysis Platform
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
