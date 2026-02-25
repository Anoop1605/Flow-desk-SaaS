// LoginPage.jsx — FlowDesk Member 1
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { modalVariants } from '../lib/animations';

// 1. Define the validation schema OUTSIDE the component
// WHY: We don't want to redefine this schema every time the component re-renders.
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // 2. Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 3. Form submission handler
  const onSubmit = async (data) => {
    try {
      setAuthError('');
      // Await the login function from AuthContext
      await login(data.email, data.password);
      // If successful, redirect to dashboard
      navigate('/', { replace: true });
    } catch (err) {
      setAuthError('Invalid credentials. Please try again.');
    }
  };

  return (
    // Canvas background
    <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-4 selection:bg-brand-500/30">
      
      {/* Container for animations */}
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Logo & Tagline (Fades & Slides up) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-display font-bold text-2xl shadow-glow">
              F
            </div>
            <span className="text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">
              FlowDesk
            </span>
          </div>
          <p className="text-slate-400 font-display">Your team's command center</p>
        </motion.div>

        {/* Form Card (Scales in) */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
          className="w-full bg-surface rounded-2xl border border-white/5 p-8 shadow-card relative overflow-hidden backdrop-blur-xl"
        >
          {/* Subtle gradient glow behind the card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

          <h1 className="text-2xl font-bold text-slate-50 mb-6">Welcome back</h1>

          {/* Error Banner */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{authError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email format</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                // This is where react-hook-form takes over the input
                {...register('email')}
                className={cn(
                  "w-full bg-surface-raised border rounded-lg px-4 py-2.5 text-slate-200 placeholder:text-slate-600 transition-colors",
                  errors.email 
                    ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20" 
                    : "border-white/10 focus:border-brand-500 focus:ring-brand-500/20"
                )}
              />
              {errors.email && (
                <p className="text-sm text-rose-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={cn(
                    "w-full bg-surface-raised border rounded-lg pl-4 pr-10 py-2.5 text-slate-200 placeholder:text-slate-600 transition-colors",
                    errors.password 
                      ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20" 
                      : "border-white/10 focus:border-brand-500 focus:ring-brand-500/20"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors hidden sm:block"
                  // Hide from screen readers as input type handles it
                  aria-hidden="true"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-rose-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="remember"
                  className="w-4 h-4 rounded appearance-none flex items-center justify-center bg-surface-raised border border-white/20 hover:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none transition-colors data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                >
                  <Checkbox.Indicator>
                    <Check size={12} className="text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="remember" className="text-sm text-slate-400 select-none cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative flex items-center justify-center py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-400 focus:ring-2 focus:ring-brand-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer Link */}
        <p className="mt-8 text-sm text-slate-500">
          Don't have a workspace?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

// Usage Example:
// <Route path="/login" element={<LoginPage />} />
