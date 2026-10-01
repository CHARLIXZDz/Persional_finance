import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Mail, Lock, User, Check, Sun, Moon, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';
import { FlagIcon } from '../common/FlagIcon';

export const AuthView = () => {
  const {
    signIn,
    signInDemo,
    signUp,
    resetPassword,
    resolveEmailFromIdentifier,
    signInWithGoogle,
    language,
    setLanguage,
    languages,
    isDarkMode,
    setIsDarkMode,
    t,
    showToast,
  } = useFinance();

  // Tab mode: 'signIn' | 'signUp'
  const [tab, setTab] = useState('signIn');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status & Errors
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Dropdowns & Modals
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Translation helper with fallback
  const getAuthText = (key, params = {}) => {
    return t(`auth.${key}`, params);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#authLangDropdownWrapper')) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Real-time password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '-' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    if (score === 0 && pass.length > 0) score = 1;

    const levels = getAuthText('strengthLevels');
    const labelList = Array.isArray(levels) ? levels : ['Weak', 'Fair', 'Good', 'Strong'];
    return {
      score,
      text: labelList[score - 1] || labelList[0],
    };
  };

  const strength = getPasswordStrength(password);

  // Switch tab helper
  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setFieldErrors({});
  };

  // Handle Sign In Submit
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!email.trim()) {
      errors.email = getAuthText('errEmailRequired');
    }
    if (!password) {
      errors.password = getAuthText('errPasswordRequired');
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await signIn(email, password);
      if (!res.success) {
        setFieldErrors({
          form: res.error?.includes('Invalid login credentials')
            ? getAuthText('errInvalidCredentials') || 'Email or password incorrect'
            : res.error || 'Login failed',
        });
      } else {
        triggerConfetti();
      }
    } catch (err) {
      setFieldErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!fullName.trim()) {
      errors.fullName = getAuthText('errNameRequired');
    }
    if (!email.trim()) {
      errors.email = getAuthText('errEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = getAuthText('errEmailInvalid');
    }
    if (!password) {
      errors.password = getAuthText('errPasswordRequired');
    } else if (password.length < 6) {
      errors.password = getAuthText('errPasswordShort');
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = getAuthText('errPasswordMismatch');
    }
    if (!agreeTerms) {
      errors.terms = getAuthText('errAgreeRequired');
      showToast({
        type: 'error',
        title: 'Notice',
        message: getAuthText('errAgreeRequired'),
      });
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await signUp(email, password, fullName);
      if (!res.success) {
        setFieldErrors({ form: res.error || 'Registration failed' });
      } else {
        triggerConfetti();
        if (res.needsConfirmation) {
          showToast({
            type: 'info',
            title: getAuthText('toastRegisterSuccess'),
            message: 'Please check your email inbox to confirm your account.',
            duration: 5000,
          });
        }
      }
    } catch (err) {
      setFieldErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Biometric FaceID Scan Simulation
  const startBiometricScan = () => {
    setIsBiometricModalOpen(true);
    setScanProgress(0);

    setTimeout(() => {
      setScanProgress(100);
    }, 80);

    setTimeout(() => {
      setIsBiometricModalOpen(false);
      triggerConfetti();
      signInDemo('alex');
    }, 1500);
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim();
    if (!targetEmail) return;

    setIsForgotLoading(true);
    try {
      const res = await resetPassword(targetEmail);
      if (!res.success) {
        showToast({
          type: 'error',
          title: getAuthText('modalForgotTitle'),
          message: res.error || 'Failed to send password reset email',
        });
      } else {
        setIsForgotModalOpen(false);
        showToast({
          type: 'success',
          title: getAuthText('modalForgotTitle'),
          message: getAuthText('toastResetSent', { email: targetEmail }) || `Password reset link sent to ${targetEmail}`,
        });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message,
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Social Login: Google
  const handleSocialClick = async (provider) => {
    if (provider === 'Google') {
      setIsLoading(true);
      try {
        const res = await signInWithGoogle();
        if (!res.success) {
          const errMsg = res.error || '';
          if (errMsg.includes('provider is not enabled') || errMsg.includes('Unsupported provider')) {
            showToast({
              type: 'info',
              title: 'Google OAuth',
              message:
                language === 'vi'
                  ? 'Google OAuth chưa kích hoạt trong Supabase Console. Bạn hãy đăng nhập hoặc tạo tài khoản trực tiếp bằng Gmail ở biểu mẫu bên dưới nhé!'
                  : language === 'lo'
                  ? 'ລະບົບ Google OAuth ຍັງບໍ່ໄດ້ເປີດໃຊ້ໃນ Supabase Console. ທ່ານສາມາດເຂົ້າສູ່ລະບົບ ຫຼື ສ້າງບັນຊີດ້ວຍ Gmail ໃນແບບຟອມດ້ານລຸ່ມໄດ້ເລີຍ!'
                  : 'Google OAuth is not enabled in Supabase Console. Please sign in or register with your Gmail in the form below!',
            });
          } else {
            showToast({
              type: 'error',
              title: 'Google Sign In',
              message: errMsg,
            });
          }
        }
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Google Sign In',
          message: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentLangObj = languages[language] || languages['lo'];

  return (
    <div className="w-full flex flex-col justify-between min-h-full font-sans antialiased text-slate-900 dark:text-slate-100 animate-fade-in">
      {/* 1. TOP NAVIGATION CONTROLS */}
      <header className="px-5 pt-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.25rem))] sm:pt-3 pb-2.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0A0F1D] sticky top-0 z-20">
        {/* Brand Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex-shrink-0">
            <span>💸</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-600 dark:from-white dark:via-slate-100 dark:to-emerald-400 bg-clip-text text-transparent">
              MoneyDairy
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              FINTECH PRO
            </span>
          </div>
        </div>

        {/* Controls: Language Dropdown (Flag only) + Theme Switch */}
        <div className="flex items-center gap-2">
          {/* Language Dropdown - Flag only */}
          <div className="relative" id="authLangDropdownWrapper">
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/50 flex items-center justify-center transition-all shadow-sm active:scale-95"
              aria-label="Select Language"
              title={currentLangObj.name}
            >
              <FlagIcon code={language} className="w-5 h-3.5" rounded={true} />
            </button>

            {/* Menu */}
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-slide-up flex flex-col gap-1">
                {Object.values(languages).map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      language === lang.code
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FlagIcon code={lang.code} className="w-5 h-3.5" rounded={true} />
                      <span className="text-xs font-semibold">{lang.nativeName}</span>
                    </div>
                    {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/50 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Toggle Theme"
            title="Toggle Dark / Light Theme"
          >
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-emerald-400 transition-transform" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 transition-transform" />
            )}
          </button>
        </div>
      </header>

      {/* 2. QUICK DEMO BAR (Matches prototype exactly) */}
      <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border-b border-emerald-500/20 px-5 py-2 flex items-center gap-2.5 text-xs overflow-x-auto no-scrollbar">
        <span className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap text-[11px]">
          {language === 'lo' ? 'ທົດລອງດ່ວນ:' : language === 'vi' ? 'Dùng thử nhanh:' : 'Quick Demo:'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTab('signIn');
              setEmail('alex.phommaseng@gmail.com');
              setPassword('demo');
              setFieldErrors({});
              showToast({
                type: 'info',
                title: 'Alex (Pro)',
                message:
                  language === 'lo'
                    ? 'ປ້ອນຂໍ້ມູນ Alex (Pro) ສຳເລັດແລ້ວ! ກົດ "ເຂົ້າສູ່ລະບົບ" ໄດ້ເລີຍ'
                    : language === 'vi'
                    ? 'Đã điền thông tin Alex (Pro)! Bấm "Đăng nhập" để tiếp tục'
                    : 'Alex (Pro) account filled! Tap "Sign In" to proceed',
              });
            }}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-emerald-500/30 hover:border-emerald-500 px-2.5 py-1 rounded-full text-slate-800 dark:text-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all shadow-sm active:scale-95 hover:-translate-y-0.5"
            title="Auto-fill Alex (Pro) credentials"
          >
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
              EP
            </span>
            <span>Alex (Pro)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('signIn');
              setEmail('guest@moneydairy.app');
              setPassword('demo');
              setFieldErrors({});
              showToast({
                type: 'info',
                title: 'Guest Demo',
                message:
                  language === 'lo'
                    ? 'ປ້ອນຂໍ້ມູນ Guest ສຳເລັດແລ້ວ! ກົດ "ເຂົ້າສູ່ລະບົບ" ໄດ້ເລີຍ'
                    : language === 'vi'
                    ? 'Đã điền thông tin Guest! Bấm "Đăng nhập" để tiếp tục'
                    : 'Guest Demo account filled! Tap "Sign In" to proceed',
              });
            }}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-indigo-500/30 hover:border-indigo-500 px-2.5 py-1 rounded-full text-slate-800 dark:text-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all shadow-sm active:scale-95 hover:-translate-y-0.5"
            title="Auto-fill Guest Demo credentials"
          >
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[9px] font-bold">
              GD
            </span>
            <span>Guest Demo</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN FORM BODY */}
      <main className="px-5 py-6 flex-1 flex flex-col justify-center">
        {/* Hero Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white mb-1.5">
            {tab === 'signIn' ? getAuthText('titleSignIn') : getAuthText('titleSignUp')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
            {tab === 'signIn' ? getAuthText('subSignIn') : getAuthText('subSignUp')}
          </p>
        </div>

        {/* Segmented Tab Switcher with smooth slider */}
        <div className="relative grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-900/90 rounded-2xl border border-slate-300/40 dark:border-white/[0.08] mb-5">
          {/* Slider Pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-white/[0.08] transition-transform duration-300 ease-out ${
              tab === 'signIn' ? 'translate-x-0 left-1' : 'translate-x-full left-1'
            }`}
          />

          <button
            type="button"
            onClick={() => handleTabSwitch('signIn')}
            className={`relative z-10 py-2.5 text-xs font-bold text-center transition-colors ${
              tab === 'signIn'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {getAuthText('tabSignIn')}
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('signUp')}
            className={`relative z-10 py-2.5 text-xs font-bold text-center transition-colors ${
              tab === 'signUp'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {getAuthText('tabSignUp')}
          </button>
        </div>

        {/* Global Form Error Alert */}
        {fieldErrors.form && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed animate-shake">
            {fieldErrors.form}
          </div>
        )}

        {/* SIGN IN FORM */}
        {tab === 'signIn' ? (
          <form onSubmit={handleSignInSubmit} className="space-y-4" noValidate>
            {/* Email / Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {getAuthText('labelEmail')}
              </label>
              <div className="relative flex items-center">
                {email && !email.includes('@') ? (
                  <User
                    className={`w-4 h-4 absolute left-3.5 transition-colors pointer-events-none ${
                      fieldErrors.email ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  />
                ) : (
                  <Mail
                    className={`w-4 h-4 absolute left-3.5 transition-colors pointer-events-none ${
                      fieldErrors.email ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  />
                )}
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  placeholder={
                    getAuthText('placeholderEmailOrUser') ||
                    (language === 'vi'
                      ? 'Email hoặc tên đăng nhập'
                      : language === 'lo'
                      ? 'ອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້'
                      : 'Email or Username')
                  }
                  autoComplete="username"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-100/90 dark:bg-slate-900/80 border ${
                    fieldErrors.email
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-slate-300/60 dark:border-white/[0.08]'
                  } rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] font-semibold text-rose-500 pl-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {getAuthText('labelPassword')}
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    let target = (email || '').trim();
                    if (target && !target.includes('@')) {
                      const resolved = await resolveEmailFromIdentifier(target);
                      if (resolved) target = resolved;
                    }
                    setForgotEmail(target || 'alex@moneydairy.app');
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-opacity"
                >
                  {getAuthText('linkForgotPassword')}
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock
                  className={`w-4 h-4 absolute left-3.5 transition-colors pointer-events-none ${
                    fieldErrors.password ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-11 py-3 bg-slate-100/90 dark:bg-slate-900/80 border ${
                    fieldErrors.password
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-slate-300/60 dark:border-white/[0.08]'
                  } rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] font-semibold text-rose-500 pl-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember device checkbox */}
            <div className="pt-0.5">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                    rememberDevice
                      ? 'bg-emerald-500 text-white shadow-[0_2px_6px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {rememberDevice && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {getAuthText('rememberDevice')}
                </span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-[0_12px_24px_-6px_rgba(16,185,129,0.45)] hover:shadow-[0_16px_28px_-6px_rgba(16,185,129,0.55)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{getAuthText('btnSignIn')}</span>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {getAuthText('labelFullName')}
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                  }}
                  placeholder="Alex Phommaseng"
                  autoComplete="name"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-100/90 dark:bg-slate-900/80 border ${
                    fieldErrors.fullName
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-slate-300/60 dark:border-white/[0.08]'
                  } rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-[11px] font-semibold text-rose-500 pl-1">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {getAuthText('labelEmailOnly') || 'Email'}
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-100/90 dark:bg-slate-900/80 border ${
                    fieldErrors.email
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-slate-300/60 dark:border-white/[0.08]'
                  } rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] font-semibold text-rose-500 pl-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {getAuthText('labelPassword')}
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-100/90 dark:bg-slate-900/80 border ${
                    fieldErrors.password
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-slate-300/60 dark:border-white/[0.08]'
                  } rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="pt-1.5 space-y-1 animate-fade-in">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    <div
                      className={`rounded-full transition-colors ${
                        strength.score >= 1 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        strength.score >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        strength.score >= 3 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        strength.score >= 4 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">{getAuthText('strengthHint')}</span>
                    <span
                      className={`font-bold ${
                        strength.score === 1
                          ? 'text-rose-500'
                          : strength.score === 2
                          ? 'text-amber-500'
                          : strength.score === 3
                          ? 'text-blue-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {strength.text}
                    </span>
                  </div>
                </div>
              )}

              {fieldErrors.password && (
                <p className="text-[11px] font-semibold text-rose-500 pl-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {getAuthText('labelConfirmPassword')}
              </label>
              <div className="relative flex items-center">
                <ShieldCheck className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-100/90 dark:bg-slate-900/80 border ${
                    fieldErrors.confirmPassword
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-slate-300/60 dark:border-white/[0.08]'
                  } rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] font-semibold text-rose-500 pl-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="inline-flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    agreeTerms
                      ? 'bg-emerald-500 text-white shadow-[0_2px_6px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {getAuthText('agreeTerms')}
                </span>
              </label>
            </div>

            {/* Sign Up Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-[0_12px_24px_-6px_rgba(16,185,129,0.45)] hover:shadow-[0_16px_28px_-6px_rgba(16,185,129,0.55)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{getAuthText('btnSignUp')}</span>
              )}
            </button>
          </form>
        )}

        {/* 4. ALTERNATIVE AUTH DIVIDER */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {getAuthText('orContinueWith')}
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
        </div>

        {/* 5. BIOMETRIC FACEID / FINGERPRINT BUTTON (Sign In only) */}
        {tab === 'signIn' && (
          <button
            type="button"
            onClick={startBiometricScan}
            className="w-full mb-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 hover:from-indigo-500/20 hover:to-emerald-500/20 border border-indigo-500/30 hover:border-indigo-500/60 transition-all text-left flex items-center gap-3.5 group shadow-sm active:scale-[0.99]"
          >
            {/* Biometric Reticle Box */}
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform flex-shrink-0">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M9 9h.01M15 9h.01M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {getAuthText('biometricTitle')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {getAuthText('biometricSub')}
              </span>
            </div>
          </button>
        )}

        {/* 6. SOCIAL BUTTON (Google) */}
        <div>
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialClick('Google')}
            className="w-full py-2.5 px-3 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-sm active:scale-95"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.1.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12c0 2.2.7 4.2 1.9 6.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>
      </main>

      {/* 7. FOOTER */}
      <footer className="px-5 py-4 border-t border-slate-200/80 dark:border-white/[0.07] text-center bg-white/40 dark:bg-slate-950/20">
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mb-1">
          <button
            type="button"
            onClick={() =>
              showToast({
                type: 'info',
                title: getAuthText('linkPrivacy'),
                message: 'Your personal financial records are encrypted on-device.',
              })
            }
            className="hover:text-emerald-500 transition-colors"
          >
            {getAuthText('linkPrivacy')}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() =>
              showToast({
                type: 'info',
                title: getAuthText('linkTerms'),
                message: 'Standard Fintech Terms of Service applied.',
              })
            }
            className="hover:text-emerald-500 transition-colors"
          >
            {getAuthText('linkTerms')}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => signInDemo('alex')}
            className="hover:text-emerald-500 transition-colors"
          >
            {getAuthText('linkReturnApp')}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-400">
          MoneyDairy v1.1.0 • Secure Authentication Suite
        </p>
      </footer>

      {/* 8. FORGOT PASSWORD MODAL */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-modal-pop">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {getAuthText('modalForgotTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {getAuthText('modalForgotDesc')}
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {getAuthText('labelEmail')}
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {getAuthText('btnCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading || !forgotEmail.trim()}
                  className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs shadow-glow-emerald hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isForgotLoading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{getAuthText('btnSendReset')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. BIOMETRIC FACEID SCAN SIMULATION MODAL */}
      {isBiometricModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-modal-pop text-center flex flex-col items-center">
            {/* Scanner Reticle & Laser Beam */}
            <div className="relative w-28 h-28 rounded-3xl bg-indigo-500/10 border-2 border-dashed border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4 overflow-hidden">
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10B981] animate-scan-laser" />
              <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M12 2a10 10 0 0 0-10 10c0 4.2 2.6 7.8 6.3 9.3" />
                <path d="M12 6a6 6 0 0 0-6 6c0 2.2 1.2 4.1 3 5.2" />
                <path d="M12 10a2 2 0 0 0-2 2c0 .6.3 1.2.7 1.6" />
                <path d="M12 14v4M12 18h4M16 12h4M16 16l4 4" />
              </svg>
            </div>

            <h3 className="text-base font-black text-white mb-1">
              {getAuthText('scanTitle')}
            </h3>
            <p className="text-[11px] text-slate-400 max-w-[220px] mb-4 leading-relaxed">
              {getAuthText('scanSub')}
            </p>

            {/* Scan progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-[1400ms] ease-out rounded-full"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsBiometricModalOpen(false)}
              className="py-2 px-4 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              {getAuthText('btnCancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthView;
