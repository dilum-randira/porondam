import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { hasMinPasswordLength, isValidEmail } from '../../utils/validation';

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState({ email: '', password: '', general: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = { email: '', password: '', general: '' };

    if (!email) {
      nextErrors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (!hasMinPasswordLength(password)) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    if (nextErrors.email || nextErrors.password) {
      setErrorMessages(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessages({ email: '', password: '', general: '' });
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to log in. Please try again.';
      setErrorMessages((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-6 py-8 md:px-10">
        <div className="space-y-2">
          <div className="inline-flex items-baseline gap-1 text-2xl font-semibold tracking-tight text-pulse-primary">
            <span className="tracking-tight">Porondam</span>
            <span className="text-3xl leading-none">.</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="text-sm text-gray-500">
            Welcome back. Sign in to continue your connections.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Your Email
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-off-white px-3 py-2.5 focus-within:border-pulse-primary focus-within:ring-1 focus-within:ring-pulse-primary">
              <Mail className="h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                autoComplete="email"
              />
            </div>
            {errorMessages.email && (
              <p className="text-xs text-red-500">{errorMessages.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-off-white px-3 py-2.5 focus-within:border-pulse-primary focus-within:ring-1 focus-within:ring-pulse-primary">
              <Lock className="h-4 w-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errorMessages.password && (
              <p className="text-xs text-red-500">{errorMessages.password}</p>
            )}
          </div>

          <p className="text-xs leading-5 text-gray-500">
            Password recovery is not yet available in this prototype. Do not use a password that you use elsewhere.
          </p>

          {errorMessages.general && (
            <p role="alert" className="text-xs text-red-700">{errorMessages.general}</p>
          )}

          <Button
            type="submit"
            className="mt-2 w-full bg-pulse-primary text-white hover:bg-rose-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>

        </form>

        <p className="pt-2 text-center text-xs text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-pulse-primary hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
