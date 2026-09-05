import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('monk@vihara.org');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication check
    setTimeout(() => {
      setIsLoading(false);
      if (email.trim().length > 0) {
        onLoginSuccess();
      } else {
        setError('Please enter a valid monastic administrator email.');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#ede3db] flex flex-col justify-center items-center px-4 py-12 relative select-none">
      {/* Top Bar with Return Link */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <button
          onClick={onBackToHome}
          className="text-xs font-medium text-[#705d53] hover:text-[#703100] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#e4d6cc]"
        >
          ← Return to Sanctuary Website
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-[#d8c8bd]/60 overflow-hidden animate-fade-in">
        {/* Top Decorative Terracotta Saffron Bar */}
        <div className="h-2 w-full bg-[#8c3c0b]" />

        <div className="p-8 sm:p-10 space-y-7">
          {/* Circular Sprout Emblem */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#f8ece4] flex items-center justify-center text-[#8c3c0b] shadow-inner">
              <svg 
                className="w-8 h-8" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2C12 2 13 7 17 8C21 9 22 13 22 13C22 13 18 13.5 16 11C14 8.5 13 6 12 2Z" />
                <path d="M12 2C12 2 11 7 7 8C3 9 2 13 2 13C2 13 6 13.5 8 11C10 8.5 11 6 12 2Z" />
                <path d="M12 11C12 11 13 16 17 17C21 18 22 22 22 22C22 22 18 22 15 19C13 16.5 12 13 12 11Z" />
                <path d="M12 11C12 11 11 16 7 17C3 18 2 22 2 22C2 22 6 22 9 19C11 16.5 12 13 12 11Z" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
            </div>

            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#231a15] font-normal tracking-tight">
                Vihara Admin Portal
              </h1>
              <p className="text-xs sm:text-sm text-[#705d53] mt-1 font-normal">
                Stewardship & Registry Access
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label 
                htmlFor="admin-email" 
                className="block text-xs font-semibold text-[#3b2e27]"
              >
                Email Address
              </label>
              <div className="relative rounded-xl border border-[#d6c5ba] bg-white focus-within:border-[#8c3c0b] focus-within:ring-1 focus-within:ring-[#8c3c0b] transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#887367]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="monk@vihara.org"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm text-[#231a15] placeholder:text-[#a8988e] bg-transparent outline-none rounded-xl"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label 
                htmlFor="admin-password" 
                className="block text-xs font-semibold text-[#3b2e27]"
              >
                Password
              </label>
              <div className="relative rounded-xl border border-[#d6c5ba] bg-white focus-within:border-[#8c3c0b] focus-within:ring-1 focus-within:ring-[#8c3c0b] transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#887367]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm text-[#231a15] placeholder:text-[#a8988e] bg-transparent outline-none rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#887367] hover:text-[#554339]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-[#554339] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#d6c5ba] text-[#8c3c0b] focus:ring-[#8c3c0b] accent-[#8c3c0b]"
                />
                <span>Remember device</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset instructions have been dispatched to registered monastic elders.')}
                className="text-[#8c3c0b] hover:text-[#703100] font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              id="admin-signin-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#8c3c0b] hover:bg-[#722f07] active:bg-[#5a2404] text-white text-sm font-semibold tracking-wide rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Authorized Access Footer Notice */}
          <div className="pt-2 border-t border-[#f0e4dc] flex items-center justify-center gap-1.5 text-xs text-[#887367]">
            <ShieldCheck className="w-4 h-4 text-[#8c3c0b]" />
            <span>Authorized Access Only</span>
          </div>
        </div>
      </div>

      {/* Demo helper hint */}
      <div className="mt-6 text-center text-xs text-[#887367]">
        <span>Demo portal credentials pre-filled. Click </span>
        <strong className="text-[#8c3c0b]">Sign In</strong>
        <span> to explore the dashboard.</span>
      </div>
    </div>
  );
};
