'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSamity } from '@/context/SamityContext';
import {
  Lock,
  Phone,
  User as UserIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Coins,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AuthView() {
  const { login, signup, showToast } = useSamity();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('01711-000001');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await login(phone, password);
      setIsSubmitting(false);
      if (!res.success) {
        showToast(res.error || 'Invalid mobile number or password', 'LOGIN FAILED');
      }
    } else {
      if (!name.trim()) {
        showToast('Please enter your full name', 'REQUIRED');
        setIsSubmitting(false);
        return;
      }
      const res = await signup(name, phone, password);
      setIsSubmitting(false);
      if (!res.success) {
        showToast(res.error || 'Failed to create account', 'SIGNUP FAILED');
      }
    }
  };

  const handlePreFill = (testPhone: string, testPass: string) => {
    setMode('login');
    setPhone(testPhone);
    setPassword(testPass);
    showToast(`Pre-filled credentials for ${testPhone}`, 'TEST ACCOUNT');
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-slate-50 text-slate-900 relative overflow-hidden select-none px-5 py-6">
      {/* Ambient Radial Gradient Accents for Subtle Polish */}
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-violet-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Mobile Header & Brand Lockup */}
      <div className="relative z-10 space-y-5">
        {/* Brand Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-700 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-white flex items-center justify-center">
                <Image
                  src="/icons/icon-192.png"
                  alt="SamityWheel Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  SamityWheel
                </h1>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-widest">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Rotating Savings &amp; Fair Lucky Draw
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-2xs">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fair Draw</span>
          </div>
        </div>

        {/* Hero Tagline */}
        <div className="pt-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-snug">
            {mode === 'login' ? 'Welcome back to your circle.' : 'Start your group savings journey.'}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
            {mode === 'login'
              ? 'Sign in to track verified monthly deposits and spin the monthly lottery wheel.'
              : 'Join a digital Samity with verified receipts, zero loss, and fair rotating prize pots.'}
          </p>
        </div>

        {/* Segmented Controller (iOS/Android Native Style) */}
        <div className="p-1 rounded-2xl bg-slate-200/80 border border-slate-300/70 grid grid-cols-2 relative shadow-inner">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`relative z-10 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`relative z-10 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Create Account</span>
          </button>
        </div>

        {/* Input Form Card */}
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-4"
        >
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-1.5"
              >
                <label htmlFor="signupName" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    id="signupName"
                    type="text"
                    required
                    placeholder="e.g. Asif Chowdhury"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-2xs"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Number Field */}
          <div className="space-y-1.5">
            <label htmlFor="authPhone" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-500 font-bold text-xs pointer-events-none">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-mono font-semibold text-slate-500 border-r border-slate-300 pr-2">
                  +880
                </span>
              </div>
              <input
                id="authPhone"
                type="text"
                required
                placeholder="017XX-XXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '5.5rem' }}
                className="w-full pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="authPassword" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>bcrypt hashed</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                id="authPassword"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 p-1.5 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs tracking-wide transition-all duration-150 active:scale-[0.98] shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>
              {isSubmitting
                ? 'Authenticating...'
                : mode === 'login'
                ? 'Sign In to Account'
                : 'Create & Join Samity'}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Quick Real Accounts Tray (Pre-seeded DB) */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Tap Test Accounts (Real DB):</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handlePreFill('01711-000001', 'password123')}
              className="p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/80 text-left transition active:scale-[0.97] group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-indigo-700 text-xs">Rahim</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-indigo-200/70 text-indigo-800 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <div className="text-slate-500 text-[10px] font-mono mt-1">01711-000001</div>
            </button>

            <button
              type="button"
              onClick={() => handlePreFill('01812-000002', 'password123')}
              className="p-3 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-left transition active:scale-[0.97] group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-700 text-xs">Nusrat</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 uppercase tracking-wider">
                  Member
                </span>
              </div>
              <div className="text-slate-500 text-[10px] font-mono mt-1">01812-000002</div>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Pills & Security Footer */}
      <div className="relative z-10 pt-6 pb-2 text-center space-y-3">
        <div className="flex items-center justify-center gap-2.5 text-[10px] text-slate-600 font-semibold flex-wrap">
          <span className="flex items-center gap-1 bg-white border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>PWA Ready</span>
          </span>
          <span className="flex items-center gap-1 bg-white border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            <Coins className="w-3 h-3 text-amber-500" />
            <span>Fair Wheel</span>
          </span>
          <span className="flex items-center gap-1 bg-white border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            <ShieldAlert className="w-3 h-3 text-indigo-600" />
            <span>Voucher Proof</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-400 font-medium">
          SamityWheel • Powered by Next.js 16 &amp; SQLite
        </div>
      </div>
    </div>
  );
}
