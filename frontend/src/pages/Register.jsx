import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  Zap,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Work email is required';
    } else if (!emailRegex.test(email)) {
      errs.email = 'Please provide a valid corporate email';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ name, email, password });
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-stone-50">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-stone-100/90 border-r border-stone-200 p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">
              RAGLens
            </span>
          </div>

          <div className="mt-16 max-w-lg">
            <span className="rounded-full bg-emerald-100/70 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
              Enterprise Deployment Ready
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl leading-tight">
              Build trusted retrieval engines for complex documents.
            </h1>
            <p className="mt-4 text-sm text-stone-600 leading-relaxed">
              Start evaluating and querying multi-format knowledge bases with automated citation tracing and sub-second latency.
            </p>
          </div>

          {/* 3 Key Feature Bullets */}
          <div className="mt-12 space-y-5 max-w-md">
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-stone-200 text-emerald-700 shadow-2xs shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  Sub-500ms P95 Latency
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Optimized dense vector filtering and concurrent lexical ranking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-stone-200 text-emerald-700 shadow-2xs shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  RAGAS Quality Benchmarking
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Automated testing pipelines for Faithfulness, Precision, and Recall.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-stone-200 text-emerald-700 shadow-2xs shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  Granular Evidence Citations
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Accurate page references, chunk excerpts, and cross-encoder relevance scores.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200/80 pt-6 text-xs text-stone-500">
          SOC2 Type II Certified • HIPAA Compliant Enterprise Deployment
        </div>
      </div>

      {/* Right Register Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-stone-900">RAGLens</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              Create Enterprise Account
            </h2>
            <p className="mt-1.5 text-xs text-stone-500">
              Join your organization's secure RAGLens workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="Sarah Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Corporate Email"
              type="email"
              icon={Mail}
              placeholder="sarah.chen@enterprise.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password (min 8 characters)"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Register Account
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-stone-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
