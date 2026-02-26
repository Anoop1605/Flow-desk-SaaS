// RegisterPage.jsx — FlowDesk Member 1
// Multi-step org registration form (3 steps):
//   Step 1: Organization Details (name, industry, plan)
//   Step 2: Admin Account (first name, last name, email, password, confirm password)
//   Step 3: Confirmation summary → "Create Workspace" CTA
//
// WHY multi-step?
//   Breaking a long form into digestible steps reduces user drop-off.
//   Each step validates independently so users get instant feedback
//   instead of a wall of errors at the end.
//
// HOW it fits in the architecture:
//   Presentation Layer → fires POST /api/auth/register → Backend creates tenant schema + admin user
//   Phase 1: Mock submit (no real backend call yet)
//   Phase 2: Real API integration

import { useState, useCallback, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { modalVariants, pageVariants } from '../lib/animations';

// ─── Zod Validation Schemas ───────────────────────────────────────────────────
// WHY separate schemas per step?
//   Each step validates independently. This way, Step 1 errors don't block
//   the user from even seeing Step 2. We merge data from all steps on submit.

const step1Schema = z.object({
  orgName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name is too long'),
  industry: z.string().optional(),
  plan: z.enum(['free', 'pro']),
});

const step2Schema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required'),
    email: z
      .string()
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // Attach error to confirmPassword field
  });

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'Marketing',
  'Design',
  'Other',
];

// Step metadata for the progress indicator
const STEPS = [
  { number: 1, label: 'Organization', icon: Building2 },
  { number: 2, label: 'Admin Account', icon: User },
  { number: 3, label: 'Confirmation', icon: CheckCircle2 },
];

// ─── Animation Variants ──────────────────────────────────────────────────────
// WHY custom variants here? The step transitions need directional awareness —
// moving forward slides left-to-right, moving backward slides right-to-left.

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

// ─── Reusable Input Component ─────────────────────────────────────────────────
// WHY: We have 6+ input fields across steps. Extracting a component avoids
// duplicating the same Tailwind classes and error rendering logic everywhere.

