'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

const QUOTES = [
  { text: 'Every champion was once a contender that refused to give up.', author: 'Rocky Balboa', lang: 'en' },
  { text: 'The body achieves what the mind believes.', author: 'Champions Park', lang: 'en' },
  { text: 'Push yourself because no one else is going to do it for you.', author: 'Champions Park', lang: 'en' },
  { text: 'كل بطل كان يوماً مبتدئاً. ابدأ رحلتك اليوم.', author: 'بارك أبطال', lang: 'ar' },
  { text: 'جسدك يحقق ما يؤمن به عقلك. آمن بنفسك.', author: 'بارك أبطال', lang: 'ar' },
  { text: 'النجاح ليس نهائياً، والفشل ليس قاتلاً. الشجاعة هي ما يهم.', author: 'بارك أبطال', lang: 'ar' },
  { text: 'هەر شامپیۆنێک روژێک سەرەتایەکی بوو. ئەمڕۆ دەستپێبکە.', author: 'پارکی شامپیۆنان', lang: 'ku' },
  { text: 'جەستەکەت ئەوەی دەبەخشێت کە دەتەوێ. باوەڕت پێ بێت.', author: 'پارکی شامپیۆنان', lang: 'ku' },
  { text: 'هێزت لە ئەو کاتانەدا دروست دەبێت کە دەیەوێت بوەستیت بەڵام بەردەوام دەبیت.', author: 'پارکی شامپیۆنان', lang: 'ku' },
];

export default function HomePage() {
  const router = useRouter();
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

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!signupForm.fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!signupForm.email.trim()) { setError('Please enter your email.'); return; }
    if (signupForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!signupForm.goalType) { setError('Please select your fitness goal.'); return; }
    setLoading(true);
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: signupForm.email.trim(),
        password: signupForm.password,
        options: { data: { full_name: signupForm.fullName.trim(), goal_type: signupForm.goalType } },
      });
      if (signupError) { setError(signupError.message); return; }
      if (data.user) { router.push('/onboarding'); }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginForm.email.trim() || !loginForm.password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(), password: loginForm.password,
      });
      if (loginError) { setError(loginError.message); return; }
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).single();
        router.push(profile ? '/dashboard' : '/onboarding');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuote = QUOTES[quoteIndex];
  const isRTL = currentQuote.lang === 'ar' || currentQuote.lang === 'ku';

  const goalOptions = [
    { value: 'weight_loss', icon: '🔥', label: 'I want to lose weight', desc: 'Fat burning, cardio focus, caloric deficit' },
    { value: 'bodybuilding', icon: '💪', label: 'I want to build muscle', desc: 'Strength training, caloric surplus, muscle gain' },
  ];

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #E8F5E9 100%)',
      fontFamily: 'Georgia, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
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
          direction: isRTL ? 'rtl' : 'ltr',
        }}>
          <p style={{
            fontSize: '14px',
            color: 'rgba(253,252,250,0.95)',
            fontStyle: 'italic',
            margin: 0,
            fontFamily: isRTL ? 'system-ui, sans-serif' : 'Georgia, serif',
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
        {/* Language dots */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '6px', marginTop: '8px',
        }}>
          {QUOTES.map((_, i) => (
            <div key={i} style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: i === quoteIndex ? '#86A886' : 'rgba(134,168,134,0.3)',
              transition: 'background 0.3s',
              cursor: 'pointer',
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
           Personalized fitness plans for weight loss and bodybuilding — built for champions
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(45,90,45,0.1)', border: '1px solid rgba(45,90,45,0.25)',
            borderRadius: '20px', padding: '6px 18px',
            fontSize: '13px', fontWeight: '600', color: '#2D5A2D',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4A7A4A', display: 'inline-block' }} />
            🎯 Free Beta — 300 spots only
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
            {[{ id: 'signup', label: 'Create Account' }, { id: 'login', label: 'Sign In' }].map(tab => (
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
                  { label: 'Full Name', type: 'text', key: 'fullName', placeholder: 'John Champion' },
                  { label: 'Email', type: 'email', key: 'email', placeholder: 'you@example.com' },
                  { label: 'Password', type: 'password', key: 'password', placeholder: 'Min. 6 characters' },
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
                      }}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#5A7A5A', marginBottom: '10px' }}>
                    Your Fitness Goal
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
                  {loading ? 'Creating account...' : 'Create Free Account 🚀'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#5A7A5A', marginTop: '12px' }}>
                  Free forever during beta. No credit card required.
                </p>
              </form>
            )}

            {activeTab === 'login' && (
              <form onSubmit={handleLogin}>
                {[
                  { label: 'Email', type: 'email', key: 'email', placeholder: 'you@example.com' },
                  { label: 'Password', type: 'password', key: 'password', placeholder: 'Your password' },
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
                        fontFamily: 'inherit', boxSizing: 'border-box',
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
                  {loading ? 'Signing in...' : 'Sign In to Your Account 🏆'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#5A7A5A' }}>
                  Don't have an account?{' '}
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
          [{ icon: '⚡', text: 'Instant Plan Generation' }, { icon: '🔒', text: 'Secure & Private' }].map(b => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#5A7A5A' }}>
              <span>{b.icon}</span><span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
