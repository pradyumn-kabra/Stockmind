"use client";

import React, { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
  };

  const openDashboard = () => {
    const destination = new URLSearchParams(window.location.search).get('next');
    router.replace(destination?.startsWith('/app') ? destination : '/app');
    router.refresh();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup' && !fullName.trim()) {
      setError('Enter your full name to create an account.');
      return;
    }

    if (!email.trim() || !password) {
      setError('Enter your email address and password to continue.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        openDashboard();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        openDashboard();
        return;
      }

      setSuccess('Account created. Check your email to confirm your account, then log in.');
      setMode('login');
      setPassword('');
    } catch {
      setError('Unable to reach the authentication service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F6F2] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-7 flex items-center justify-center gap-3" aria-label="Back to StockMind home">
          <Image src="/logo-icon.png" alt="StockMind" width={48} height={48} className="h-12 w-12" />
          <span className="text-2xl font-extrabold tracking-tight text-[#332522]">StockMind</span>
        </Link>

        <section className="rounded-3xl border border-[#E2D4C8] bg-white p-7 sm:p-9 shadow-xl shadow-[#4E342E]/10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-[#171512]">
              {mode === 'login' ? 'Welcome back !' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm text-[#71685D]">
              {mode === 'login'
                ? 'Sign in to open the inventory dashboard.'
                : 'Sign up to start using the StockMind workspace.'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#F3ECE7] p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                mode === 'login' ? 'bg-white text-[#4E342E] shadow-sm' : 'text-[#806F65] hover:text-[#4E342E]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                mode === 'signup' ? 'bg-white text-[#4E342E] shadow-sm' : 'text-[#806F65] hover:text-[#4E342E]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-[#332522]">
                  Full name <span aria-hidden="true" className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#795548]" />
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setError('');
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-[#D8C8BC] bg-[#FDFCFA] py-3 pl-10 pr-4 text-sm text-[#171512] outline-none transition focus:border-[#795548] focus:ring-2 focus:ring-[#795548]/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#332522]">
                Email <span aria-hidden="true" className="text-red-700">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#795548]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#D8C8BC] bg-[#FDFCFA] py-3 pl-10 pr-4 text-sm text-[#171512] outline-none transition focus:border-[#795548] focus:ring-2 focus:ring-[#795548]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#332522]">
                Password <span aria-hidden="true" className="text-red-700">*</span>
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#795548]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  className="w-full rounded-xl border border-[#D8C8BC] bg-[#FDFCFA] py-3 pl-10 pr-11 text-sm text-[#171512] outline-none transition focus:border-[#795548] focus:ring-2 focus:ring-[#795548]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71685D] hover:text-[#332522]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-800">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">{success}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#4E342E] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#4E342E]/20 transition hover:bg-[#332522] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? mode === 'login' ? 'Logging in…' : 'Creating account…'
                : mode === 'login' ? 'Login to Dashboard' : 'Create Account'}
            </button>
          </form>
        </section>

        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-[#795548] hover:text-[#4E342E]">
          ← Back to public website
        </Link>
      </div>
    </main>
  );
}
