/**
 * MoneyDairy - Authentication & Login Script
 * Handles: i18n, Theme sync, Form validation, Password strength,
 * Biometric authentication simulation, Demo user autofill, Session state
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Multi-Language (i18n) Dictionary
  // =========================================================================
  const TRANSLATIONS = {
    lo: {
      quickDemoLabel: '⚡ ທົດລອງດ່ວນ:',
      demoAlex: 'Alex (Pro)',
      demoGuest: 'Guest Demo',
      badgePro: 'PRO',
      sessionActive: 'ບັນຊີພ້ອມໃຊ້ງານ • ໂໝດປອດໄພ',
      statBalance: 'ຍອດເງິນຄາດຄະເນ',
      statSecurity: 'ລະດັບຄວາມປອດໄພ',
      btnLaunchApp: 'ເປີດແອັບ MoneyDairy ຫຼັກ',
      btnTestBiometric: 'ທົດສອບສະແກນ FaceID ອີກຄັ້ງ',
      btnLogout: 'ອອກຈາກລະບົບ',
      titleSignIn: 'ຍິນດີຕ້ອນຮັບກັບມາ',
      subSignIn: 'ເຂົ້າສູ່ລະບົບເພື່ອຈັດການງົບປະມານ ແລະ ການເງິນຂອງທ່ານ',
      titleSignUp: 'ເລີ່ມຕົ້ນການເງິນທີ່ດີ',
      subSignUp: 'ເຂົ້າຮ່ວມ MoneyDairy ມື້ນີ້ ເພື່ອຄວບຄຸມການເງິນຂອງທ່ານຢ່າງໝັ້ນໃຈ',
      tabSignIn: 'ເຂົ້າສູ່ລະບົບ',
      tabSignUp: 'ສ້າງບັນຊີໃໝ່',
      labelEmail: 'ອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້',
      labelPassword: 'ລະຫັດຜ່ານ',
      linkForgotPassword: 'ລືມລະຫັດຜ່ານ?',
      rememberDevice: 'ຈື່ການເຂົ້າສູ່ລະບົບໃນອຸປະກອນນີ້',
      btnSignIn: 'ເຂົ້າສູ່ລະບົບ',
      labelFullName: 'ຊື່ ແລະ ນາມສະກຸນ',
      labelConfirmPassword: 'ຢືນຢັນລະຫັດຜ່ານ',
      strengthHint: 'ຄວາມແຂງແຮງ:',
      agreeTerms: 'ຂ້າພະເຈົ້າຍອມຮັບເງື່ອນໄຂການບໍລິການ ແລະ ຄວາມເປັນສ່ວນຕົວ',
      btnSignUp: 'ສ້າງບັນຊີຟຣີ',
      orContinueWith: 'ຫຼື ເຂົ້າສູ່ລະບົບດ້ວຍ',
      biometricTitle: 'FaceID / ສະແກນລາຍນິ້ວມື',
      biometricSub: 'ເຂົ້າສູ່ລະບົບໄວດ້ວຍລະບົບຊີວະມິຕິ',
      linkPrivacy: 'ຄວາມເປັນສ່ວນຕົວ',
      linkTerms: 'ເງື່ອນໄຂ',
      linkReturnApp: 'ກັບສູ່ແອັບຫຼັກ',
      modalForgotTitle: 'ຕັ້ງລະຫັດຜ່ານໃໝ່',
      modalForgotDesc: 'ກະລຸນາປ້ອນອີເມວຂອງທ່ານ ເພື່ອຮັບລິ້ງກູ້ຄືນລະຫັດຜ່ານ.',
      btnCancel: 'ຍົກເລີກ',
      btnSendReset: 'ສົ່ງລິ້ງກູ້ຄືນ',
      scanTitle: 'ກຳລັງສະແກນ FaceID...',
      scanSub: 'ກະລຸນາແນມເບິ່ງກ້ອງ ຫຼື ແຕະເຊັນເຊີເພື່ອຢືນຢັນຕົວຕົນ',
      strengthLevels: ['ອ່ອນແອ', 'ພໍໃຊ້', 'ດີ', 'ປອດໄພສູງ'],
      errEmailRequired: 'ກະລຸນາປ້ອນອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້',
      errEmailInvalid: 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ',
      errPasswordRequired: 'ກະລຸນາປ້ອນລະຫັດຜ່ານ',
      errPasswordShort: 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ',
      errNameRequired: 'ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ',
      errPasswordMismatch: 'ລະຫັດຜ່ານຢືນຢັນບໍ່ກົງກັນ',
      errAgreeRequired: 'ກະລຸນາຍອມຮັບເງື່ອນໄຂການບໍລິການ',
      errInvalidCredentials: 'ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ (ລອງກົດທົດລອງດ່ວນ)',
      toastLoginSuccess: 'ຍິນດີຕ້ອນຮັບກັບມາ, {name}! ເຂົ້າສູ່ລະບົບສໍາເລັດແລ້ວ.',
      toastRegisterSuccess: 'ສ້າງບັນຊີສໍາເລັດແລ້ວ! ຍິນດີຕ້ອນຮັບສູ່ MoneyDairy.',
      toastBiometricSuccess: 'ຢືນຢັນ FaceID ສໍາເລັດ! ເຂົ້າສູ່ລະບົບຢ່າງປອດໄພ.',
      toastLogoutSuccess: 'ອອກຈາກລະບົບຮຽບຮ້ອຍແລ້ວ.',
      toastResetSent: 'ສົ່ງລິ້ງຕັ້ງລະຫັດຜ່ານໃໝ່ໄປທີ່ {email} ຮຽບຮ້ອຍແລ້ວ!',
      toastDemoFilled: 'ຕື່ມຂໍ້ມູນບັນຊີທົດລອງ {name} ຮຽບຮ້ອຍແລ້ວ!',
      toastSocialNotImplemented: 'ການເຂົ້າສູ່ລະບົບດ້ວຍ {provider} ເປີດໃຫ້ໃຊ້ງານໃນຮຸ່ນຕໍ່ໄປ'
    },
    en: {
      quickDemoLabel: '⚡ Quick Demo:',
      demoAlex: 'Alex (Pro)',
      demoGuest: 'Guest Demo',
      badgePro: 'PRO',
      sessionActive: 'Account Ready • Secure Mode',
      statBalance: 'Estimated Balance',
      statSecurity: 'Security Level',
      btnLaunchApp: 'Open MoneyDairy App',
      btnTestBiometric: 'Test FaceID Scan Again',
      btnLogout: 'Sign Out',
      titleSignIn: 'Welcome Back',
      subSignIn: 'Sign in to manage your budget, track savings & expenses.',
      titleSignUp: 'Start Your Journey',
      subSignUp: 'Join MoneyDairy today to take total control of your money.',
      tabSignIn: 'Sign In',
      tabSignUp: 'Create Account',
      labelEmail: 'Email or Username',
      labelPassword: 'Password',
      linkForgotPassword: 'Forgot password?',
      rememberDevice: 'Remember this device',
      btnSignIn: 'Sign In to Account',
      labelFullName: 'Full Name',
      labelConfirmPassword: 'Confirm Password',
      strengthHint: 'Strength:',
      agreeTerms: 'I agree to the Terms of Service & Privacy Policy',
      btnSignUp: 'Create Free Account',
      orContinueWith: 'Or continue with',
      biometricTitle: 'FaceID / Fingerprint',
      biometricSub: 'Fast and secure biometric sign in',
      linkPrivacy: 'Privacy Policy',
      linkTerms: 'Terms of Service',
      linkReturnApp: 'Return to App',
      modalForgotTitle: 'Reset Password',
      modalForgotDesc: 'Enter your email address and we will send you a password reset link.',
      btnCancel: 'Cancel',
      btnSendReset: 'Send Reset Link',
      scanTitle: 'Scanning FaceID...',
      scanSub: 'Please look at your camera or touch the sensor to authenticate',
      strengthLevels: ['Weak', 'Fair', 'Good', 'Strong'],
      errEmailRequired: 'Please enter your email or username',
      errEmailInvalid: 'Please enter a valid email address',
      errPasswordRequired: 'Please enter your password',
      errPasswordShort: 'Password must be at least 6 characters',
      errNameRequired: 'Please enter your full name',
      errPasswordMismatch: 'Passwords do not match',
      errAgreeRequired: 'You must agree to the Terms & Privacy Policy',
      errInvalidCredentials: 'Invalid email or password (try Quick Demo buttons)',
      toastLoginSuccess: 'Welcome back, {name}! Successfully signed in.',
      toastRegisterSuccess: 'Account created! Welcome to MoneyDairy.',
      toastBiometricSuccess: 'FaceID recognized! Securely signed in.',
      toastLogoutSuccess: 'Signed out successfully.',
      toastResetSent: 'Password reset link sent to {email}!',
      toastDemoFilled: 'Filled test credentials for {name}!',
      toastSocialNotImplemented: '{provider} sign-in will be available in next release'
    },
    vi: {
      quickDemoLabel: '⚡ Thử nghiệm nhanh:',
      demoAlex: 'Alex (Pro)',
      demoGuest: 'Khách Demo',
      badgePro: 'PRO',
      sessionActive: 'Tài khoản hoạt động • Chế độ an toàn',
      statBalance: 'Số dư ước tính',
      statSecurity: 'Cấp độ bảo mật',
      btnLaunchApp: 'Mở ứng dụng MoneyDairy',
      btnTestBiometric: 'Thử quét FaceID lại',
      btnLogout: 'Đăng xuất',
      titleSignIn: 'Chào mừng trở lại',
      subSignIn: 'Đăng nhập để quản lý ngân sách và theo dõi dòng tiền thông minh.',
      titleSignUp: 'Bắt đầu hành trình',
      subSignUp: 'Gia nhập MoneyDairy ngay hôm nay để làm chủ tài chính.',
      tabSignIn: 'Đăng nhập',
      tabSignUp: 'Tạo tài khoản',
      labelEmail: 'Email hoặc Tên đăng nhập',
      labelPassword: 'Mật khẩu',
      linkForgotPassword: 'Quên mật khẩu?',
      rememberDevice: 'Ghi nhớ thiết bị này',
      btnSignIn: 'Đăng nhập tài khoản',
      labelFullName: 'Họ và tên',
      labelConfirmPassword: 'Xác nhận mật khẩu',
      strengthHint: 'Độ mạnh:',
      agreeTerms: 'Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật',
      btnSignUp: 'Tạo tài khoản miễn phí',
      orContinueWith: 'Hoặc đăng nhập với',
      biometricTitle: 'FaceID / Vân tay',
      biometricSub: 'Đăng nhập sinh trắc học an toàn & nhanh chóng',
      linkPrivacy: 'Bảo mật',
      linkTerms: 'Điều khoản',
      linkReturnApp: 'Về app chính',
      modalForgotTitle: 'Đặt lại mật khẩu',
      modalForgotDesc: 'Nhập email của bạn để nhận liên kết đặt lại mật khẩu.',
      btnCancel: 'Hủy bỏ',
      btnSendReset: 'Gửi liên kết',
      scanTitle: 'Đang quét FaceID...',
      scanSub: 'Vui lòng nhìn vào camera hoặc chạm vào cảm biến',
      strengthLevels: ['Yếu', 'Trung bình', 'Khá', 'Mạnh'],
      errEmailRequired: 'Vui lòng nhập email hoặc tên đăng nhập',
      errEmailInvalid: 'Địa chỉ email không hợp lệ',
      errPasswordRequired: 'Vui lòng nhập mật khẩu',
      errPasswordShort: 'Mật khẩu tối thiểu 6 ký tự',
      errNameRequired: 'Vui lòng nhập họ và tên',
      errPasswordMismatch: 'Mật khẩu xác nhận không khớp',
      errAgreeRequired: 'Bạn cần đồng ý với Điều khoản dịch vụ',
      errInvalidCredentials: 'Email hoặc mật khẩu không đúng (dùng nút Thử nghiệm nhanh)',
      toastLoginSuccess: 'Chào mừng trở lại, {name}! Đăng nhập thành công.',
      toastRegisterSuccess: 'Tài khoản đã tạo! Chào mừng bạn đến với MoneyDairy.',
      toastBiometricSuccess: 'Nhận diện FaceID thành công! Đã đăng nhập.',
      toastLogoutSuccess: 'Đã đăng xuất thành công.',
      toastResetSent: 'Đã gửi liên kết đặt lại mật khẩu tới {email}!',
      toastDemoFilled: 'Đã điền thông tin tài khoản {name}!',
      toastSocialNotImplemented: 'Đăng nhập {provider} sẽ được hỗ trợ trong bản cập nhật sau'
    }
  };

  const LANG_FLAGS = {
    lo: { flag: '🇱🇦', label: 'ລາວ' },
    en: { flag: '🇺🇸', label: 'EN' },
    vi: { flag: '🇻🇳', label: 'VI' }
  };

  // =========================================================================
  // 2. Pre-seeded Demo Accounts Database
  // =========================================================================
  const DEFAULT_USERS = [
    {
      name: 'Alex Phommaseng',
      email: 'alex@moneydairy.app',
      password: 'demo',
      plan: 'PRO',
      initials: 'EP',
      balance: '₭ 48,500,000'
    },
    {
      name: 'Guest Demo User',
      email: 'guest@moneydairy.app',
      password: 'demo',
      plan: 'FREE',
      initials: 'GD',
      balance: '₭ 5,000,000'
    }
  ];

  // Helper to fetch user database from localStorage or seed defaults
  function getUsersDatabase() {
    try {
      const stored = localStorage.getItem('moneydairy_users_db');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading users DB:', e);
    }
    localStorage.setItem('moneydairy_users_db', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  function saveUserToDatabase(user) {
    const users = getUsersDatabase();
    users.push(user);
    localStorage.setItem('moneydairy_users_db', JSON.stringify(users));
  }

  // =========================================================================
  // 3. State Management
  // =========================================================================
  let currentLanguage = localStorage.getItem('moneydairy_language') || 'lo';
  let activeTab = 'signIn'; // 'signIn' | 'signUp'
  let currentUser = null;

  // Cache DOM Elements
  const htmlRoot = document.documentElement;
  const langDropdownWrapper = document.getElementById('langDropdownWrapper');
  const langDropdownBtn = document.getElementById('langDropdownBtn');
  const langMenu = document.getElementById('langMenu');
  const currentLangFlag = document.getElementById('currentLangFlag');
  const currentLangLabel = document.getElementById('currentLangLabel');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Quick Demo Chips
  const chipAlex = document.getElementById('chipAlex');
  const chipGuest = document.getElementById('chipGuest');

  // Views & Panels
  const authBox = document.getElementById('authBox');
  const loggedInPanel = document.getElementById('loggedInPanel');
  const authMainTitle = document.getElementById('authMainTitle');
  const authSubTitle = document.getElementById('authSubTitle');
  const tabSwitcher = document.querySelector('.tab-switcher');
  const tabSignInBtn = document.getElementById('tabSignInBtn');
  const tabSignUpBtn = document.getElementById('tabSignUpBtn');

  // Forms
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  // Sign In inputs
  const signInEmail = document.getElementById('signInEmail');
  const signInPassword = document.getElementById('signInPassword');
  const toggleSignInPassword = document.getElementById('toggleSignInPassword');
  const signInEmailGroup = document.getElementById('signInEmailGroup');
  const signInPasswordGroup = document.getElementById('signInPasswordGroup');
  const signInEmailError = document.getElementById('signInEmailError');
  const signInPasswordError = document.getElementById('signInPasswordError');
  const btnSubmitSignIn = document.getElementById('btnSubmitSignIn');
  const signInSpinner = document.getElementById('signInSpinner');
  const signInBtnText = document.getElementById('signInBtnText');

  // Sign Up inputs
  const signUpName = document.getElementById('signUpName');
  const signUpEmail = document.getElementById('signUpEmail');
  const signUpPassword = document.getElementById('signUpPassword');
  const signUpConfirmPassword = document.getElementById('signUpConfirmPassword');
  const toggleSignUpPassword = document.getElementById('toggleSignUpPassword');
  const termsCheckbox = document.getElementById('termsCheckbox');
  const strengthBars = document.querySelector('.strength-bars');
  const strengthStatusText = document.getElementById('strengthStatusText');
  const signUpNameGroup = document.getElementById('signUpNameGroup');
  const signUpEmailGroup = document.getElementById('signUpEmailGroup');
  const signUpPasswordGroup = document.getElementById('signUpPasswordGroup');
  const signUpConfirmGroup = document.getElementById('signUpConfirmGroup');
  const signUpNameError = document.getElementById('signUpNameError');
  const signUpEmailError = document.getElementById('signUpEmailError');
  const signUpPasswordError = document.getElementById('signUpPasswordError');
  const signUpConfirmError = document.getElementById('signUpConfirmError');
  const btnSubmitSignUp = document.getElementById('btnSubmitSignUp');
  const signUpSpinner = document.getElementById('signUpSpinner');
  const signUpBtnText = document.getElementById('signUpBtnText');

  // Biometric & Social
  const btnBiometricLogin = document.getElementById('btnBiometricLogin');
  const btnGoogleAuth = document.getElementById('btnGoogleAuth');
  const btnAppleAuth = document.getElementById('btnAppleAuth');
  const btnForgotPassword = document.getElementById('btnForgotPassword');

  // Logged In Panel
  const userAvatarText = document.getElementById('userAvatarText');
  const userDisplayName = document.getElementById('userDisplayName');
  const userDisplayEmail = document.getElementById('userDisplayEmail');
  const btnLogout = document.getElementById('btnLogout');
  const btnTestBiometricAgain = document.getElementById('btnTestBiometricAgain');

  // Modals
  const forgotModalBackdrop = document.getElementById('forgotModalBackdrop');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const forgotEmail = document.getElementById('forgotEmail');
  const btnCancelForgot = document.getElementById('btnCancelForgot');

  const biometricModalBackdrop = document.getElementById('biometricModalBackdrop');
  const scanProgressFill = document.getElementById('scanProgressFill');
  const btnCancelBiometric = document.getElementById('btnCancelBiometric');

  // Toast
  const toastContainer = document.getElementById('toastContainer');

  // =========================================================================
  // 4. Internationalization (i18n) Engine
  // =========================================================================
  function getTranslation(key, params = {}) {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS['lo'];
    let text = dict[key] || TRANSLATIONS['en'][key] || key;
    if (typeof text === 'string') {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }

  function applyLanguage(langCode) {
    if (!TRANSLATIONS[langCode]) langCode = 'lo';
    currentLanguage = langCode;
    localStorage.setItem('moneydairy_language', langCode);
    htmlRoot.setAttribute('lang', langCode);

    // Update flag and label
    const info = LANG_FLAGS[langCode] || LANG_FLAGS['lo'];
    currentLangFlag.textContent = info.flag;
    currentLangLabel.textContent = info.label;

    // Update dropdown menu active states
    document.querySelectorAll('.dropdown-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-lang') === langCode);
    });

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translated = getTranslation(key);
      if (translated) {
        el.textContent = translated;
      }
    });

    // Update dynamic header text based on active tab
    updateHeaderText();

    // Update password strength text if user was typing
    if (activeTab === 'signUp' && signUpPassword.value) {
      evaluatePasswordStrength(signUpPassword.value);
    }
  }

  function updateHeaderText() {
    if (activeTab === 'signIn') {
      authMainTitle.textContent = getTranslation('titleSignIn');
      authSubTitle.textContent = getTranslation('subSignIn');
    } else {
      authMainTitle.textContent = getTranslation('titleSignUp');
      authSubTitle.textContent = getTranslation('subSignUp');
    }
  }

  // Language Dropdown Event Handlers
  langDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !langMenu.hidden;
    langMenu.hidden = isOpen;
    langDropdownWrapper.classList.toggle('open', !isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!langDropdownWrapper.contains(e.target)) {
      langMenu.hidden = true;
      langDropdownWrapper.classList.remove('open');
    }
  });

  document.querySelectorAll('.dropdown-item').forEach((item) => {
    item.addEventListener('click', () => {
      const selectedLang = item.getAttribute('data-lang');
      applyLanguage(selectedLang);
      langMenu.hidden = true;
      langDropdownWrapper.classList.remove('open');
    });
  });

  // =========================================================================
  // 5. Dark / Light Theme Manager
  // =========================================================================
  function initTheme() {
    const saved = localStorage.getItem('moneydairy_darkmode');
    const isDark = saved !== null ? JSON.parse(saved) : true;
    setTheme(isDark);
  }

  function setTheme(isDark) {
    if (isDark) {
      htmlRoot.classList.add('dark');
    } else {
      htmlRoot.classList.remove('dark');
    }
    localStorage.setItem('moneydairy_darkmode', JSON.stringify(isDark));
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDarkNow = htmlRoot.classList.contains('dark');
    setTheme(!isDarkNow);
  });

  // =========================================================================
  // 6. Tab Switcher (Sign In vs Sign Up)
  // =========================================================================
  function switchTab(tab) {
    activeTab = tab;
    clearAllErrors();

    if (tab === 'signIn') {
      tabSignInBtn.classList.add('active');
      tabSignInBtn.setAttribute('aria-selected', 'true');
      tabSignUpBtn.classList.remove('active');
      tabSignUpBtn.setAttribute('aria-selected', 'false');
      tabSwitcher.classList.remove('register-active');

      signInForm.hidden = false;
      signUpForm.hidden = true;
    } else {
      tabSignUpBtn.classList.add('active');
      tabSignUpBtn.setAttribute('aria-selected', 'true');
      tabSignInBtn.classList.remove('active');
      tabSignInBtn.setAttribute('aria-selected', 'false');
      tabSwitcher.classList.add('register-active');

      signInForm.hidden = true;
      signUpForm.hidden = false;
    }

    updateHeaderText();
  }

  tabSignInBtn.addEventListener('click', () => switchTab('signIn'));
  tabSignUpBtn.addEventListener('click', () => switchTab('signUp'));

  // =========================================================================
  // 7. Show / Hide Password Toggles
  // =========================================================================
  function setupPasswordToggle(btn, input) {
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.classList.toggle('active', !isPassword);

      const eyeIcon = btn.querySelector('svg');
      if (eyeIcon) {
        if (!isPassword) {
          // Show slashed eye when password is visible
          eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          `;
          btn.setAttribute('aria-label', 'Hide password');
        } else {
          // Show normal eye when password is hidden
          eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          `;
          btn.setAttribute('aria-label', 'Show password');
        }
      }
    });
  }

  setupPasswordToggle(toggleSignInPassword, signInPassword);
  setupPasswordToggle(toggleSignUpPassword, signUpPassword);

  // =========================================================================
  // 8. Password Strength Meter
  // =========================================================================
  function evaluatePasswordStrength(pass) {
    const levels = getTranslation('strengthLevels');
    if (!pass) {
      strengthBars.removeAttribute('data-score');
      strengthStatusText.textContent = '-';
      return 0;
    }

    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 9 && /[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;

    if (score === 0 && pass.length > 0) score = 1;

    strengthBars.setAttribute('data-score', score);
    strengthStatusText.textContent = levels[score - 1] || levels[0];
    return score;
  }

  signUpPassword.addEventListener('input', (e) => {
    evaluatePasswordStrength(e.target.value);
    if (signUpPasswordGroup.classList.contains('has-error')) {
      clearFieldError(signUpPasswordGroup, signUpPasswordError);
    }
  });

  // Clear errors on input
  [signInEmail, signInPassword, signUpName, signUpEmail, signUpConfirmPassword].forEach((input) => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      const err = group ? group.querySelector('.field-error') : null;
      if (group && err) {
        clearFieldError(group, err);
      }
    });
  });

  // =========================================================================
  // 9. Form Validation & Helpers
  // =========================================================================
  function showFieldError(groupEl, errorEl, message) {
    groupEl.classList.add('has-error');
    errorEl.textContent = message;
  }

  function clearFieldError(groupEl, errorEl) {
    groupEl.classList.remove('has-error');
    errorEl.textContent = '';
  }

  function clearAllErrors() {
    document.querySelectorAll('.form-group.has-error').forEach((grp) => {
      grp.classList.remove('has-error');
    });
    document.querySelectorAll('.field-error').forEach((err) => {
      err.textContent = '';
    });
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  // =========================================================================
  // 10. Quick Demo Credentials Auto-Fill
  // =========================================================================
  function fillDemoUser(userIndex) {
    const users = getUsersDatabase();
    const user = users[userIndex] || DEFAULT_USERS[0];

    switchTab('signIn');

    signInEmail.value = user.email;
    signInPassword.value = user.password;
    clearAllErrors();

    // Subtle highlight animation
    [signInEmail, signInPassword].forEach((el) => {
      el.style.borderColor = 'var(--emerald)';
      setTimeout(() => {
        el.style.borderColor = '';
      }, 700);
    });

    showToast(getTranslation('toastDemoFilled', { name: user.name }), 'info');
  }

  chipAlex.addEventListener('click', () => fillDemoUser(0));
  chipGuest.addEventListener('click', () => fillDemoUser(1));

  // =========================================================================
  // 11. Authentication & Session Logic
  // =========================================================================
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#10B981', '#6366F1', '#3B82F6', '#F59E0B']
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }
  }

  function renderLoggedInState(user) {
    currentUser = user;
    userAvatarText.textContent = user.initials || user.name.slice(0, 2).toUpperCase();
    userDisplayName.textContent = user.name;
    userDisplayEmail.textContent = user.email;

    // Show panel, hide auth box
    authBox.hidden = true;
    loggedInPanel.hidden = false;
  }

  function renderLoggedOutState() {
    currentUser = null;
    localStorage.removeItem('moneydairy_user');
    localStorage.removeItem('moneydairy_auth_token');

    authBox.hidden = false;
    loggedInPanel.hidden = true;
    signInEmail.value = '';
    signInPassword.value = '';
    signUpName.value = '';
    signUpEmail.value = '';
    signUpPassword.value = '';
    signUpConfirmPassword.value = '';
    strengthBars.removeAttribute('data-score');
    strengthStatusText.textContent = '-';
  }

  function checkExistingSession() {
    try {
      const savedUser = localStorage.getItem('moneydairy_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        renderLoggedInState(parsed);
      }
    } catch (e) {
      console.error('Session restore error:', e);
    }
  }

  // Handle Sign In Submit
  signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();

    const emailVal = signInEmail.value.trim();
    const passVal = signInPassword.value.trim();

    let hasError = false;

    if (!emailVal) {
      showFieldError(signInEmailGroup, signInEmailError, getTranslation('errEmailRequired'));
      hasError = true;
    }

    if (!passVal) {
      showFieldError(signInPasswordGroup, signInPasswordError, getTranslation('errPasswordRequired'));
      hasError = true;
    }

    if (hasError) return;

    // Simulate async API call with loading spinner
    btnSubmitSignIn.disabled = true;
    signInSpinner.hidden = false;
    signInBtnText.style.opacity = '0.5';

    setTimeout(() => {
      btnSubmitSignIn.disabled = false;
      signInSpinner.hidden = true;
      signInBtnText.style.opacity = '1';

      const users = getUsersDatabase();
      const match = users.find(
        (u) =>
          u.email.toLowerCase() === emailVal.toLowerCase() ||
          u.name.toLowerCase() === emailVal.toLowerCase()
      );

      // In test mode: allow match if credentials match or password is 'demo'
      if (match && (match.password === passVal || passVal === 'demo' || passVal === '123456')) {
        const sessionUser = {
          name: match.name,
          email: match.email,
          plan: match.plan || 'PRO',
          initials: match.initials || 'EP'
        };

        localStorage.setItem('moneydairy_user', JSON.stringify(sessionUser));
        localStorage.setItem('moneydairy_auth_token', 'token_' + Date.now());

        triggerConfetti();
        showToast(getTranslation('toastLoginSuccess', { name: sessionUser.name }), 'success');
        renderLoggedInState(sessionUser);
      } else {
        showFieldError(signInPasswordGroup, signInPasswordError, getTranslation('errInvalidCredentials'));
      }
    }, 600);
  });

  // Handle Sign Up Submit
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();

    const nameVal = signUpName.value.trim();
    const emailVal = signUpEmail.value.trim();
    const passVal = signUpPassword.value;
    const confirmVal = signUpConfirmPassword.value;
    const agree = termsCheckbox.checked;

    let hasError = false;

    if (!nameVal) {
      showFieldError(signUpNameGroup, signUpNameError, getTranslation('errNameRequired'));
      hasError = true;
    }

    if (!emailVal) {
      showFieldError(signUpEmailGroup, signUpEmailError, getTranslation('errEmailRequired'));
      hasError = true;
    } else if (!isValidEmail(emailVal)) {
      showFieldError(signUpEmailGroup, signUpEmailError, getTranslation('errEmailInvalid'));
      hasError = true;
    }

    if (!passVal) {
      showFieldError(signUpPasswordGroup, signUpPasswordError, getTranslation('errPasswordRequired'));
      hasError = true;
    } else if (passVal.length < 6) {
      showFieldError(signUpPasswordGroup, signUpPasswordError, getTranslation('errPasswordShort'));
      hasError = true;
    }

    if (passVal !== confirmVal) {
      showFieldError(signUpConfirmGroup, signUpConfirmError, getTranslation('errPasswordMismatch'));
      hasError = true;
    }

    if (!agree) {
      showToast(getTranslation('errAgreeRequired'), 'error');
      hasError = true;
    }

    if (hasError) return;

    // Simulate async account creation
    btnSubmitSignUp.disabled = true;
    signUpSpinner.hidden = false;
    signUpBtnText.style.opacity = '0.5';

    setTimeout(() => {
      btnSubmitSignUp.disabled = false;
      signUpSpinner.hidden = true;
      signUpBtnText.style.opacity = '1';

      const initials = nameVal
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const newUser = {
        name: nameVal,
        email: emailVal,
        password: passVal,
        plan: 'PRO',
        initials: initials || 'MD',
        balance: '₭ 1,000,000'
      };

      saveUserToDatabase(newUser);

      localStorage.setItem('moneydairy_user', JSON.stringify(newUser));
      localStorage.setItem('moneydairy_auth_token', 'token_' + Date.now());

      triggerConfetti();
      showToast(getTranslation('toastRegisterSuccess'), 'success');
      renderLoggedInState(newUser);
    }, 700);
  });

  // Sign Out Handler
  btnLogout.addEventListener('click', () => {
    renderLoggedOutState();
    showToast(getTranslation('toastLogoutSuccess'), 'info');
  });

  // =========================================================================
  // 12. Biometric Authentication Simulator
  // =========================================================================
  function startBiometricScan() {
    biometricModalBackdrop.hidden = false;
    scanProgressFill.style.width = '0%';

    setTimeout(() => {
      scanProgressFill.style.width = '100%';
    }, 50);

    setTimeout(() => {
      biometricModalBackdrop.hidden = true;
      const users = getUsersDatabase();
      const user = users[0] || DEFAULT_USERS[0];

      localStorage.setItem('moneydairy_user', JSON.stringify(user));
      localStorage.setItem('moneydairy_auth_token', 'bio_token_' + Date.now());

      triggerConfetti();
      showToast(getTranslation('toastBiometricSuccess'), 'success');
      renderLoggedInState(user);
    }, 1500);
  }

  btnBiometricLogin.addEventListener('click', startBiometricScan);
  btnTestBiometricAgain.addEventListener('click', startBiometricScan);

  btnCancelBiometric.addEventListener('click', () => {
    biometricModalBackdrop.hidden = true;
    scanProgressFill.style.width = '0%';
  });

  // =========================================================================
  // 13. Forgot Password Modal Flow
  // =========================================================================
  btnForgotPassword.addEventListener('click', () => {
    forgotEmail.value = signInEmail.value.trim() || 'alex@moneydairy.app';
    forgotModalBackdrop.hidden = false;
  });

  btnCancelForgot.addEventListener('click', () => {
    forgotModalBackdrop.hidden = true;
  });

  forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = forgotEmail.value.trim();
    if (!emailVal) return;

    forgotModalBackdrop.hidden = true;
    showToast(getTranslation('toastResetSent', { email: emailVal }), 'success');
  });

  // Close modals when clicking backdrop
  [forgotModalBackdrop, biometricModalBackdrop].forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.hidden = true;
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      forgotModalBackdrop.hidden = true;
      biometricModalBackdrop.hidden = true;
      langMenu.hidden = true;
      langDropdownWrapper.classList.remove('open');
    }
  });

  // =========================================================================
  // 14. Social Login Placeholders
  // =========================================================================
  btnGoogleAuth.addEventListener('click', () => {
    showToast(getTranslation('toastSocialNotImplemented', { provider: 'Google' }), 'info');
  });

  btnAppleAuth.addEventListener('click', () => {
    showToast(getTranslation('toastSocialNotImplemented', { provider: 'Apple' }), 'info');
  });

  // =========================================================================
  // 15. Toast Notifications Engine
  // =========================================================================
  function showToast(message, type = 'info', duration = 3800) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F43F5E" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#6366F1" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    }, duration);
  }

  // Launch Main App Navigation Handler
  const btnLaunchApp = document.getElementById('btnLaunchApp');
  if (btnLaunchApp) {
    btnLaunchApp.addEventListener('click', (e) => {
      if (window.location.port || window.location.hostname) {
        e.preventDefault();
        window.location.href = window.location.origin + '/';
      }
    });
  }

  // =========================================================================
  // 16. Initialize Application
  // =========================================================================
  initTheme();
  applyLanguage(currentLanguage);
  checkExistingSession();
})();
