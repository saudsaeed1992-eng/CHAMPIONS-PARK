'use client'

// app/page.js
// Champions Park — Landing Page + Language Picker + Auth
// Supports: English, Arabic, Kurdish (Badini/RTL), Turkish

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '@/lib/LanguageContext'
import translations from '@/lib/translations'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ku', name: 'کوردی (بادینی)', flag: '🏳️', dir: 'rtl' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
]

const QUOTES = [
  { text: 'The body achieves what the mind believes.', lang: 'en' },
  { text: 'الجسد يحقق ما يؤمن به العقل.', lang: 'ar' },
  { text: 'جەستە ئەوچی دلێ bawerî pê tîne pêk tîne.', lang: 'ku' },
  { text: 'Vücut, zihnin inandığını başarır.', lang: 'tr' },
  { text: 'Success starts with self-discipline.', lang: 'en' },
  { text: 'النجاح يبدأ بانضباط الذات.', lang: 'ar' },
  { text: 'Serkeftin bi xwe-disîplînê dest pê dike.', lang: 'ku' },
  { text: 'Başarı öz disiplinle başlar.', lang: 'tr' },
]

export default function HomePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { language, setLanguage, t, dir, isRTL } = useLanguage()

  const [step, setStep] = useState('language') // 'language' | 'auth'
  const [tab, setTab] = useState('signup')
  const [form, setForm] = useState({ name: '', email: '', password: '', goal: 'weight_loss' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [selectedLang, setSelectedLang] = useState(language)

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Check if user already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, language')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          if (profile.language) setLanguage(profile.language)
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
    }
    checkSession()
  }, [])

  const handleLanguageConfirm = () => {
    setLanguage(selectedLang)
    setStep('auth')
  }

  const handleAuth = async () => {
    setError('')
    setLoading(true)

    try {
      if (tab === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } },
        })
        if (signUpError) throw signUpError

        if (data.user) {
          // Save language + goal to profile
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: form.name,
            email: form.email,
            goal: form.goal,
            language: selectedLang,
            created_at: new Date().toISOString(),
          })
          router.push('/onboarding')
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (signInError) throw signInError

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, language')
            .eq('id', data.user.id)
            .single()

          if (profile?.language) {
            setLanguage(profile.language)
            setSelectedLang(profile.language)
          }

          if (profile) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        }
      }
    } catch (err) {
      setError(err.message || t('errorGeneral'))
    } finally {
      setLoading(false)
    }
  }

  const currentQuote = QUOTES[quoteIndex]

  // ── LANGUAGE PICKER SCREEN ──
  if (step === 'language') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #E8F5E9 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #2D5A2D, #4a8a4a)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(45,90,45,0.3)',
          }}>
            <span style={{ fontSize: '36px' }}>🏆</span>
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: '800',
            color: '#2D5A2D', letterSpacing: '-0.5px',
          }}>Champions Park</h1>
        </div>

        {/* Card */}
        <div style={{
          background: '#FDFCFA',
          borderRadius: '20px',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          border: '1px solid rgba(45,90,45,0.1)',
        }}>
          <h2 style={{
            fontSize: '22px', fontWeight: '700',
            color: '#2D5A2D', marginBottom: '8px',
            textAlign: 'center',
          }}>
            Choose Your Language
          </h2>
          <p style={{
            fontSize: '14px', color: '#666',
            textAlign: 'center', marginBottom: '28px',
          }}>
            اختر لغتك / زمانێ خۆت / Dilinizi seçin
          </p>

          {/* Language options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: selectedLang === lang.code
                    ? '2px solid #2D5A2D'
                    : '2px solid rgba(0,0,0,0.08)',
                  background: selectedLang === lang.code
                    ? 'rgba(45,90,45,0.06)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  direction: lang.dir,
                }}
              >
                <span style={{ fontSize: '28px', lineHeight: 1 }}>{lang.flag}</span>
                <div style={{
                  flex: 1,
                  textAlign: lang.dir === 'rtl' ? 'right' : 'left',
                }}>
                  <div style={{
                    fontSize: '16px', fontWeight: '600',
                    color: selectedLang === lang.code ? '#2D5A2D' : '#1a1a1a',
                  }}>{lang.name}</div>
                </div>
                {selectedLang === lang.code && (
                  <span style={{ fontSize: '20px' }}>✅</span>
                )}
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleLanguageConfirm}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #2D5A2D, #4a8a4a)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            {translations[selectedLang]?.continue || 'Continue'} →
          </button>
        </div>
      </div>
    )
  }

  // ── AUTH SCREEN ──
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #E8F5E9 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', system-ui, sans-serif",
      direction: dir,
    }}>

      {/* Beta badge */}
      <div style={{
        background: 'rgba(45,90,45,0.1)',
        border: '1px solid rgba(45,90,45,0.3)',
        borderRadius: '20px',
        padding: '6px 16px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#2D5A2D',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{
          width: '8px', height: '8px',
          background: '#22c55e',
          borderRadius: '50%',
          display: 'inline-block',
        }}></span>
        {t('betaBadge')}
      </div>

      {/* Logo */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px',
          background: 'linear-gradient(135deg, #2D5A2D, #4a8a4a)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: '0 8px 32px rgba(45,90,45,0.3)',
        }}>
          <span style={{ fontSize: '28px' }}>🏆</span>
        </div>
        <h1 style={{
          fontSize: '26px', fontWeight: '800',
          color: '#2D5A2D', letterSpacing: '-0.5px',
        }}>Champions Park</h1>
        <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
          {t('heroSubtitle')}
        </p>
      </div>

      {/* Auth card */}
      <div style={{
        background: '#FDFCFA',
        borderRadius: '20px',
        padding: '0',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        border: '1px solid rgba(45,90,45,0.1)',
        overflow: 'hidden',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {['signup', 'signin'].map((tabName) => (
            <button
              key={tabName}
              onClick={() => { setTab(tabName); setError('') }}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                fontWeight: tab === tabName ? '700' : '500',
                color: tab === tabName ? '#2D5A2D' : '#999',
                cursor: 'pointer',
                borderBottom: tab === tabName ? '2px solid #2D5A2D' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {tabName === 'signup' ? t('createAccount') : t('signIn')}
            </button>
          ))}
        </div>

        <div style={{ padding: '28px' }}>
          {/* Error */}
          {error && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #fed7d7',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#c53030',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Full name — signup only */}
          {tab === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '11px',
                fontWeight: '700', letterSpacing: '0.8px',
                color: '#555', marginBottom: '6px',
                textTransform: 'uppercase',
              }}>{t('fullName')}</label>
              <input
                type="text"
                placeholder={t('fullNamePlaceholder')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  borderRadius: '10px', fontSize: '15px',
                  background: '#fafafa', color: '#1a1a1a',
                  outline: 'none', fontFamily: 'inherit',
                  direction: dir,
                }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px',
              fontWeight: '700', letterSpacing: '0.8px',
              color: '#555', marginBottom: '6px',
              textTransform: 'uppercase',
            }}>{t('email')}</label>
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%', padding: '12px 14px',
                border: '1.5px solid rgba(0,0,0,0.12)',
                borderRadius: '10px', fontSize: '15px',
                background: '#fafafa', color: '#1a1a1a',
                outline: 'none', fontFamily: 'inherit',
                direction: 'ltr',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px',
              fontWeight: '700', letterSpacing: '0.8px',
              color: '#555', marginBottom: '6px',
              textTransform: 'uppercase',
            }}>{t('password')}</label>
            <input
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              style={{
                width: '100%', padding: '12px 14px',
                border: '1.5px solid rgba(0,0,0,0.12)',
                borderRadius: '10px', fontSize: '15px',
                background: '#fafafa', color: '#1a1a1a',
                outline: 'none', fontFamily: 'inherit',
                direction: 'ltr',
              }}
            />
          </div>

          {/* Fitness goal — signup only */}
          {tab === 'signup' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '11px',
                fontWeight: '700', letterSpacing: '0.8px',
                color: '#555', marginBottom: '10px',
                textTransform: 'uppercase',
              }}>{t('fitnessGoal')}</label>

              {[
                { value: 'weight_loss', label: t('goalWeightLoss'), desc: t('goalWeightLossDesc') },
                { value: 'bodybuilding', label: t('goalMuscle'), desc: t('goalMuscleDesc') },
              ].map((goal) => (
                <div
                  key={goal.value}
                  onClick={() => setForm({ ...form, goal: goal.value })}
                  style={{
                    padding: '14px 16px',
                    border: form.goal === goal.value
                      ? '2px solid #2D5A2D'
                      : '2px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    background: form.goal === goal.value
                      ? 'rgba(45,90,45,0.05)'
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px',
                    borderRadius: '50%',
                    border: form.goal === goal.value
                      ? '5px solid #2D5A2D'
                      : '2px solid #ccc',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}></div>
                  <div>
                    <div style={{
                      fontSize: '15px', fontWeight: '700',
                      color: '#1a1a1a',
                    }}>{goal.label}</div>
                    <div style={{
                      fontSize: '12px', color: '#888',
                      marginTop: '2px',
                    }}>{goal.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading
                ? '#ccc'
                : 'linear-gradient(135deg, #2D5A2D, #4a8a4a)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px',
              transition: 'all 0.2s ease',
              marginBottom: '16px',
            }}
          >
            {loading
              ? (tab === 'signup' ? t('creatingAccount') : t('signingIn'))
              : (tab === 'signup' ? t('createFreeAccount') : t('signInButton'))
            }
          </button>

          {/* Free note */}
          {tab === 'signup' && (
            <p style={{
              textAlign: 'center', fontSize: '12px',
              color: '#999', marginBottom: '16px',
            }}>
              {t('freeBetaNote')}
            </p>
          )}

          {/* Switch tab */}
          <p style={{
            textAlign: 'center', fontSize: '13px', color: '#888',
          }}>
            <button
              onClick={() => { setTab(tab === 'signup' ? 'signin' : 'signup'); setError('') }}
              style={{
                background: 'none', border: 'none',
                color: '#2D5A2D', fontWeight: '600',
                cursor: 'pointer', fontSize: '13px',
                fontFamily: 'inherit',
              }}
            >
              {tab === 'signup' ? t('haveAccount') : t('noAccount')}
            </button>
          </p>
        </div>
      </div>

      {/* Rotating quote */}
      <div style={{
        marginTop: '28px',
        textAlign: 'center',
        maxWidth: '360px',
        direction: currentQuote.lang === 'ar' || currentQuote.lang === 'ku' ? 'rtl' : 'ltr',
      }}>
        <p style={{
          fontSize: '14px',
          color: '#2D5A2D',
          fontStyle: 'italic',
          fontWeight: '500',
          opacity: 0.85,
          lineHeight: '1.6',
          transition: 'opacity 0.5s ease',
        }}>
          "{currentQuote.text}"
        </p>
      </div>

      {/* Feature pills */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {[t('featureInstant'), t('featureSecure'), t('featureBeta')].map((feature, i) => (
          <span key={i} style={{
            fontSize: '12px',
            color: '#2D5A2D',
            background: 'rgba(45,90,45,0.08)',
            padding: '5px 12px',
            borderRadius: '20px',
            fontWeight: '500',
          }}>{feature}</span>
        ))}
      </div>

      {/* Language switcher at bottom */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => { setSelectedLang(lang.code); setLanguage(lang.code) }}
            style={{
              background: language === lang.code ? 'rgba(45,90,45,0.12)' : 'transparent',
              border: language === lang.code ? '1px solid rgba(45,90,45,0.3)' : '1px solid transparent',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              color: language === lang.code ? '#2D5A2D' : '#888',
              cursor: 'pointer',
              fontWeight: language === lang.code ? '600' : '400',
              transition: 'all 0.2s ease',
            }}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}
