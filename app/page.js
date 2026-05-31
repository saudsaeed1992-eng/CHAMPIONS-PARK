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
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', flexDirec
