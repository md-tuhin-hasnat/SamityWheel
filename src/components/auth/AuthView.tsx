'use client';

import React, { useState } from 'react';
import { useSamity } from '@/context/SamityContext';
import { UserRole } from '@/types/samity';

export function AuthView() {
  const { state, setCurrentUserId, setActiveView, showToast, resetDemoData } = useSamity();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginPhone, setLoginPhone] = useState('01711-000001');
  const [loginPassword, setLoginPassword] = useState('123456');

  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('member');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = state.users.find(
      (u) =>
        (u.phone.toLowerCase() === loginPhone.trim().toLowerCase() ||
          u.name.toLowerCase() === loginPhone.trim().toLowerCase()) &&
        u.password === loginPassword
    );

    if (foundUser) {
      setCurrentUserId(foundUser.id);
      setActiveView('dashboard');
      showToast(`Welcome back, ${foundUser.name}!`, 'LOGGED IN');
    } else {
      showToast('Invalid credentials. Use 123456 or tap Demo buttons below.', 'AUTH FAILED');
    }
  };

  const handleQuickDemo = (userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    if (user) {
      setLoginPhone(user.phone);
      setLoginPassword(user.password || '123456');
      setCurrentUserId(user.id);
      setActiveView('dashboard');
      showToast(`Switched account to ${user.name} (${user.role})`, 'DEMO');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupPhone.trim()) {
      showToast('Please fill all required fields', 'REQUIRED');
      return;
    }

    const newUser = {
      id: 'u' + (state.users.length + 1),
      name: signupName.trim(),
      phone: signupPhone.trim(),
      password: signupPassword.trim() || '123456',
      role: signupRole,
      hasWon: false,
      wonMonth: null,
      wonAmount: 0,
    };

    state.users.push(newUser);
    setCurrentUserId(newUser.id);
    setActiveView('dashboard');
    showToast(`Account created for ${newUser.name}!`, 'SIGNUP SUCCESS');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Auth Mode Toggle */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-3 text-center border-b-2 transition ${
              mode === 'login'
                ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-3 text-center border-b-2 transition ${
              mode === 'signup'
                ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="p-4 space-y-3.5">
            <div>
              <label htmlFor="loginPhone" className="block text-xs font-semibold text-slate-600 mb-1">
                Phone or Email
              </label>
              <input
                id="loginPhone"
                type="text"
                required
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="loginPassword" className="block text-xs font-semibold text-slate-600 mb-1">
                Password
              </label>
              <input
                id="loginPassword"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition active:scale-98 shadow-xs"
            >
              Log In
            </button>

            {/* Quick Demo Pre-fill */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('u1')}
                className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 transition active:scale-98"
              >
                <div className="font-bold text-slate-800">Member Demo</div>
                <div className="text-slate-500 text-[11px] font-mono mt-0.5">Rahim (01711...)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin1')}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 text-left hover:bg-indigo-50 transition active:scale-98"
              >
                <div className="font-bold text-indigo-900">Admin Demo</div>
                <div className="text-indigo-600 text-[11px] font-mono mt-0.5">admin@samity.com</div>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="p-4 space-y-3.5">
            <div>
              <label htmlFor="signupName" className="block text-xs font-semibold text-slate-600 mb-1">
                Full Name
              </label>
              <input
                id="signupName"
                type="text"
                required
                placeholder="e.g. Shakil Chowdhury"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="signupPhone" className="block text-xs font-semibold text-slate-600 mb-1">
                Mobile Number
              </label>
              <input
                id="signupPhone"
                type="text"
                required
                placeholder="017XX-XXXXXX"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="signupPassword" className="block text-xs font-semibold text-slate-600 mb-1">
                Password
              </label>
              <input
                id="signupPassword"
                type="password"
                required
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="signupRole" className="block text-xs font-semibold text-slate-600 mb-1">
                Role
              </label>
              <select
                id="signupRole"
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition active:scale-98 shadow-xs"
            >
              Create Account
            </button>
          </form>
        )}
      </div>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={resetDemoData}
          className="text-xs font-bold text-rose-600 hover:underline active:scale-95 transition"
        >
          Reset App Demo Data
        </button>
      </div>
    </div>
  );
}
