import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_TRANSACTIONS } from '../data/initialData';
import { CURRENCIES, CATEGORIES } from '../data/categories';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { triggerConfetti, triggerFireworks } from '../utils/confetti';

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

  // Ref flag indicating active manual form sign-in in progress
  const isManualAuthRef = useRef(false);

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
      const email = (user.email || '').toLowerCase().trim();
      const saved =
        localStorage.getItem(`moneydairy_avatar_${uid}`) ||
        (email ? localStorage.getItem(`moneydairy_avatar_${email}`) : null);

      if (saved) {
        setAvatarUrl(saved);
      } else if (user.user_metadata?.custom_avatar_url) {
        setAvatarUrl(user.user_metadata.custom_avatar_url);
      } else if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      } else {
        setAvatarUrl(null);
      }
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  // Update avatar - Uploads to Supabase Storage 'avatars' bucket, updates profiles table, and saves custom avatar metadata
  const updateAvatar = useCallback(async (dataUrl) => {
    const activeUser = userRef.current;
    const uid = activeUser ? (activeUser.id || activeUser.email || 'user') : 'user';
    const email = (activeUser?.email || '').toLowerCase().trim();
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
          const oldSaved =
            localStorage.getItem(`moneydairy_avatar_${uid}`) ||
            (email ? localStorage.getItem(`moneydairy_avatar_${email}`) : null);
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
        if (email) localStorage.setItem(`moneydairy_avatar_${email}`, finalAvatarUrl);
      } else {
        localStorage.removeItem(`moneydairy_avatar_${uid}`);
        if (email) localStorage.removeItem(`moneydairy_avatar_${email}`);
      }

      // Update in-memory user state immediately
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          user_metadata: {
            ...(prev.user_metadata || {}),
            avatar_url: finalAvatarUrl || '',
            custom_avatar_url: finalAvatarUrl || '',
            has_custom_avatar: Boolean(finalAvatarUrl),
          },
        };
      });

      // Persist to Supabase Auth & public.profiles
      if (
        isSupabaseConfigured &&
        activeUser?.id &&
        activeUser.id !== 'demo-alex-101' &&
        activeUser.id !== 'demo-guest-102'
      ) {
        await supabase.auth.updateUser({
          data: {
            avatar_url: finalAvatarUrl || '',
            custom_avatar_url: finalAvatarUrl || '',
            has_custom_avatar: Boolean(finalAvatarUrl),
          },
        });

        try {
          await supabase.from('profiles').upsert({
            id: activeUser.id,
            email: activeUser.email,
            avatar_url: finalAvatarUrl || null,
            updated_at: new Date().toISOString(),
          });
        } catch (profileErr) {
          console.warn('Failed to upsert avatar to profiles table:', profileErr);
        }
      }
    } catch (e) {
      console.warn('Failed to persist avatar:', e);
    }
  }, []);

  const removeAvatar = useCallback(async () => {
    const activeUser = userRef.current;
    const uid = activeUser ? (activeUser.id || activeUser.email || 'user') : 'user';
    const email = (activeUser?.email || '').toLowerCase().trim();
    const oldSaved =
      localStorage.getItem(`moneydairy_avatar_${uid}`) ||
      (email ? localStorage.getItem(`moneydairy_avatar_${email}`) : null);

    if (isSupabaseConfigured && oldSaved && oldSaved.includes('/avatars/')) {
      const oldPath = oldSaved.split('/avatars/')[1]?.split('?')[0];
      if (oldPath) {
        try {
          await supabase.storage.from('avatars').remove([oldPath]);
        } catch {}
      }
    }

    localStorage.removeItem(`moneydairy_avatar_${uid}`);
    if (email) localStorage.removeItem(`moneydairy_avatar_${email}`);

    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        user_metadata: {
          ...(prev.user_metadata || {}),
          avatar_url: '',
          custom_avatar_url: '',
          has_custom_avatar: false,
        },
      };
    });

    if (
      isSupabaseConfigured &&
      activeUser?.id &&
      activeUser.id !== 'demo-alex-101' &&
      activeUser.id !== 'demo-guest-102'
    ) {
      try {
        await supabase.auth.updateUser({
          data: {
            avatar_url: '',
            custom_avatar_url: '',
            has_custom_avatar: false,
          },
        });
        await supabase.from('profiles').upsert({
          id: activeUser.id,
          email: activeUser.email,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Remove avatar sync error:', err);
      }
    }

    setAvatarUrl(null);
  }, []);

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
      const email = (activeUser.email || '').toLowerCase().trim();

      try {
        // 1. Persist to Supabase Auth if real registered user
        if (
          isSupabaseConfigured &&
          activeUser?.id &&
          activeUser.id !== 'demo-alex-101' &&
          activeUser.id !== 'demo-guest-102'
        ) {
          const { data, error } = await supabase.auth.updateUser({
            data: {
              full_name: trimmed,
              custom_full_name: trimmed,
              has_custom_name: true,
            },
          });

          if (error) {
            console.warn('Supabase updateUser error:', error.message);
          } else if (data?.user) {
            setUser((prev) => ({
              ...(data.user || prev),
              user_metadata: {
                ...(data.user?.user_metadata || prev?.user_metadata || {}),
                full_name: trimmed,
                custom_full_name: trimmed,
                has_custom_name: true,
              },
            }));
          }

          // Also upsert to public.profiles table
          try {
            await supabase.from('profiles').upsert({
              id: activeUser.id,
              email: activeUser.email,
              full_name: trimmed,
              updated_at: new Date().toISOString(),
            });
          } catch (profileErr) {
            console.warn('Profile name upsert error:', profileErr);
          }
        }

        // 2. Always persist to localStorage cache (both UID and Email)
        localStorage.setItem(`moneydairy_user_name_${uid}`, trimmed);
        if (email) {
          localStorage.setItem(`moneydairy_user_name_${email}`, trimmed);
          localStorage.setItem(`moneydairy_user_email_for_${trimmed.toLowerCase()}`, email);
        }

        setUser((prev) => {
          if (!prev) return prev;
          const updatedUser = {
            ...prev,
            user_metadata: {
              ...(prev.user_metadata || {}),
              full_name: trimmed,
              custom_full_name: trimmed,
              has_custom_name: true,
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

    const resolveUserProfile = async (u) => {
      if (!u) return { resolvedUser: u, resolvedAvatar: null };
      const uid = u.id || u.email || 'user';
      const email = (u.email || '').toLowerCase().trim();

      // 1. Check local storage cache (by UID and by Email)
      const localName =
        localStorage.getItem(`moneydairy_user_name_${uid}`) ||
        (email ? localStorage.getItem(`moneydairy_user_name_${email}`) : null);

      const localAvatar =
        localStorage.getItem(`moneydairy_avatar_${uid}`) ||
        (email ? localStorage.getItem(`moneydairy_avatar_${email}`) : null);

      // 2. Query public.profiles table from Supabase
      let dbName = null;
      let dbAvatar = null;
      if (isSupabaseConfigured && u.id && !u.id.startsWith('demo-')) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', u.id)
            .maybeSingle();

          if (profile) {
            dbName = profile.full_name;
            dbAvatar = profile.avatar_url;
          }
        } catch (dbErr) {
          console.warn('Database profile query error:', dbErr);
        }
      }

      // 3. Custom fields in user_metadata (Google OAuth never overwrites custom keys)
      const metaCustomName = u.user_metadata?.custom_full_name;
      const metaCustomAvatar = u.user_metadata?.custom_avatar_url;

      // Determine authoritative Name:
      // Priority: metaCustomName > localName > (dbName if different from Google raw name) > dbName > user_metadata.full_name > user_metadata.name > email
      const resolvedName =
        metaCustomName ||
        localName ||
        (dbName && dbName !== u.user_metadata?.name ? dbName : null) ||
        dbName ||
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        (email ? email.split('@')[0] : 'User');

      // Determine authoritative Avatar:
      // Any uploaded avatar in Supabase Storage contains '/avatars/' in the URL!
      const isDbUploadedAvatar = dbAvatar && dbAvatar.includes('/avatars/');
      const isLocalUploadedAvatar = localAvatar && localAvatar.includes('/avatars/');
      const isMetaUploadedAvatar = metaCustomAvatar && metaCustomAvatar.includes('/avatars/');

      const resolvedAvatar =
        (isMetaUploadedAvatar ? metaCustomAvatar : null) ||
        (isDbUploadedAvatar ? dbAvatar : null) ||
        (isLocalUploadedAvatar ? localAvatar : null) ||
        metaCustomAvatar ||
        localAvatar ||
        dbAvatar ||
        u.user_metadata?.avatar_url ||
        u.user_metadata?.picture ||
        null;

      // 4. If Google OAuth overwrote metadata or if custom metadata is missing:
      // Re-sync back to Supabase Auth user_metadata AND public.profiles so it stays protected!
      const isGoogleOAuth =
        u.app_metadata?.provider === 'google' ||
        u.identities?.some((i) => i.provider === 'google');

      if (
        isSupabaseConfigured &&
        u.id &&
        !u.id.startsWith('demo-') &&
        (isGoogleOAuth ||
          resolvedName !== u.user_metadata?.full_name ||
          resolvedAvatar !== u.user_metadata?.avatar_url ||
          !u.user_metadata?.custom_full_name)
      ) {
        setTimeout(async () => {
          try {
            await supabase.auth.updateUser({
              data: {
                full_name: resolvedName,
                custom_full_name: resolvedName,
                avatar_url: resolvedAvatar || '',
                custom_avatar_url: resolvedAvatar || '',
                has_custom_profile: true,
              },
            });

            await supabase.from('profiles').upsert({
              id: u.id,
              email: u.email,
              full_name: resolvedName,
              avatar_url: resolvedAvatar,
              updated_at: new Date().toISOString(),
            });
          } catch (reSyncErr) {
            console.warn('Background profile re-sync error:', reSyncErr);
          }
        }, 50);
      }

      // Re-cache to localStorage under both UID and Email
      if (resolvedName) {
        localStorage.setItem(`moneydairy_user_name_${uid}`, resolvedName);
        if (email) localStorage.setItem(`moneydairy_user_name_${email}`, resolvedName);
      }
      if (resolvedAvatar) {
        localStorage.setItem(`moneydairy_avatar_${uid}`, resolvedAvatar);
        if (email) localStorage.setItem(`moneydairy_avatar_${email}`, resolvedAvatar);
      }

      const finalUser = {
        ...u,
        user_metadata: {
          ...(u.user_metadata || {}),
          full_name: resolvedName,
          custom_full_name: resolvedName,
          avatar_url: resolvedAvatar || '',
          custom_avatar_url: resolvedAvatar || '',
          has_custom_profile: true,
        },
      };

      return { resolvedUser: finalUser, resolvedAvatar };
    };

    const notifyOAuthSignIn = (u) => {
      if (!u || typeof window === 'undefined') return;
      const isOAuthPending = sessionStorage.getItem('moneydairy_oauth_login_pending');
      const hasOAuthHash = window.location.hash.includes('access_token') || window.location.search.includes('code=');

      if (isOAuthPending || hasOAuthHash) {
        sessionStorage.removeItem('moneydairy_oauth_login_pending');
        if (window.history?.replaceState && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        const name =
          u.user_metadata?.custom_full_name ||
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

        triggerConfetti();
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
            const { resolvedUser, resolvedAvatar } = await resolveUserProfile(session.user);
            setSession(session);
            setUser(resolvedUser);
            if (resolvedAvatar) setAvatarUrl(resolvedAvatar);
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
          const { resolvedUser, resolvedAvatar } = await resolveUserProfile(parsed);
          setUser(resolvedUser);
          if (resolvedAvatar) setAvatarUrl(resolvedAvatar);
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
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setTransactions([]);
          setIsAuthLoading(false);
          return;
        }
        setSession(session);
        if (session?.user) {
          const { resolvedUser, resolvedAvatar } = await resolveUserProfile(session.user);
          if (!isManualAuthRef.current) {
            setUser(resolvedUser);
            if (resolvedAvatar) setAvatarUrl(resolvedAvatar);
            fetchTransactions(resolvedUser);
            notifyOAuthSignIn(resolvedUser);
          }
        } else {
          setUser(null);
          setTransactions([]);
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

    // Fire celebration animation immediately!
    triggerConfetti();

    showToast({
      type: 'success',
      title: language === 'vi' ? 'Đăng nhập thành công' : language === 'lo' ? 'ເຂົ້າສູ່ລະບົບສຳເລັດ' : 'Sign In Successful',
      message: language === 'vi'
        ? `Chào mừng ${demoUser.user_metadata.full_name} quay trở lại!`
        : language === 'lo'
        ? `ຍິນດີຕ້ອນຮັບ ${demoUser.user_metadata.full_name} ກັບມາ!`
        : `Welcome back, ${demoUser.user_metadata.full_name}!`,
    });

    setTimeout(() => {
      setUser(demoUser);
      fetchTransactions(demoUser);
    }, 300);

    return { success: true, user: demoUser };
  }, [language, showToast, fetchTransactions]);

  // 3. Helper to resolve an Email from an Identifier (Email or Username)
  const resolveEmailFromIdentifier = useCallback(async (identifier) => {
    const raw = (identifier || '').trim();
    if (!raw) return null;

    // A. If identifier contains '@', it is directly an email address
    if (raw.includes('@')) {
      return raw.toLowerCase();
    }

    const lower = raw.toLowerCase();

    // B. Fast demo accounts shortcut
    if (lower === 'alex' || lower === 'alex.phommaseng') {
      return 'alex.phommaseng@gmail.com';
    }
    if (lower === 'guest') {
      return 'guest@moneydairy.app';
    }

    // C. Check local cache (fastest lookup on current device)
    const cachedEmail = localStorage.getItem(`moneydairy_user_email_for_${lower}`);
    if (cachedEmail) {
      return cachedEmail;
    }

    // D. Query Supabase public.profiles table
    if (isSupabaseConfigured) {
      // Step 1: Attempt lookup on 'username' column (if table has this column)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', raw)
          .maybeSingle();
        if (!error && data?.email) {
          const resolved = data.email.toLowerCase().trim();
          localStorage.setItem(`moneydairy_user_email_for_${lower}`, resolved);
          return resolved;
        }
      } catch (err) {
        // column username might not exist, ignore and proceed to full_name
      }

      // Step 2: Match on 'full_name' column (case-insensitive)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .ilike('full_name', raw)
          .maybeSingle();
        if (!error && data?.email) {
          const resolved = data.email.toLowerCase().trim();
          localStorage.setItem(`moneydairy_user_email_for_${lower}`, resolved);
          return resolved;
        }
      } catch (err) {
        console.warn('Profile full_name lookup error:', err);
      }

      // Step 3: Match on email prefix (e.g. user entered "ekalat8" or "mrkoong1234")
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .ilike('email', `${raw}@%`)
          .maybeSingle();
        if (!error && data?.email) {
          const resolved = data.email.toLowerCase().trim();
          localStorage.setItem(`moneydairy_user_email_for_${lower}`, resolved);
          return resolved;
        }
      } catch (err) {
        console.warn('Profile email prefix lookup error:', err);
      }
    }

    return null;
  }, []);

  // 4. Auth Actions: Sign In, Sign Up, Sign Out
  const signIn = async (identifier, password) => {
    const trimmedInput = (identifier || '').trim();
    if (!trimmedInput) {
      return {
        success: false,
        error:
          language === 'vi'
            ? 'Vui lòng nhập email hoặc tên đăng nhập'
            : language === 'lo'
            ? 'ກະລຸນາປ້ອນອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້'
            : 'Please enter your email or username',
      };
    }

    const lowerInput = trimmedInput.toLowerCase();

    // Check if logging in as demo account or offline test credentials
    if (
      (lowerInput === 'alex' ||
        lowerInput === 'alex.phommaseng' ||
        lowerInput === 'alex@moneydairy.app' ||
        lowerInput === 'alex.phommaseng@gmail.com') &&
      (password === 'demo' || password === 'Password123!' || password === '123456')
    ) {
      return signInDemo('alex');
    }

    if (
      (lowerInput === 'guest' || lowerInput === 'guest@moneydairy.app') &&
      (password === 'demo' || password === 'Password123!' || password === '123456')
    ) {
      return signInDemo('guest');
    }

    // Resolve identifier (Username or Email) to actual Email address
    let targetEmail = trimmedInput;
    if (!trimmedInput.includes('@')) {
      targetEmail = await resolveEmailFromIdentifier(trimmedInput);
      if (!targetEmail) {
        return {
          success: false,
          error:
            language === 'vi'
              ? `Không tìm thấy tài khoản với tên đăng nhập "${trimmedInput}". Vui lòng kiểm tra lại hoặc nhập địa chỉ email!`
              : language === 'lo'
              ? `ບໍ່ພົບຊື່ຜູ້ໃຊ້ "${trimmedInput}" ໃນລະບົບ. ກະລຸນາກວດສອບຄືນ ຫຼື ປ້ອນທີ່ຢູ່ອີເມວ!`
              : `Username "${trimmedInput}" not found. Please verify your username or sign in with your email address.`,
        };
      }
    } else {
      targetEmail = lowerInput;
    }

    isManualAuthRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        // If Supabase fails but password matches demo fallback
        if (
          (lowerInput.includes('alex') || lowerInput.includes('moneydairy')) &&
          (password === 'demo' || password === 'Password123!')
        ) {
          return signInDemo('alex');
        }
        return { success: false, error: error.message };
      }

      // 1. Immediately trigger celebration fireworks like FaceID!
      triggerConfetti();

      localStorage.removeItem('moneydairy_demo_user');

      // Cache mapping username -> email for fast future lookups
      if (data?.user?.email) {
        const uEmail = data.user.email.toLowerCase().trim();
        const uName =
          data.user.user_metadata?.custom_full_name ||
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name;
        if (uName) {
          localStorage.setItem(`moneydairy_user_email_for_${uName.toLowerCase().trim()}`, uEmail);
        }
        const uPrefix = uEmail.split('@')[0];
        if (uPrefix) {
          localStorage.setItem(`moneydairy_user_email_for_${uPrefix.toLowerCase().trim()}`, uEmail);
        }
      }

      // Resolve complete user profile (protects custom name & avatar)
      const { resolvedUser, resolvedAvatar } = await resolveUserProfile(data.user);

      const displayName =
        resolvedUser.user_metadata?.custom_full_name ||
        resolvedUser.user_metadata?.full_name ||
        resolvedUser.email;

      showToast({
        type: 'success',
        title:
          language === 'vi'
            ? 'Đăng nhập thành công'
            : language === 'lo'
            ? 'ເຂົ້າສູ່ລະບົບສຳເລັດ'
            : 'Sign In Successful',
        message:
          language === 'vi'
            ? `Chào mừng ${displayName} quay trở lại!`
            : language === 'lo'
            ? `ຍິນດີຕ້ອນຮັບ ${displayName} ກັບມາ!`
            : `Welcome back, ${displayName}!`,
      });

      // 3. Allow user to enjoy fireworks burst on login card before transitioning (just like FaceID)
      await new Promise((r) => setTimeout(r, 450));

      setUser(resolvedUser);
      if (resolvedAvatar) setAvatarUrl(resolvedAvatar);
      setSession(data.session);
      fetchTransactions(resolvedUser);

      return { success: true, user: resolvedUser };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      isManualAuthRef.current = false;
    }
  };

  const signUp = async (email, password, fullName) => {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanName = (fullName || 'User').trim();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            custom_full_name: cleanName,
            has_custom_name: true,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Pre-cache username -> email mapping
      if (cleanName) {
        localStorage.setItem(`moneydairy_user_email_for_${cleanName.toLowerCase()}`, trimmedEmail);
      }
      const prefix = trimmedEmail.split('@')[0];
      if (prefix) {
        localStorage.setItem(`moneydairy_user_email_for_${prefix.toLowerCase()}`, trimmedEmail);
      }

      // Also upsert to public.profiles table
      if (data?.user?.id && isSupabaseConfigured) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: trimmedEmail,
            full_name: cleanName,
            updated_at: new Date().toISOString(),
          });
        } catch (profileErr) {
          console.warn('Error creating profile on signup:', profileErr);
        }
      }

      const needsConfirmation = !data.session && data.user && !data.user.confirmed_at;

      if (!needsConfirmation && data.user) {
        localStorage.removeItem('moneydairy_demo_user');
        const { resolvedUser, resolvedAvatar } = await resolveUserProfile(data.user);

        // Fire celebration animation immediately!
        triggerConfetti();

        showToast({
          type: 'success',
          title: language === 'vi' ? 'Đăng ký thành công' : language === 'lo' ? 'ສ້າງບັນຊີສຳເລັດ' : 'Account Created',
          message: language === 'vi'
            ? 'Chào mừng bạn đến với MoneyDairy!'
            : language === 'lo'
            ? 'ຍິນດີຕ້ອນຮັບສູ່ MoneyDairy!'
            : 'Welcome to MoneyDairy!',
        });

        await new Promise((r) => setTimeout(r, 450));

        setUser(resolvedUser);
        if (resolvedAvatar) setAvatarUrl(resolvedAvatar);
        setSession(data.session);
        fetchTransactions(resolvedUser);
      }

      return { success: true, user: data.user, needsConfirmation };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signOut = useCallback(async () => {
    // 1. Instantly clear user and session states (Immediate UI response, 0ms delay)
    setUser(null);
    setSession(null);
    setTransactions([]);
    setCurrentTab('dashboard');

    // 2. Clear all local storage credentials immediately
    try {
      localStorage.removeItem('moneydairy_demo_user');
      localStorage.removeItem('moneydairy_user');
      localStorage.removeItem('moneydairy_auth_token');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage cleanup error:', e);
    }

    // 3. Show logout toast
    showToast({
      type: 'info',
      title: language === 'vi' ? 'Đã đăng xuất' : language === 'lo' ? 'ອອກຈາກລະບົບ' : 'Signed Out',
      message:
        language === 'vi'
          ? 'Bạn đã đăng xuất an toàn khỏi hệ thống.'
          : language === 'lo'
          ? 'ທ່ານໄດ້ອອກຈາກລະບົບຢ່າງປອດໄພແລ້ວ.'
          : 'You have signed out of your account.',
    });

    // 4. In background, inform Supabase (fire-and-forget, never traps or delays user)
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Background Supabase signout error:', err);
      }
    }
  }, [language, showToast]);

  // Reset Password for Email or Username
  const resetPassword = useCallback(
    async (identifier) => {
      const trimmed = (identifier || '').trim();
      if (!trimmed) {
        return { success: false, error: 'Email or username is required' };
      }

      // Demo account handling
      const lower = trimmed.toLowerCase();
      if (
        lower === 'alex' ||
        lower === 'alex@moneydairy.app' ||
        lower === 'alex.phommaseng@gmail.com' ||
        lower === 'guest' ||
        lower === 'guest@moneydairy.app'
      ) {
        return {
          success: true,
          message: 'Demo account: Password is Password123!',
        };
      }

      // Resolve username to email if necessary
      let emailToReset = trimmed;
      if (!trimmed.includes('@')) {
        const found = await resolveEmailFromIdentifier(trimmed);
        if (!found) {
          return {
            success: false,
            error:
              language === 'vi'
                ? `Không tìm thấy tài khoản với tên "${trimmed}". Vui lòng nhập địa chỉ email!`
                : language === 'lo'
                ? `ບໍ່ພົບຊື່ "${trimmed}" ໃນລະບົບ. ກະລຸນາປ້ອນທີ່ຢູ່ອີເມວ!`
                : `Account with username "${trimmed}" not found. Please enter your email address.`,
          };
        }
        emailToReset = found;
      }

      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
            redirectTo: window.location.origin,
          });

          if (error) {
            return { success: false, error: error.message };
          }
          return { success: true, email: emailToReset };
        }

        return { success: true, email: emailToReset };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [language, resolveEmailFromIdentifier]
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
        resolveEmailFromIdentifier,
        triggerFireworks,
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
