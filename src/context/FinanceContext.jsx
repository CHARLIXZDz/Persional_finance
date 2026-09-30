import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_TRANSACTIONS } from '../data/initialData';
import { CURRENCIES, CATEGORIES } from '../data/categories';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('moneydairy_darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Language state: 'lo' | 'vi' | 'en'
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('moneydairy_language') || 'lo';
    if (typeof document !== 'undefined') {
      document.documentElement.lang = saved;
    }
    return saved;
  });

  const setLanguage = useCallback((newLang) => {
    if (!newLang) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem('moneydairy_language', newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch {}
  }, []);

  // Currency state: LAK, THB, USD, VND
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('moneydairy_currency') || 'LAK';
  });

  // Privacy: Hide / Show balance
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    return JSON.parse(localStorage.getItem('moneydairy_hide_balance') || 'false');
  });

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Add Transaction Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Financial Report view alias
  const isReportModalOpen = currentTab === 'reports';
  const setIsReportModalOpen = (open) => setCurrentTab(open ? 'reports' : 'settings');

  // Cloud status state
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Password Recovery Flow state (activated when user clicks recovery link in email)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        return hash.includes('type=recovery') || search.includes('type=recovery');
      }
    } catch {}
    return false;
  });

  // Keep a stable ref to active user to avoid recreating callbacks
  const userRef = useRef(user);
  userRef.current = user;

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback(({ type = 'success', title = '', message = '', duration = 3500 }) => {
    setToast({ type, title, message, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Helper to identify demo / seed Alex account
  const isAlexUser = useCallback((u) => {
    if (!u) return false;
    const email = (u.email || '').toLowerCase();
    const id = u.id || '';
    return id === 'demo-alex-101' || email.includes('alex') || email === 'alex@moneydairy.app';
  }, []);

  // Helper to obtain user-scoped localStorage key
  const getUserTxStorageKey = useCallback((u) => {
    if (!u) return null;
    if (isAlexUser(u)) return 'moneydairy_transactions_alex';
    const keyId = u.id || u.email || 'user';
    return `moneydairy_transactions_${keyId}`;
  }, [isAlexUser]);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(() => {
    try {
      const storedDemo = localStorage.getItem('moneydairy_demo_user');
      const uid = storedDemo ? JSON.parse(storedDemo)?.id : 'user';
      return localStorage.getItem(`moneydairy_avatar_${uid}`) || null;
    } catch {
      return null;
    }
  });

  // Keep avatar in sync with active user
  useEffect(() => {
    if (user) {
      const uid = user.id || user.email || 'user';
      const saved = localStorage.getItem(`moneydairy_avatar_${uid}`);
      if (saved) {
        setAvatarUrl(saved);
      } else if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      } else {
        setAvatarUrl(null);
      }
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  // Update avatar - Uploads to Supabase Storage 'avatars' bucket & saves clean public URL
  const updateAvatar = useCallback(async (dataUrl) => {
    const activeUser = userRef.current;
    const uid = activeUser ? (activeUser.id || activeUser.email || 'user') : 'user';
    setAvatarUrl(dataUrl);

    try {
      let finalAvatarUrl = dataUrl;

      // If we have an image dataUrl and Supabase is connected, upload to Supabase Storage
      if (
        dataUrl &&
        isSupabaseConfigured &&
        activeUser?.id &&
        activeUser.id !== 'demo-alex-101' &&
        activeUser.id !== 'demo-guest-102'
      ) {
        try {
          // Convert dataURL to Blob directly without network fetch
          const parts = dataUrl.split(',');
          const byteString = atob(parts[1]);
          const mimeString = parts[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });

          const fileName = `avatar-${uid}-${Date.now()}.jpg`;

          // Clean up old avatar file for this user if any
          const oldSaved = localStorage.getItem(`moneydairy_avatar_${uid}`);
          if (oldSaved && oldSaved.includes('/avatars/')) {
            const oldPath = oldSaved.split('/avatars/')[1]?.split('?')[0];
            if (oldPath) {
              supabase.storage.from('avatars').remove([oldPath]).catch(() => {});
            }
          }

          // Upload without upsert (unique timestamped file, pure INSERT)
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, {
              contentType: mimeString || 'image/jpeg',
            });

          if (!uploadErr && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            if (publicUrlData?.publicUrl) {
              finalAvatarUrl = publicUrlData.publicUrl;
              setAvatarUrl(finalAvatarUrl);
            }
          } else if (uploadErr) {
            console.error('Supabase storage upload error:', uploadErr.message);
          }
        } catch (storageErr) {
          console.error('Storage upload exception:', storageErr);
        }
      }

      if (finalAvatarUrl) {
        localStorage.setItem(`moneydairy_avatar_${uid}`, finalAvatarUrl);
      } else {
        localStorage.removeItem(`moneydairy_avatar_${uid}`);
      }

      if (
        isSupabaseConfigured &&
        activeUser?.id &&
        activeUser.id !== 'demo-alex-101' &&
        activeUser.id !== 'demo-guest-102'
      ) {
        await supabase.auth.updateUser({
          data: { avatar_url: finalAvatarUrl || '' },
        });
      }
    } catch (e) {
      console.warn('Failed to persist avatar:', e);
    }
  }, []);

  const removeAvatar = useCallback(async () => {
    const activeUser = userRef.current;
    const uid = activeUser ? (activeUser.id || activeUser.email || 'user') : 'user';
    const oldSaved = localStorage.getItem(`moneydairy_avatar_${uid}`);
    if (isSupabaseConfigured && oldSaved && oldSaved.includes('/avatars/')) {
      const oldPath = oldSaved.split('/avatars/')[1]?.split('?')[0];
      if (oldPath) {
        try {
          await supabase.storage.from('avatars').remove([oldPath]);
        } catch {}
      }
    }
    await updateAvatar(null);
  }, [updateAvatar]);

  // Update User Display Name
  const updateUserName = useCallback(
    async (newFullName) => {
      const trimmed = (newFullName || '').trim();
      if (!trimmed) {
        return { success: false, error: 'Name cannot be empty' };
      }

      const activeUser = userRef.current;
      if (!activeUser) return { success: false, error: 'No user logged in' };

      const uid = activeUser.id || activeUser.email || 'user';

      try {
        // 1. Persist to Supabase Auth if real registered user
        if (
          isSupabaseConfigured &&
          activeUser?.id &&
          activeUser.id !== 'demo-alex-101' &&
          activeUser.id !== 'demo-guest-102'
        ) {
          const { data, error } = await supabase.auth.updateUser({
            data: { full_name: trimmed },
          });

          if (error) {
            console.warn('Supabase updateUser error:', error.message);
          } else if (data?.user) {
            setUser(data.user);
          }

          // Optional: Also upsert to public.profiles table if user created it
          try {
            await supabase.from('profiles').upsert({
              id: activeUser.id,
              email: activeUser.email,
              full_name: trimmed,
              updated_at: new Date().toISOString(),
            });
          } catch {}
        }

        // 2. Always persist to localStorage cache
        localStorage.setItem(`moneydairy_user_name_${uid}`, trimmed);

        setUser((prev) => {
          if (!prev) return prev;
          const updatedUser = {
            ...prev,
            user_metadata: {
              ...(prev.user_metadata || {}),
              full_name: trimmed,
            },
          };
          if (prev.id?.startsWith('demo-')) {
            localStorage.setItem('moneydairy_demo_user', JSON.stringify(updatedUser));
          }
          return updatedUser;
        });

        showToast({
          type: 'success',
          title: language === 'vi' ? 'Thành công' : language === 'lo' ? 'ສຳເລັດ' : 'Success',
          message:
            language === 'vi'
              ? 'Đã cập nhật họ tên thành công!'
              : language === 'lo'
              ? 'ອັບເດດຊື່ສຳເລັດແລ້ວ!'
              : 'Display name updated successfully!',
        });

        return { success: true };
      } catch (err) {
        console.error('Update user name error:', err);
        return { success: false, error: err.message };
      }
    },
    [language, showToast]
  );

  // Monthly Budget state: { 'YYYY-MM': { food: 2000000, transport: 500000, ... } }
  const [budgets, setBudgets] = useState({});

  // Sync budgets with active user
  useEffect(() => {
    if (!user) {
      setBudgets({});
      return;
    }

    const uid = user.id || user.email || 'user';
    const isAlex = user.id === 'demo-alex-101' || user.email?.includes('alex');

    // 1. Try user_metadata
    if (user.user_metadata?.budgets && Object.keys(user.user_metadata.budgets).length > 0) {
      setBudgets(user.user_metadata.budgets);
      return;
    }

    // 2. Try localStorage
    const saved = localStorage.getItem(`moneydairy_budgets_${uid}`);
    if (saved) {
      try {
        setBudgets(JSON.parse(saved));
        return;
      } catch {}
    }

    // 3. For Alex demo user, provide initial demo budget for reference
    if (isAlex) {
      const now = new Date();
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const alexDemo = {
        [currentKey]: {
          food: 1500000,
          transport: 400000,
          bills: 600000,
          shopping: 1000000,
          entertainment: 350000,
        },
      };
      setBudgets(alexDemo);
      return;
    }

    // 4. Try fetching from public.budgets if table exists
    if (isSupabaseConfigured && user.id) {
      supabase
        .from('budgets')
        .select('*')
        .eq('owner', uid)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const mapped = {};
            data.forEach((row) => {
              const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
              if (!mapped[key]) mapped[key] = {};
              mapped[key][row.category] = Number(row.amount);
            });
            setBudgets(mapped);
            localStorage.setItem(`moneydairy_budgets_${uid}`, JSON.stringify(mapped));
          } else {
            setBudgets({});
          }
        })
        .catch(() => {
          setBudgets({});
        });
    } else {
      setBudgets({});
    }
  }, [user]);

  // Save budget for a specific month
  const saveBudget = useCallback(
    async (monthKey, categoryBudgets) => {
      const activeUser = userRef.current;
      const uid = activeUser ? (activeUser.id || activeUser.email || 'user') : 'user';

      const updated = {
        ...budgets,
        [monthKey]: categoryBudgets,
      };

      setBudgets(updated);

      try {
        localStorage.setItem(`moneydairy_budgets_${uid}`, JSON.stringify(updated));

        // Save to Supabase Auth metadata for seamless cross-device persistence
        if (
          isSupabaseConfigured &&
          activeUser?.id &&
          activeUser.id !== 'demo-alex-101' &&
          activeUser.id !== 'demo-guest-102'
        ) {
          await supabase.auth.updateUser({
            data: { budgets: updated },
          });

          // Also attempt to upsert into public.budgets table if it exists
          try {
            const [yr, mo] = monthKey.split('-').map(Number);
            const rows = Object.entries(categoryBudgets).map(([category, amount]) => ({
              owner: uid,
              category,
              amount: Number(amount),
              month: mo,
              year: yr,
            }));

            if (rows.length > 0) {
              await supabase.from('budgets').upsert(rows, { onConflict: 'owner,category,month,year' });
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to persist budget:', err);
      }
    },
    [budgets]
  );

  // Clear budget for a specific month
  const clearBudget = useCallback(
    async (monthKey) => {
      const activeUser = userRef.current;
      const uid = activeUser ? (activeUser.id || activeUser.email || 'user') : 'user';

      const updated = { ...budgets };
      delete updated[monthKey];

      setBudgets(updated);

      try {
        localStorage.setItem(`moneydairy_budgets_${uid}`, JSON.stringify(updated));

        if (
          isSupabaseConfigured &&
          activeUser?.id &&
          activeUser.id !== 'demo-alex-101' &&
          activeUser.id !== 'demo-guest-102'
        ) {
          await supabase.auth.updateUser({
            data: { budgets: updated },
          });

          // Also remove from public.budgets if table exists
          try {
            const [yr, mo] = monthKey.split('-').map(Number);
            await supabase.from('budgets').delete().match({ owner: uid, month: mo, year: yr });
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to clear budget:', err);
      }
    },
    [budgets]
  );



  // Transactions state - scoped per user, defaults to empty array for new accounts
  const [transactions, setTransactions] = useState(() => {
    try {
      const storedDemo = localStorage.getItem('moneydairy_demo_user');
      if (storedDemo) {
        const parsed = JSON.parse(storedDemo);
        if (parsed?.id === 'demo-alex-101' || parsed?.email?.includes('alex')) {
          const cached =
            localStorage.getItem('moneydairy_transactions_alex') ||
            localStorage.getItem('moneydairy_transactions');
          if (cached) return JSON.parse(cached);
          return INITIAL_TRANSACTIONS;
        }
      }
    } catch (e) {
      console.error('Failed to parse initial transactions cache', e);
    }
    return [];
  });

  // Map database row (snake_case) to app model (camelCase)
  const mapRowToTx = (row) => ({
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    paymentMethod: row.payment_method || 'QR Scan',
    date: row.date,
    notes: row.notes || '',
    owner: row.owner || 'me',
    createdAt: row.created_at,
  });

  // Helper to build comprehensive query filters for a given user account
  const buildUserFilters = useCallback((activeUser) => {
    if (!activeUser) return [];
    const isAlex = isAlexUser(activeUser);
    if (isAlex) {
      const alexFilters = ['owner.eq.me', 'owner.eq.alex', 'owner.eq.Alex Morgan'];
      if (activeUser.id) alexFilters.push(`owner.eq.${activeUser.id}`);
      if (activeUser.email) alexFilters.push(`owner.eq.${activeUser.email}`);
      return Array.from(new Set(alexFilters));
    }

    const userFilters = [];
    const uid = activeUser.id;
    const email = (activeUser.email || '').trim().toLowerCase();
    const fullName = (
      activeUser.user_metadata?.full_name ||
      activeUser.user_metadata?.name ||
      activeUser.name ||
      ''
    ).trim();

    // 1. UUID exact match (strictly scoped to this account's unique id)
    if (uid) {
      userFilters.push(`owner.eq.${uid}`);
    }

    // 2. Email exact match
    if (email) {
      userFilters.push(`owner.eq.${email}`);
    }

    // 3. Legacy migration: ONLY for the specific test account '719d1bc9...'
    if (typeof uid === 'string' && uid.startsWith('719d1bc9')) {
      userFilters.push('owner.eq.Ekalat Phommaseng');
      userFilters.push('owner.eq.Ekalat phommaseng');
    }

    return Array.from(new Set(userFilters));
  }, [isAlexUser]);


  // 1. Fetch transactions from Supabase (scoped to active user)
  const fetchTransactions = useCallback(async (targetUser) => {
    const activeUser = targetUser || userRef.current;
    if (!activeUser) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    const isAlex = isAlexUser(activeUser);
    const storageKey = getUserTxStorageKey(activeUser);

    if (!isSupabaseConfigured) {
      if (storageKey) {
        const local = localStorage.getItem(storageKey);
        if (local) {
          try {
            setTransactions(JSON.parse(local));
          } catch {
            setTransactions(isAlex ? INITIAL_TRANSACTIONS : []);
          }
        } else {
          setTransactions(isAlex ? INITIAL_TRANSACTIONS : []);
        }
      } else {
        setTransactions(isAlex ? INITIAL_TRANSACTIONS : []);
      }
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      const filters = buildUserFilters(activeUser);
      if (filters.length > 0) {
        query = query.or(filters.join(','));
      } else {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase fetch error, using local fallback:', error.message);
        setIsCloudConnected(false);
        if (storageKey) {
          const local = localStorage.getItem(storageKey);
          if (local) {
            try {
              setTransactions(JSON.parse(local));
            } catch {
              setTransactions(isAlex ? INITIAL_TRANSACTIONS : []);
            }
          } else {
            setTransactions(isAlex ? INITIAL_TRANSACTIONS : []);
          }
        }
      } else {
        setIsCloudConnected(true);

        if (data && data.length > 0) {
          const mapped = data.map(mapRowToTx);
          setTransactions(mapped);
          if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(mapped));
          }
        } else {
          // If no transactions found in database for this user
          if (isAlex) {
            // Seed initial transactions only for Alex demo
            const seedRows = INITIAL_TRANSACTIONS.map((tx) => ({
              title: tx.title,
              amount: tx.amount,
              type: tx.type,
              category: tx.category,
              payment_method: tx.paymentMethod,
              date: tx.date,
              notes: tx.notes || '',
              owner: 'Alex Morgan',
            }));

            const { data: seededData, error: seedError } = await supabase
              .from('transactions')
              .insert(seedRows)
              .select();

            if (!seedError && seededData) {
              const mapped = seededData.map(mapRowToTx);
              setTransactions(mapped);
              if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify(mapped));
              }
            }
          } else {
            // Newly registered user: starts completely clean with 0 transactions
            setTransactions([]);
            if (storageKey) {
              localStorage.setItem(storageKey, JSON.stringify([]));
            }
          }
        }
      }
    } catch (err) {
      console.error('Supabase exception:', err);
      setIsCloudConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAlexUser, getUserTxStorageKey, buildUserFilters]);

  // 2. Initialize Supabase Auth Session listener
  useEffect(() => {
    let isMounted = true;

    const applySavedDisplayName = (u) => {
      if (!u) return u;
      const uid = u.id || u.email || 'user';
      const savedName = localStorage.getItem(`moneydairy_user_name_${uid}`);
      if (savedName) {
        return {
          ...u,
          user_metadata: {
            ...(u.user_metadata || {}),
            full_name: savedName,
          },
        };
      }
      return u;
    };

    const notifyOAuthSignIn = (u) => {
      if (!u || typeof window === 'undefined') return;
      const isOAuthPending = sessionStorage.getItem('moneydairy_oauth_login_pending');
      const hasOAuthHash = window.location.hash.includes('access_token') || window.location.search.includes('code=');

      if (isOAuthPending || (hasOAuthHash && u.app_metadata?.provider === 'google')) {
        sessionStorage.removeItem('moneydairy_oauth_login_pending');
        if (window.history?.replaceState && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        const name =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.email?.split('@')[0] ||
          'User';

        showToast({
          type: 'success',
          title: language === 'vi' ? 'Đăng nhập thành công' : language === 'lo' ? 'ເຂົ້າສູ່ລະບົບສຳເລັດ' : 'Sign In Successful',
          message:
            language === 'vi'
              ? `Chào mừng ${name}! Bạn đã đăng nhập bằng Google thành công.`
              : language === 'lo'
              ? `ຍິນດີຕ້ອນຮັບ ${name}! ເຂົ້າສູ່ລະບົບດ້ວຍ Google ສຳເລັດແລ້ວ.`
              : `Welcome, ${name}! Successfully signed in with Google.`,
        });
      }
    };

    const restoreSession = async () => {
      // Check if URL indicates password recovery link
      if (
        typeof window !== 'undefined' &&
        (window.location.hash.includes('type=recovery') ||
          window.location.search.includes('type=recovery') ||
          window.location.href.includes('type=recovery'))
      ) {
        setIsPasswordRecovery(true);
      }

      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const resolvedUser = applySavedDisplayName(session.user);
            setSession(session);
            setUser(resolvedUser);
            setIsAuthLoading(false);
            fetchTransactions(resolvedUser);
            notifyOAuthSignIn(resolvedUser);
            return;
          }
        } catch (e) {
          console.warn('Supabase session lookup error:', e);
        }
      }

      // Check local demo user session fallback
      try {
        const storedDemo = localStorage.getItem('moneydairy_demo_user');
        if (storedDemo && isMounted) {
          const parsed = JSON.parse(storedDemo);
          const resolvedUser = applySavedDisplayName(parsed);
          setUser(resolvedUser);
          fetchTransactions(resolvedUser);
        } else if (isMounted) {
          setUser(null);
          setTransactions([]);
        }
      } catch (e) {
        console.error('Failed to parse local demo user', e);
        if (isMounted) {
          setUser(null);
          setTransactions([]);
        }
      }
      if (isMounted) {
        setIsAuthLoading(false);
      }
    };

    // Safety fallback: ensure loading screen is unblocked within 2.5s even if network or Supabase stalls
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsAuthLoading(false);
      }
    }, 2500);

    restoreSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted) return;
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
        setSession(session);
        if (session?.user) {
          const resolvedUser = applySavedDisplayName(session.user);
          setUser(resolvedUser);
          fetchTransactions(resolvedUser);
          notifyOAuthSignIn(resolvedUser);
        } else {
          const storedDemo = localStorage.getItem('moneydairy_demo_user');
          if (storedDemo) {
            try {
              const parsed = JSON.parse(storedDemo);
              const resolvedUser = applySavedDisplayName(parsed);
              setUser(resolvedUser);
              fetchTransactions(resolvedUser);
            } catch {
              setUser(null);
              setTransactions([]);
            }
          } else {
            setUser(null);
            setTransactions([]);
          }
        }
        setIsAuthLoading(false);
      });

      return () => {
        isMounted = false;
        clearTimeout(safetyTimer);
        subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [fetchTransactions, language, showToast]);

  // Demo user login (for 1-click test chips, biometric scan, or offline testing)
  const signInDemo = useCallback((accountType = 'alex') => {
    const isAlex = accountType === 'alex' || accountType?.includes?.('alex');
    const demoUser = {
      id: isAlex ? 'demo-alex-101' : 'demo-guest-102',
      email: isAlex ? 'alex@moneydairy.app' : 'guest@moneydairy.app',
      user_metadata: {
        full_name: isAlex ? 'Alex Phommaseng' : 'Guest Demo User',
        plan: isAlex ? 'PRO' : 'FREE',
        initials: isAlex ? 'EP' : 'GD',
      },
    };

    localStorage.setItem('moneydairy_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    fetchTransactions(demoUser);

    showToast({
      type: 'success',
      title: language === 'vi' ? 'Đăng nhập thành công' : language === 'lo' ? 'ເຂົ້າສູ່ລະບົບສຳເລັດ' : 'Sign In Successful',
      message: language === 'vi'
        ? `Chào mừng ${demoUser.user_metadata.full_name} quay trở lại!`
        : language === 'lo'
        ? `ຍິນດີຕ້ອນຮັບ ${demoUser.user_metadata.full_name} ກັບມາ!`
        : `Welcome back, ${demoUser.user_metadata.full_name}!`,
    });

    return { success: true, user: demoUser };
  }, [language, showToast, fetchTransactions]);

  // 3. Auth Actions: Sign In, Sign Up, Sign Out
  const signIn = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check if logging in as demo account or offline test credentials
    if (
      (trimmedEmail === 'alex@moneydairy.app' || trimmedEmail === 'alex.phommaseng@gmail.com') &&
      (password === 'demo' || password === 'Password123!' || password === '123456')
    ) {
      return signInDemo('alex');
    }

    if (
      trimmedEmail === 'guest@moneydairy.app' &&
      (password === 'demo' || password === 'Password123!' || password === '123456')
    ) {
      return signInDemo('guest');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        // If Supabase fails but password matches demo fallback
        if (
          (trimmedEmail.includes('alex') || trimmedEmail.includes('moneydairy')) &&
          (password === 'demo' || password === 'Password123!')
        ) {
          return signInDemo('alex');
        }
        return { success: false, error: error.message };
      }

      localStorage.removeItem('moneydairy_demo_user');
      setUser(data.user);
      setSession(data.session);
      fetchTransactions(data.user);

      showToast({
        type: 'success',
        title: language === 'vi' ? 'Đăng nhập thành công' : language === 'lo' ? 'ເຂົ້າສູ່ລະບົບສຳເລັດ' : 'Sign In Successful',
        message: language === 'vi'
          ? `Chào mừng ${data.user.user_metadata?.full_name || data.user.email} quay trở lại!`
          : language === 'lo'
          ? `ຍິນດີຕ້ອນຮັບ ${data.user.user_metadata?.full_name || data.user.email} ກັບມາ!`
          : `Welcome back, ${data.user.user_metadata?.full_name || data.user.email}!`,
      });

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName || 'User',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const needsConfirmation = !data.session && data.user && !data.user.confirmed_at;

      if (!needsConfirmation && data.user) {
        localStorage.removeItem('moneydairy_demo_user');
        setUser(data.user);
        setSession(data.session);
        fetchTransactions(data.user);

        showToast({
          type: 'success',
          title: language === 'vi' ? 'Đăng ký thành công' : language === 'lo' ? 'ສ້າງບັນຊີສຳເລັດ' : 'Account Created',
          message: language === 'vi'
            ? 'Chào mừng bạn đến với MoneyDairy!'
            : language === 'lo'
            ? 'ຍິນດີຕ້ອນຮັບສູ່ MoneyDairy!'
            : 'Welcome to MoneyDairy!',
        });
      }

      return { success: true, user: data.user, needsConfirmation };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('moneydairy_demo_user');
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setTransactions([]);
      showToast({
        type: 'info',
        title: language === 'vi' ? 'Đã đăng xuất' : language === 'lo' ? 'ອອກຈາກລະບົບ' : 'Signed Out',
        message: language === 'vi'
          ? 'Bạn đã đăng xuất an toàn khỏi hệ thống.'
          : language === 'lo'
          ? 'ທ່ານໄດ້ອອກຈາກລະບົບຢ່າງປອດໄພແລ້ວ.'
          : 'You have signed out of your account.',
      });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Reset Password for Email
  const resetPassword = useCallback(
    async (emailToReset) => {
      const trimmed = (emailToReset || '').trim();
      if (!trimmed) {
        return { success: false, error: 'Email is required' };
      }

      // Demo account handling
      if (
        trimmed === 'alex@moneydairy.app' ||
        trimmed === 'alex.phommaseng@gmail.com' ||
        trimmed === 'guest@moneydairy.app'
      ) {
        return {
          success: true,
          message: 'Demo account: Password is Password123!',
        };
      }

      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
            redirectTo: window.location.origin,
          });

          if (error) {
            return { success: false, error: error.message };
          }
          return { success: true };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    []
  );

  // Google OAuth Sign In / Sign Up
  const signInWithGoogle = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('moneydairy_oauth_login_pending', 'Google');
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('moneydairy_oauth_login_pending');
          }
          return { success: false, error: error.message };
        }
        return { success: true, data };
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('moneydairy_oauth_login_pending');
        }
        return signInDemo('alex');
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('moneydairy_oauth_login_pending');
      }
      return { success: false, error: err.message };
    }
  }, [signInDemo]);

  // Update User Password (for Recovery or Settings)
  const updatePassword = useCallback(
    async (newPassword) => {
      const trimmed = (newPassword || '').trim();
      if (!trimmed || trimmed.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.updateUser({
            password: trimmed,
          });

          if (error) {
            return { success: false, error: error.message };
          }

          setIsPasswordRecovery(false);
          if (typeof window !== 'undefined' && window.history?.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          showToast({
            type: 'success',
            title: language === 'vi' ? 'Thành công' : language === 'lo' ? 'ສຳເລັດ' : 'Success',
            message:
              language === 'vi'
                ? 'Đã cập nhật mật khẩu mới thành công!'
                : language === 'lo'
                ? 'ອັບເດດລະຫັດຜ່ານໃໝ່ສຳເລັດແລ້ວ!'
                : 'Your password has been updated successfully!',
          });

          return { success: true, data };
        }

        setIsPasswordRecovery(false);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [language, showToast]
  );

  // Realtime subscription - scoped by stable user id
  const userId = user?.id;
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`realtime:transactions:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchTransactions]);

  // Apply dark mode class to HTML root and update mobile status bar theme-color
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const themeColor = isDarkMode ? '#0A0F1D' : '#FFFFFF';
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', themeColor);
    });
    localStorage.setItem('moneydairy_darkmode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);


  // Persist currency
  useEffect(() => {
    localStorage.setItem('moneydairy_currency', currency);
  }, [currency]);

  // Persist hide balance
  useEffect(() => {
    localStorage.setItem('moneydairy_hide_balance', JSON.stringify(isBalanceHidden));
  }, [isBalanceHidden]);

  // Translation helper function
  const t = (path, params = {}) => {
    const keys = path.split('.');
    let current = TRANSLATIONS[language] || TRANSLATIONS['en'];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        let fallback = TRANSLATIONS['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            fallback = null;
            break;
          }
        }
        current = fallback !== null && fallback !== undefined ? fallback : path;
        break;
      }
    }

    if (typeof current === 'string') {
      return Object.entries(params).reduce((str, [paramKey, val]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      }, current);
    }
    return current;
  };

  // Helper for localized category names
  const getCategoryName = (catId) => {
    const translated = t(`categories.${catId}`);
    if (translated && translated !== `categories.${catId}`) {
      return translated;
    }
    return CATEGORIES[catId]?.name || catId;
  };

  // Helper for localized payment methods
  const getPaymentMethodName = (method) => {
    const translated = t(`payments.${method}`);
    if (translated && translated !== `payments.${method}`) {
      return translated;
    }
    return method;
  };

  // Localized date formatter
  const formatDateLocalized = (date, options) => {
    const d = date instanceof Date ? date : new Date(date);
    const locale = LANGUAGES[language]?.locale || 'en-US';
    return d.toLocaleDateString(locale, options);
  };

  // Add a new transaction
  const addTransaction = async (transactionData) => {
    const activeCurrObj = CURRENCIES[currency] || CURRENCIES['LAK'];
    const lakRate = CURRENCIES['LAK'].rateToUSD;
    const currRate = activeCurrObj.rateToUSD;
    const amountInLAK = Math.round(Number(transactionData.amount) * (lakRate / currRate));

    const ownerTag = isAlexUser(user)
      ? 'Alex Morgan'
      : (user?.id || user?.email || 'user');
    const storageKey = getUserTxStorageKey(user);

    const tempId = 'tx-' + Date.now();
    const newTx = {
      id: tempId,
      title: transactionData.title.trim() || (transactionData.type === 'income' ? t('modal.receivedCash') : t('modal.quickExpense')),
      category: transactionData.category || (transactionData.type === 'income' ? 'salary' : 'other_expense'),
      amount: amountInLAK,
      type: transactionData.type,
      date: transactionData.date || new Date().toISOString(),
      paymentMethod: transactionData.paymentMethod || 'QR Scan',
      notes: transactionData.notes || '',
      owner: ownerTag,
    };

    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
    setIsAddModalOpen(false);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([
            {
              title: newTx.title,
              amount: newTx.amount,
              type: newTx.type,
              category: newTx.category,
              payment_method: newTx.paymentMethod,
              date: newTx.date,
              notes: newTx.notes,
              owner: newTx.owner,
            },
          ])
          .select();

        if (error) {
          console.error('Failed to insert into Supabase:', error.message);
        } else if (data && data[0]) {
          const mapped = mapRowToTx(data[0]);
          setTransactions((prev) => {
            const updated = prev.map((item) => (item.id === tempId ? mapped : item));
            if (storageKey) {
              localStorage.setItem(storageKey, JSON.stringify(updated));
            }
            return updated;
          });
        }
      } catch (err) {
        console.error('Supabase insert error:', err);
      }
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    const storageKey = getUserTxStorageKey(user);
    setTransactions((prev) => {
      const updated = prev.filter((tx) => tx.id !== id);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) {
          console.error('Failed to delete in Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase delete error:', err);
      }
    }
  };

  // Reset transactions (Alex gets sample data, standard accounts wipe to clean state)
  const resetToSampleData = async () => {
    if (!user) return;
    setIsLoading(true);

    const isAlex = isAlexUser(user);
    const storageKey = getUserTxStorageKey(user);

    if (isSupabaseConfigured) {
      try {
        if (isAlex) {
          const alexFilters = buildUserFilters(user);
          await supabase.from('transactions').delete().or(alexFilters.join(','));

          const seedRows = INITIAL_TRANSACTIONS.map((tx) => ({
            title: tx.title,
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            payment_method: tx.paymentMethod,
            date: tx.date,
            notes: tx.notes || '',
            owner: 'Alex Morgan',
          }));

          const { data } = await supabase.from('transactions').insert(seedRows).select();
          if (data) {
            const mapped = data.map(mapRowToTx);
            setTransactions(mapped);
            if (storageKey) localStorage.setItem(storageKey, JSON.stringify(mapped));
          }
        } else {
          const userFilters = buildUserFilters(user);
          if (userFilters.length > 0) {
            await supabase.from('transactions').delete().or(userFilters.join(','));
          }

          setTransactions([]);
          if (storageKey) localStorage.setItem(storageKey, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Reset error:', err);
        const fallback = isAlex ? INITIAL_TRANSACTIONS : [];
        setTransactions(fallback);
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify(fallback));
      }
    } else {
      const resetData = isAlex ? INITIAL_TRANSACTIONS : [];
      setTransactions(resetData);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(resetData));
      }
    }

    setIsLoading(false);
  };

  // Currency conversion helper
  const convertFromLAK = (amountInLAK) => {
    const lakRate = CURRENCIES['LAK'].rateToUSD;
    const currRate = (CURRENCIES[currency] || CURRENCIES['LAK']).rateToUSD;
    return amountInLAK * (currRate / lakRate);
  };

  // Currency formatted string
  const formatCurrency = (amountInLAK, withSymbol = true) => {
    if (isBalanceHidden) return '••••••';
    const converted = convertFromLAK(amountInLAK);
    const currObj = CURRENCIES[currency] || CURRENCIES['LAK'];

    let formattedNumber;
    if (currency === 'LAK' || currency === 'THB' || currency === 'VND') {
      formattedNumber = Math.round(converted).toLocaleString('en-US');
    } else {
      formattedNumber = converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (withSymbol) {
      return `${currObj.symbol} ${formattedNumber}`;
    }
    return formattedNumber;
  };

  // Aggregate stats
  const totalIncomeLAK = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenseLAK = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBalanceLAK = totalIncomeLAK - totalExpenseLAK;

  // Current month stats (scoped strictly to current real month, ignoring future dates)
  const nowContext = new Date();
  const currentRealYearContext = nowContext.getFullYear();
  const currentRealMonthContext = nowContext.getMonth();
  const currentMonthTxs = transactions.filter((tx) => {
    if (!tx.date) return false;
    const d = new Date(tx.date);
    return d.getFullYear() === currentRealYearContext && d.getMonth() === currentRealMonthContext;
  });

  const thisMonthIncomeLAK = currentMonthTxs
    .filter((tx) => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const thisMonthExpenseLAK = currentMonthTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const thisMonthNetLAK = thisMonthIncomeLAK - thisMonthExpenseLAK;

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <FinanceContext.Provider
      value={{
        user,
        session,
        isAuthLoading,
        avatarUrl,
        updateAvatar,
        removeAvatar,
        signIn,
        signInDemo,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        updateUserName,
        isPasswordRecovery,
        setIsPasswordRecovery,
        updatePassword,
        transactions,
        currency,
        setCurrency,
        language,
        setLanguage,
        languages: LANGUAGES,
        currentLanguage: LANGUAGES[language] || LANGUAGES['lo'],
        t,
        getCategoryName,
        getPaymentMethodName,
        formatDateLocalized,
        isDarkMode,
        setIsDarkMode,
        isBalanceHidden,
        setIsBalanceHidden,
        currentTab,
        setCurrentTab,
        isAddModalOpen,
        setIsAddModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        addTransaction,
        deleteTransaction,
        resetToSampleData,
        formatCurrency,
        convertFromLAK,
        totalBalanceLAK,
        totalIncomeLAK,
        totalExpenseLAK,
        thisMonthIncomeLAK,
        thisMonthExpenseLAK,
        thisMonthNetLAK,
        recentTransactions,
        isCloudConnected,
        isLoading,
        refreshData: fetchTransactions,
        toast,
        showToast,
        hideToast,
        budgets,
        saveBudget,
        clearBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export default FinanceContext;
