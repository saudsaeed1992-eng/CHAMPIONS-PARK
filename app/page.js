'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import translations from '@/lib/translations';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'ku', name: 'Kurdish', flag: '🏳️', native: 'کوردی (سۆرانی)' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
];

const QUOTES = [
  { text: 'Every champion was once a contender that refused to give up.', author: 'Rocky Balboa', lang: 'en' },
  { text: 'The body achieves what the mind believes.', author: 'Champions Park', lang: 'en' },
  { text: 'Push yourself because no one else is going to do it for you.', author: 'Champions Park', lang: 'en' },
  { text: 'كل بطل كان يوماً مبتدئاً. ابدأ رحلتك اليوم.', author: 'بارك أبطال', lang: 'ar' },
  { text: 'جسدك يحقق ما يؤمن به عقلك. آمن بنفسك.', author: 'بارك أبطال', lang: 'ar' },
  { text: 'النجاح ليس نهائياً، والفشل ليس قاتلاً. الشجاعة هي ما يهم.', author: 'بارك أبطال', lang: 'ar' },
  { text: 'هەر شامپیۆنێک روژێک سەرەتایەکی بوو. ئەمڕۆ دەستپێبکە.', author: 'پارکی شامپیۆنان', lang: 'ku' },
  { text: 'جەستەکەت ئەوەی دەبەخشێت کە دەتەوێ. باوەڕت پێ بێت.', author: 'پارکی شامپیۆنان', lang: 'ku' },
  { text: 'Her şampiyon bir zamanlar vazgeçmeyi reddeden biriydi.', author: 'Champions Park', lang: 'tr' },
  { text: 'Vücut, zihnin inandığını başarır.', author: 'Champions Park', lang: 'tr' },
];