const FormInput = forwardRef(function FormInput({ label, type = 'text', placeholder, error, className, ...props }, ref) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={cn(
          'w-full bg-surface-raised border rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-rose-400 mt-1" role="alert">{error}</p>
      )}
    </div>
  );
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RegisterPage() {
  // currentStep: 1, 2, or 3
  const [currentStep, setCurrentStep] = useState(1);
  // direction: +1 (forward) or -1 (backward) — controls animation direction
  const [direction, setDirection] = useState(1);
  // Collected data from all steps (merged on final submit)
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // ── Step 1 Form ─────────────────────────────────────────────────────────
  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      orgName: formData.orgName || '',
      industry: formData.industry || '',
      plan: formData.plan || 'free',
    },
  });

  // ── Step 2 Form ─────────────────────────────────────────────────────────
  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      email: formData.email || '',
      password: formData.password || '',
      confirmPassword: formData.confirmPassword || '',
    },
  });

  // ── Navigation Handlers ──────────────────────────────────────────────────

  const goToStep = useCallback((step, dir) => {
    setDirection(dir);
    setCurrentStep(step);
  }, []);

  const handleStep1Next = useCallback(
    (data) => {
      // Merge Step 1 data into formData
      setFormData((prev) => ({ ...prev, ...data }));
      goToStep(2, 1); // Move forward
    },
    [goToStep]
  );

  const handleStep2Next = useCallback(
    (data) => {
      // Merge Step 2 data into formData
      setFormData((prev) => ({ ...prev, ...data }));
      goToStep(3, 1); // Move forward
    },
    [goToStep]
  );

  const handleBack = useCallback(
    (step) => {
      goToStep(step, -1); // Move backward
    },
    [goToStep]
  );

  // ── Final Submit ─────────────────────────────────────────────────────────
  const handleCreateWorkspace = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Phase 1: Simulate API call
      // Phase 2: Replace with → await api.post('/api/auth/register', formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success! Show toast and redirect to login
      toast.success('Workspace created!', {
        description: 'Log in to get started.',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Registration failed', {
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate]);

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-4 selection:bg-brand-500/30">
      <div className="w-full max-w-lg flex flex-col items-center">

        {/* ── Logo & Tagline ──────────────────────────────────────────── */}
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
          <p className="text-slate-400 font-display">Create your workspace</p>
        </motion.div>

        {/* ── Step Progress Indicator ─────────────────────────────────── */}
        {/* WHY layoutId? Framer Motion uses layoutId to animate the active
            indicator sliding between steps — feels fluid and intentional */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex items-center gap-3 mb-8"
        >
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center gap-3">
              <div className="relative flex flex-col items-center gap-1.5">
                {/* Step circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative',
                    currentStep === step.number
                      ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                      : currentStep > step.number
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-white/10 bg-white/5 text-slate-500'
                  )}
                >
                  {/* Active glow ring */}
                  {currentStep === step.number && (
                    <motion.div
                      layoutId="step-indicator"
                      className="absolute inset-0 rounded-full border-2 border-brand-500 shadow-glow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  {currentStep > step.number ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <step.icon size={18} />
                  )}
                </div>
                {/* Step label */}
                <span
                  className={cn(
                    'text-[11px] font-medium transition-colors duration-300',
                    currentStep === step.number
                      ? 'text-brand-400'
                      : currentStep > step.number
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 rounded-full mb-5 transition-colors duration-500',
                    currentStep > step.number
                      ? 'bg-emerald-500/50'
                      : 'bg-white/10'
                  )}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* ── Form Card ──────────────────────────────────────────────── */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
          className="w-full bg-surface rounded-2xl border border-white/5 p-8 shadow-card relative overflow-hidden backdrop-blur-xl"
        >
          {/* Top gradient line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

          {/* AnimatePresence handles enter/exit of each step */}
          <AnimatePresence mode="wait" custom={direction}>
            {/* ── STEP 1: Organization Details ─────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h2 className="text-xl font-bold text-slate-50 mb-1">
                  Organization Details
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  Tell us about your team's workspace
                </p>

                <form
                  onSubmit={step1Form.handleSubmit(handleStep1Next)}
                  className="space-y-5"
                >
                  {/* Org Name */}
                  <FormInput
                    label="Organization Name"
                    placeholder="Acme Inc."
                    error={step1Form.formState.errors.orgName?.message}
                    {...step1Form.register('orgName')}
                  />

                  {/* Industry (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      Industry{' '}
                      <span className="text-slate-500 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        {...step1Form.register('industry')}
                        className="w-full bg-surface-raised border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors cursor-pointer"
                      >
                        <option value="">Select industry...</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Plan</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Free Plan Card */}
                      <label
                        className={cn(
                          'relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:bg-white/[0.02]',
                          step1Form.watch('plan') === 'free'
                            ? 'border-brand-500 bg-brand-500/5 shadow-glow-sm'
                            : 'border-white/10 bg-white/[0.02]'
                        )}
                      >
                        <input
                          type="radio"
                          value="free"
                          {...step1Form.register('plan')}
                          className="sr-only"
                        />
                        <span className="text-sm font-semibold text-slate-200">Free</span>
                        <span className="text-xs text-slate-400 mt-1">Up to 5 members</span>
                        {step1Form.watch('plan') === 'free' && (
                          <motion.div
                            layoutId="plan-indicator"
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center"
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          >
                            <CheckCircle2 size={12} className="text-white" />
                          </motion.div>
                        )}
                      </label>

                      {/* Pro Plan Card */}
                      <label
                        className={cn(
                          'relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:bg-white/[0.02]',
                          step1Form.watch('plan') === 'pro'
                            ? 'border-violet-500 bg-violet-500/5 shadow-glow-violet'
                            : 'border-white/10 bg-white/[0.02]'
                        )}
                      >
                        <input
                          type="radio"
                          value="pro"
                          {...step1Form.register('plan')}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-200">Pro</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-500/15 text-violet-400 border border-violet-500/30">
                            <Sparkles size={10} />
                            Popular
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 mt-1">Unlimited members</span>
                        {step1Form.watch('plan') === 'pro' && (
                          <motion.div
                            layoutId="plan-indicator"
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center"
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          >
                            <CheckCircle2 size={12} className="text-white" />
                          </motion.div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-400 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: Admin Account ────────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h2 className="text-xl font-bold text-slate-50 mb-1">
                  Admin Account
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  You'll be the workspace administrator
                </p>

                <form
                  onSubmit={step2Form.handleSubmit(handleStep2Next)}
                  className="space-y-5"
                >
                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      label="First Name"
                      placeholder="John"
                      error={step2Form.formState.errors.firstName?.message}
                      {...step2Form.register('firstName')}
                    />
                    <FormInput
                      label="Last Name"
                      placeholder="Doe"
                      error={step2Form.formState.errors.lastName?.message}
                      {...step2Form.register('lastName')}
                    />
                  </div>

                  {/* Email */}
                  <FormInput
                    label="Work Email"
                    type="email"
                    placeholder="john@acme.com"
                    autoComplete="email"
                    error={step2Form.formState.errors.email?.message}
                    {...step2Form.register('email')}
                  />

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        autoComplete="new-password"
                        {...step2Form.register('password')}
                        className={cn(
                          'w-full bg-surface-raised border rounded-lg pl-4 pr-10 py-2.5 text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
                          step2Form.formState.errors.password
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                            : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-hidden="true"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {step2Form.formState.errors.password && (
                      <p className="text-sm text-rose-400 mt-1" role="alert">
                        {step2Form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        {...step2Form.register('confirmPassword')}
                        className={cn(
                          'w-full bg-surface-raised border rounded-lg pl-4 pr-10 py-2.5 text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
                          step2Form.formState.errors.confirmPassword
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                            : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-hidden="true"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {step2Form.formState.errors.confirmPassword && (
                      <p className="text-sm text-rose-400 mt-1" role="alert">
                        {step2Form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Button Row */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleBack(1)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-400 focus:ring-2 focus:ring-brand-500/50 transition-all"
                    >
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: Confirmation ─────────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h2 className="text-xl font-bold text-slate-50 mb-1">
                  Almost there!
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  Review your workspace details
                </p>

                {/* Summary Card */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4 mb-6">
                  {/* Org Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-glow-sm shrink-0">
                      {formData.orgName?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {formData.orgName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formData.industry || 'No industry selected'} ·{' '}
                        <span
                          className={cn(
                            'font-mono font-bold uppercase',
                            formData.plan === 'pro'
                              ? 'text-violet-400'
                              : 'text-brand-400'
                          )}
                        >
                          {formData.plan} plan
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* Admin Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-violet-500 flex items-center justify-center text-white text-sm font-medium shadow-glow-sm shrink-0">
                      {formData.firstName?.charAt(0)?.toUpperCase()}
                      {formData.lastName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{formData.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-500/15 text-violet-400 border border-violet-500/30">
                        Admin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Button Row */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleBack(2)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateWorkspace}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-violet-600 text-white font-medium hover:from-brand-400 hover:to-violet-500 focus:ring-2 focus:ring-brand-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-glow-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Create Workspace
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Footer Link ────────────────────────────────────────────── */}
        <p className="mt-8 text-sm text-slate-500">
          Already have a workspace?{' '}
          <Link
            to="/login"
            className="text-brand-400 hover:text-brand-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Usage Example:
// <Route path="/register" element={<RegisterPage />} />
