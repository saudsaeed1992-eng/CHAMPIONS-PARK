'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    goalType: '',
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    };
    checkSession();
  }, [router]);

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
        options: {
          data: {
            full_name: signupForm.fullName.trim(),
            goal_type: signupForm.goalType,
          },
        },
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
    if (!loginForm.email.trim() || !loginForm.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      if (loginError) { setError(loginError.message); return; }
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();
        if (profile) { router.push('/dashboard'); }
        else { router.push('/onboarding'); }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const goalOptions = [
    { value: 'weight_loss', icon: '🔥', label: 'I want to lose weight', desc: 'Fat burning, cardio focus, caloric deficit' },
    { value: 'bodybuilding', icon: '💪', label: 'I want to build muscle', desc: 'Strength training, caloric surplus, muscle gain' },
  ];

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '420px' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#1B2A4A', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>Champions Park</h1>
        <p style={{ fontSize: '16px', fontStyle: 'italic', color: '#C9922A', marginBottom: '8px' }}>Where Champions Are Built.</p>
        <p style={{ fontSize: '13px', color: '#7A8899', lineHeight: '1.6', marginBottom: '16px' }}>Free AI fitness plans for weight loss and bodybuilding — powered by Claude AI</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F5E8CC', border: '1px solid rgba(201,146,42,0.3)', borderRadius: '20px', padding: '6px 18px', fontSize: '13px', fontWeight: '600', color: '#C9922A' }}>
          🎯 Free Beta — 300 spots only
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '420px', background: '#FDFCFA', border: '1px solid rgba(201,185,154,0.35)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(27,42,74,0.12)', overflow: 'hidden' }}>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,185,154,0.35)' }}>
          {[{ id: 'signup', label: 'Create Account' }, { id: 'login', label: 'Sign In' }].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(''); }} style={{ flex: 1, padding: '15px', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #1B2A4A' : '2px solid transparent', color: activeTab === tab.id ? '#1B2A4A' : '#7A8899', fontSize: '14px', fontWeight: activeTab === tab.id ? '600' : '400', cursor: 'pointer', fontFamily: 'inherit' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '28px' }}>
          {error && (
            <div style={{ background: 'rgba(184,92,56,0.07)', border: '1px solid rgba(184,92,56,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#B85C38', fontSize: '13px', marginBottom: '18px' }}>
              ⚠️ {error}
            </div>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignup}>
              {[
                { label: 'Full Name', type: 'text', key: 'fullName', placeholder: 'John Champion' },
                { label: 'Email', type: 'email', key: 'email', placeholder: 'you@example.com' },
                { label: 'Password', type: 'password', key: 'password', placeholder: 'Min. 6 characters' },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8899', marginBottom: '6px' }}>{field.label}</label>
                  <input type={field.type} value={signupForm[field.key]} onChange={(e) => setSignupForm({ ...signupForm, [field.key]: e.target.value })} placeholder={field.placeholder} style={{ width: '100%', padding: '12px 14px', background: '#FDFCFA', border: '1.5px solid rgba(201,185,154,0.35)', borderRadius: '10px', color: '#1B2A4A', fontSize: '15px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              ))}

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8899', marginBottom: '10px' }}>Your Fitness Goal</label>
                {goalOptions.map((opt) => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: signupForm.goalType === opt.value ? 'rgba(27,42,74,0.04)' : '#FDFCFA', border: `1.5px solid ${signupForm.goalType === opt.value ? '#1B2A4A' : 'rgba(201,185,154,0.35)'}`, borderRadius: '10px', cursor: 'pointer', marginBottom: '8px' }}>
                    <input type="radio" name="goalType" value={opt.value} checked={signupForm.goalType === opt.value} onChange={(e) => setSignupForm({ ...signupForm, goalType: e.target.value })} style={{ accentColor: '#1B2A4A' }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1B2A4A' }}>{opt.icon} {opt.label}</div>
                      <div style={{ fontSize: '12px', color: '#7A8899' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? 'rgba(27,42,74,0.4)' : '#1B2A4A', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Creating account...' : 'Create Free Account 🚀'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#7A8899', marginTop: '12px' }}>Free forever during beta. No credit card required.</p>
            </form>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              {[
                { label: 'Email', type: 'email', key: 'email', placeholder: 'you@example.com' },
                { label: 'Password', type: 'password', key: 'password', placeholder: 'Your password' },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8899', marginBottom: '6px' }}>{field.label}</label>
                  <input type={field.type} value={loginForm[field.key]} onChange={(e) => setLoginForm({ ...loginForm, [field.key]: e.target.value })} placeholder={field.placeholder} style={{ width: '100%', padding: '12px 14px', background: '#FDFCFA', border: '1.5px solid rgba(201,185,154,0.35)', borderRadius: '10px', color: '#1B2A4A', fontSize: '15px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              ))}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? 'rgba(27,42,74,0.4)' : '#1B2A4A', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: '14px' }}>
                {loading ? 'Signing in...' : 'Sign In to Your Account 🏆'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#7A8899' }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => { setActiveTab('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: '#1B2A4A', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>Join free →</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