export default function HomePage() {
  const router = useRouter();
  const [screen, setScreen] = useState('language'); // 'language' | 'auth'
  const [selectedLang, setSelectedLang] = useState('en');
  const [activeTab, setActiveTab] = useState('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  const [signupForm, setSignupForm] = useState({
    fullName: '', email: '', password: '', goalType: '',
  });
  const [loginForm, setLoginForm] = useState({
    email: '', password: '',
  });

  const t = (key) => {
    const lang = translations[selectedLang] || translations['en'];
    return lang[key] || translations['en'][key] || key;
  };

  const dir = translations[selectedLang]?.dir || 'ltr';
  const isRTLLang = dir === 'rtl';

  useEffect(() => {
    setMounted(true);
    // Load saved language
    const saved = localStorage.getItem('cp_language');
    if (saved && translations[saved]) setSelectedLang(saved);

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('id, language').eq('id', session.user.id).single();
       await supabase.from('profiles').update({ language: selectedLang }).eq('id', session.user.id)
setSelectedLang(selectedLang)
localStorage.setItem('cp_language', selectedLang)
document.documentElement.dir = translations[selectedLang]?.dir || 'ltr'
        router.push(profile ? '/dashboard' : '/onboarding');
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex(prev => (prev + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLanguageConfirm = () => {
    localStorage.setItem('cp_language', selectedLang);
    // Apply RTL to document
    document.documentElement.dir = translations[selectedLang]?.dir || 'ltr';
    document.documentElement.lang = selectedLang;
    setScreen('auth');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!signupForm.fullName.trim()) { setError(t('errorGeneral')); return; }
    if (!signupForm.email.trim()) { setError(t('errorGeneral')); return; }
    if (signupForm.password.length < 6) { setError(t('errorGeneral')); return; }
    if (!signupForm.goalType) { setError(t('errorGeneral')); return; }
    setLoading(true);
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: signupForm.email.trim(),
        password: signupForm.password,
        options: { data: { full_name: signupForm.fullName.trim(), goal_type: signupForm.goalType } },
      });
      if (signupError) { setError(signupError.message); return; }
      if (data.user) {
        // Save language to profile immediately
        await supabase.from('profiles').upsert({
          id: data.user.id,
          language: selectedLang,
        });
        router.push('/onboarding');
      }
    } catch (err) {
      setError(err.message || t('errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginForm.email.trim() || !loginForm.password) { setError(t('errorGeneral')); return; }
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(), password: loginForm.password,
      });
      if (loginError) { setError(loginError.message); return; }
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('id, language').eq('id', data.user.id).single();
        if (profile?.language) {
          setSelectedLang(profile.language);
          localStorage.setItem('cp_language', profile.language);
          document.documentElement.dir = translations[profile.language]?.dir || 'ltr';
        }
        router.push(profile ? '/dashboard' : '/onboarding');
      }
    } catch (err) {
      setError(err.message || t('errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const currentQuote = QUOTES[quoteIndex];
  const isQuoteRTL = currentQuote.lang === 'ar' || currentQuote.lang === 'ku';

  const goalOptions = [
    { value: 'weight_loss', icon: '🔥', label: t('goalWeightLoss'), desc: t('goalWeightLossDesc') },
    { value: 'bodybuilding', icon: '💪', label: t('goalMuscle'), desc: t('goalMuscleDesc') },
  ];

  if (!mounted) return null;

  // ── LANGUAGE PICKER SCREEN ──
  if (screen === 'language') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #E8F5E9 100%)',
        fontFamily: 'Georgia, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.svg" alt="Champions Park" style={{ width: '80px', height: '80px', marginBottom: '10px' }} />
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#1B3A2A', fontFamily: 'Georgia, serif', margin: 0 }}>
            Champions Park
          </h1>
          <p style={{ fontSize: '14px', color: '#5A7A5A', fontStyle: 'italic', marginTop: '4px' }}>
            Where Champions Are Built.
          </p>
        </div>

        {/* Language Card */}
        <div style={{
          width: '100%', maxWidth: '400px',
          background: '#FDFCFA',
          border: '1px solid rgba(134,168,134,0.3)',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(27,58,42,0.1)',
          padding: '32px 28px',
        }}>
          <h2 style={{
            fontSize: '20px', fontWeight: '700',
            color: '#1B3A2A', textAlign: 'center',
            marginBottom: '6px', fontFamily: 'Georgia, serif',
          }}>
            Choose Your Language
          </h2>
          <p style={{
            fontSize: '13px', color: '#5A7A5A',
            textAlign: 'center', marginBottom: '24px',
            fontStyle: 'italic',
          }}>
            اختر لغتك / زمانەکەت / Dilinizi seçin
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  border: selectedLang === lang.code
                    ? '2px solid #2D5A2D'
                    : '1.5px solid rgba(134,168,134,0.35)',
                  borderRadius: '12px',
                  background: selectedLang === lang.code
                    ? 'rgba(45,90,45,0.06)'
                    : '#FDFCFA',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '26px', lineHeight: 1 }}>{lang.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px', fontWeight: '700',
                    color: selectedLang === lang.code ? '#1B3A2A' : '#2D5A2D',
                  }}>
                    {lang.native}
                  </div>
                </div>
                {selectedLang === lang.code && (
                  <span style={{ fontSize: '18px' }}>✅</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleLanguageConfirm}
            style={{
              width: '100%',
              padding: '14px',
              background: '#2D5A2D',
              border: 'none',
              borderRadius: '12px',
              color: '#FDFCFA',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {translations[selectedLang]?.continue || 'Continue'} →
          </button>
        </div>
      </div>
    );
  }

  // ── AUTH SCREEN — ORIGINAL DESIGN PRESERVED ──
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #E8F5E9 100%)',
      fontFamily: 'Georgia, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      direction: dir,
    }}>

      {/* ROTATING QUOTES HEADER */}
      <div style={{
        width: '100%',
        background: '#2D5A2D',
        padding: '14px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          opacity: quoteVisible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          direction: isQuoteRTL ? 'rtl' : 'ltr',
        }}>
          <p style={{
            fontSize: '14px',
            color: 'rgba(253,252,250,0.95)',
            fontStyle: 'italic',
            margin: 0,
            fontFamily: isQuoteRTL ? 'system-ui, sans-serif' : 'Georgia, serif',
            lineHeight: '1.5',
          }}>
            "{currentQuote.text}"
          </p>
          <p style={{
            fontSize: '12px',
            color: 'rgba(253,252,250,0.6)',
            margin: '4px 0 0 0',
            fontFamily: 'system-ui, sans-serif',
          }}>
            — {currentQuote.author}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
          {QUOTES.map((_, i) => (
            <div key={i} style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: i === quoteIndex ? '#86A886' : 'rgba(134,168,134,0.3)',
              transition: 'background 0.3s', cursor: 'pointer',
            }} onClick={() => setQuoteIndex(i)} />
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', width: '100%' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '420px' }}>
          <img src="/logo.svg" alt="Champions Park" style={{ width: '80px', height: '80px', marginBottom: '8px' }} />
          <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#1B3A2A', marginBottom: '6px', fontFamily: 'Georgia, serif' }}>
            Champions Park
          </h1>
          <p style={{ fontSize: '16px', fontStyle: 'italic', color: '#4A7A4A', marginBottom: '8px' }}>
            Where Champions Are Built.
          </p>
          <p style={{ fontSize: '13px', color: '#5A7A5A', lineHeight: '1.6', marginBottom: '16px' }}>
            {t('heroSubtitle')}
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(45,90,45,0.1)', border: '1px solid rgba(45,90,45,0.25)',
            borderRadius: '20px', padding: '6px 18px',
            fontSize: '13px', fontWeight: '600', color: '#2D5A2D',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4A7A4A', display: 'inline-block' }} />
            {t('betaBadge')}
          </div>
        </div>

        {/* Auth Card */}
        <div style={{
          width: '100%', maxWidth: '420px',
          background: '#FDFCFA',
          border: '1px solid rgba(134,168,134,0.3)',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(27,58,42,0.1)',
          overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(134,168,134,0.25)', background: 'rgba(232,245,233,0.5)' }}>
            {[
              { id: 'signup', label: t('createAccount') },
              { id: 'login', label: t('signIn') },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(''); }} style={{
                flex: 1, padding: '15px', background: 'transparent', border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #2D5A2D' : '2px solid transparent',
                color: activeTab === tab.id ? '#2D5A2D' : '#5A7A5A',
                fontSize: '14px', fontWeight: activeTab === tab.id ? '700' : '400',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '28px' }}>
            {error && (
              <div style={{
                background: 'rgba(184,92,56,0.07)', border: '1px solid rgba(184,92,56,0.2)',
                borderRadius: '10px', padding: '12px 16px', color: '#B85C38',
                fontSize: '13px', marginBottom: '18px',
              }}>
                ⚠️ {error}
              </div>
            )}

            {activeTab === 'signup' && (
              <form onSubmit={handleSignup}>
                {[
                  { label: t('fullName'), type: 'text', key: 'fullName', placeholder: 'John Champion' },
                  { label: t('email'), type: 'email', key: 'email', placeholder: 'you@example.com' },
                  { label: t('password'), type: 'password', key: 'password', placeholder: t('passwordPlaceholder') },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#5A7A5A', marginBottom: '6px' }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={signupForm[field.key]}
                      onChange={e => setSignupForm({ ...signupForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '12px 14px',
                        background: '#FDFCFA', border: '1.5px solid rgba(134,168,134,0.35)',
                        borderRadius: '10px', color: '#1B3A2A', fontSize: '15px',
                        fontFamily: 'inherit', boxSizing: 'border-box',
                        direction: field.type === 'email' || field.type === 'password' ? 'ltr' : dir,
                      }}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#5A7A5A', marginBottom: '10px' }}>
                    {t('fitnessGoal')}
                  </label>
                  {goalOptions.map(opt => (
                    <label key={opt.value} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px',
                      background: signupForm.goalType === opt.value ? 'rgba(45,90,45,0.06)' : '#FDFCFA',
                      border: `1.5px solid ${signupForm.goalType === opt.value ? '#2D5A2D' : 'rgba(134,168,134,0.35)'}`,
                      borderRadius: '10px', cursor: 'pointer', marginBottom: '8px',
                      transition: 'all 0.2s',
                    }}>
                      <input
                        type="radio" name="goalType" value={opt.value}
                        checked={signupForm.goalType === opt.value}
                        onChange={e => setSignupForm({ ...signupForm, goalType: e.target.value })}
                        style={{ accentColor: '#2D5A2D' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1B3A2A' }}>{opt.icon} {opt.label}</div>
                        <div style={{ fontSize: '12px', color: '#5A7A5A' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px', background: loading ? 'rgba(45,90,45,0.4)' : '#2D5A2D',
                  border: 'none', borderRadius: '12px', color: '#FDFCFA',
                  fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}>
                  {loading ? t('creatingAccount') : t('createFreeAccount')}
                </button>
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#5A7A5A', marginTop: '12px' }}>
                  {t('freeBetaNote')}
                </p>
              </form>
            )}

            {activeTab === 'login' && (
              <form onSubmit={handleLogin}>
                {[
                  { label: t('email'), type: 'email', key: 'email', placeholder: 'you@example.com' },
                  { label: t('password'), type: 'password', key: 'password', placeholder: 'Your password' },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#5A7A5A', marginBottom: '6px' }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={loginForm[field.key]}
                      onChange={e => setLoginForm({ ...loginForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '12px 14px',
                        background: '#FDFCFA', border: '1.5px solid rgba(134,168,134,0.35)',
                        borderRadius: '10px', color: '#1B3A2A', fontSize: '15px',
                        fontFamily: 'inherit', boxSizing: 'border-box', direction: 'ltr',
                      }}
                    />
                  </div>
                ))}
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px', background: loading ? 'rgba(45,90,45,0.4)' : '#2D5A2D',
                  border: 'none', borderRadius: '12px', color: '#FDFCFA',
                  fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', marginBottom: '14px',
                }}>
                  {loading ? t('signingIn') : t('signInButton')}
                </button>
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#5A7A5A' }}>
                  {t('noAccount')}{' '}
                  <button type="button" onClick={() => { setActiveTab('signup'); setError(''); }} style={{
                    background: 'none', border: 'none', color: '#2D5A2D',
                    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
                  }}>Join free →</button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { icon: '🤖', text: t('featureInstant') },
            { icon: '🔒', text: t('featureSecure') },
            { icon: '⚡', text: t('featureBeta') },
          ].map(b => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#5A7A5A' }}>
              <span>{b.icon}</span><span>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Language switcher at bottom */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLang(lang.code);
                localStorage.setItem('cp_language', lang.code);
                document.documentElement.dir = translations[lang.code]?.dir || 'ltr';
              }}
              style={{
                background: selectedLang === lang.code ? 'rgba(45,90,45,0.1)' : 'transparent',
                border: selectedLang === lang.code ? '1px solid rgba(45,90,45,0.3)' : '1px solid transparent',
                borderRadius: '20px', padding: '4px 12px',
                fontSize: '12px', color: selectedLang === lang.code ? '#2D5A2D' : '#888',
                cursor: 'pointer', fontWeight: selectedLang === lang.code ? '600' : '400',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              {lang.flag} {lang.native}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
