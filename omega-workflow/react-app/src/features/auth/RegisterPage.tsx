/**
 * RegisterPage Component
 * User registration with form validation
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Card, CardContent } from '@components/ui';
import { useAuthStore } from '@stores/authStore';
import { useUIStore } from '@stores/uiStore';
import { authService } from '@services';
import {
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useUIStore((state) => state.addToast);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setAuth(response);
      addToast('success', 'Account created successfully!');
      navigate('/');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || 'Registration failed. Please try again.';
      addToast('error', errorMessage);

      // Handle specific errors
      if (errorMessage.toLowerCase().includes('username')) {
        setErrors({ username: 'Username already exists' });
      } else if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: 'Email already registered' });
      }
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us to start analyzing credit agreements
          </p>
        </div>

        {/* Register Form */}
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
                placeholder="Choose a username"
                leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
                autoComplete="username"
                autoFocus
              />

              {/* Email Input */}
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="Enter your email"
                leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                autoComplete="email"
              />

              {/* Password Input */}
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                placeholder="Create a password"
                leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                helperText="Must be at least 6 characters"
                autoComplete="new-password"
              />

              {/* Confirm Password Input */}
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                autoComplete="new-password"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Create account
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in
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

export default RegisterPage;
