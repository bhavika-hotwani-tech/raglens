import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  Zap,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('sarah.chen@enterprise.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      errs.email = 'Please enter a valid work email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login({ email, password });
      toast.success(`Welcome back, ${data.user.name}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-stone-50">
      {/* Left Brand Panel (Soft sage/emerald tone, no neon/blue/purple) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-stone-100/90 border-r border-stone-200 p-12">
        <div>
          {/* Logo */}
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
              Enterprise Retrieval Architecture
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl leading-tight">
              Audit, trace, and evaluate advanced RAG with absolute confidence.
            </h1>
            <p className="mt-4 text-sm text-stone-600 leading-relaxed">
              Eliminate hallucinations with multi-query routing, cross-encoder reranking, and automated RAGAS benchmark evaluation suites.
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
                  Hybrid Dense & Sparse Search
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Combines high-dimensional dense vector embeddings with BM25 lexical precision via Reciprocal Rank Fusion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-stone-200 text-emerald-700 shadow-2xs shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  Automated Self-Correction Guard
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pre-generation factuality audits check every claim against source passages to eliminate ungrounded speculation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-stone-200 text-emerald-700 shadow-2xs shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  Granular Latency & Pipeline Tracing
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Full step-by-step audit trail showing query rewrites, rerank scores, and P95 latency per retrieval phase.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200/80 pt-6 text-xs text-stone-500">
          SOC2 Type II Certified • HIPAA Compliant Enterprise Deployment
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-stone-900">RAGLens</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              Sign in to RAGLens
            </h2>
            <p className="mt-1.5 text-xs text-stone-500">
              Enter your enterprise credentials to access the retrieval cockpit.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Work Email"
              type="email"
              icon={Mail}
              placeholder="name@enterprise.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-stone-300 accent-emerald-700"
                />
                Remember me
              </label>
              <span className="text-stone-400 cursor-not-allowed">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>

            <div className="rounded-lg bg-stone-100 p-3 border border-stone-200 text-xs text-stone-600">
              <span className="font-semibold text-stone-800">Demo Credentials:</span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Use any email and password with &ge; 8 characters (e.g. <code className="font-mono text-stone-700">password123</code>). Typing <code className="font-mono text-rose-700">wrong</code> triggers mock authentication rejection.
              </p>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-stone-600">
            Don't have an enterprise account?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
