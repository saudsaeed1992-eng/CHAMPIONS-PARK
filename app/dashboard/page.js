'use client'

// app/dashboard/page.js
// Champions Park — Full Dashboard
// Tabs: Plan, Meals, Progress, Photos
// Fully translated EN, AR, KU, TR with RTL support

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '@/lib/LanguageContext'

const MOTIVATION_QUOTES = {
  en: [
    "Every champion was once a contender who refused to give up.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Push yourself because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Believe it. Build it.",
  ],
  ar: [
    "كل بطل كان يوماً ما مجرد شخص رفض الاستسلام.",
    "الألم الذي تشعر به اليوم سيكون القوة التي تشعر بها غداً.",
    "ادفع نفسك لأنه لا أحد سيفعل ذلك نيابةً عنك.",
    "الأشياء العظيمة لا تأتي أبداً من مناطق الراحة.",
    "احلم به. صدّق به. ابنِه.",
  ],
  ku: [
    "Her şampiyonekî carekê berxwedêrek bû ku red kir radest bibe.",
    "Êşa ku îro hîs dikî dê bibe hêza ku sibê hîs bikî.",
    "Xwe bixe ber ber, ji ber ku tu kesî din nayê kirin ji bo te.",
    "Tiştên mezin tu carî ji herêmên rehetiyê nayên.",
    "Xewnê bibîne. Bawer lê bike. Ava bike.",
  ],
  tr: [
    "Her şampiyon bir zamanlar vazgeçmeyi reddeden bir yarışmacıydı.",
    "Bugün hissettiğin acı yarın hissedeceğin güç olacak.",
    "Kendini zorla çünkü bunu senin için yapacak başka kimse yok.",
    "Büyük şeyler asla konfor bölgelerinden gelmez.",
    "Hayal et. İnan. İnşa et.",
  ],
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { t, dir, isRTL, language, setLanguage } = useLanguage()

  const [activeTab, setActiveTab] = useState('plan')
  const [profile, setProfile] = useState(null)
  const [plan, setPlan] = useState(null)
  const [progressLogs, setProgressLogs] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [progressForm, setProgressForm] = useState({ weight: '', steps: '' })
  const [loggingProgress, setLoggingProgress] = useState(false)
  const [progressMessage, setProgressMessage] = useState('')
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistMessage, setWaitlistMessage] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [betaNumber, setBetaNumber] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Rotate motivation quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => {
        const quotes = MOTIVATION_QUOTES[language] || MOTIVATION_QUOTES.en
        return (prev + 1) % quotes.length
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [language])

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const userId = session.user.id

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profileData || !profileData.onboarding_complete) {
        router.push('/onboarding')
        return
      }

      setProfile(profileData)

      // Set language from profile
      if (profileData.language) {
        setLanguage(profileData.language)
      }

      // Get beta number (position among all users)
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .lte('created_at', profileData.created_at)
      setBetaNumber(count)

      // Load AI plan
      const { data: planData } = await supabase
        .from('ai_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (planData) setPlan(planData)

      // Load progress logs
      const { data: logs } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(30)

      if (logs) setProgressLogs(logs)

      // Load photos
      const { data: photoData } = await supabase
        .from('user_photos')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })

      if (photoData) setPhotos(photoData)

      setLoading(false)
    }

    loadData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLogProgress = async () => {
    if (!progressForm.weight && !progressForm.steps) return
    setLoggingProgress(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await supabase.from('progress_logs').insert({
        user_id: session.user.id,
        weight: parseFloat(progressForm.weight) || null,
        steps: parseInt(progressForm.steps) || null,
        logged_at: new Date().toISOString(),
      })
      setProgressMessage(t('progressLogged'))
      setProgressForm({ weight: '', steps: '' })

      // Reload logs
      const { data: logs } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('logged_at', { ascending: false })
        .limit(30)
      if (logs) setProgressLogs(logs)

      setTimeout(() => setProgressMessage(''), 3000)
    } catch (err) {
      setProgressMessage(t('errorLoggingProgress'))
    } finally {
      setLoggingProgress(false)
    }
  }

  const handleJoinWaitlist = async () => {
    if (!waitlistEmail) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { error } = await supabase.from('waitlist').insert({
        email: waitlistEmail,
        user_id: session?.user?.id || null,
        joined_at: new Date().toISOString(),
      })
      if (error) throw error
      setWaitlistMessage(t('waitlistSuccess'))
      setWaitlistEmail('')
    } catch {
      setWaitlistMessage(t('waitlistError'))
    }
    setTimeout(() => setWaitlistMessage(''), 4000)
  }

  const handlePhotoUpload = async (file) => {
    if (!file) return
    setUploadingPhoto(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const ext = file.name.split('.').pop()
      const path = `${session.user.id}/progress_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('champion-photos')
        .upload(path, file, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('champion-photos')
          .getPublicUrl(path)
        await supabase.from('user_photos').insert({
          user_id: session.user.id,
          position: 'progress',
          url: urlData.publicUrl,
          uploaded_at: new Date().toISOString(),
        })
        const { data: photoData } = await supabase
          .from('user_photos')
          .select('*')
          .eq('user_id', session.user.id)
          .order('uploaded_at', { ascending: false })
        if (photoData) setPhotos(photoData)
      }
    } catch (err) {
      console.error('Photo upload error:', err)
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Parse plan content
  const parsePlan = () => {
    if (!plan?.plan_content) return null
    try {
      if (typeof plan.plan_content === 'object') return plan.plan_content
      return JSON.parse(plan.plan_content)
    } catch {
      return { raw: plan.plan_content }
    }
  }

  const isBodybuilding = profile?.goal === 'bodybuilding'
  const accentColor = isBodybuilding ? '#8b5cf6' : '#2D5A2D'
  const accentLight = isBodybuilding ? 'rgba(139,92,246,0.1)' : 'rgba(45,90,45,0.08)'

  const quotes = MOTIVATION_QUOTES[language] || MOTIVATION_QUOTES.en
  const currentQuote = quotes[quoteIndex % quotes.length]

  // Weight stats
  const firstWeight = progressLogs.length > 0
    ? progressLogs[progressLogs.length - 1]?.weight
    : profile?.weight
  const latestWeight = progressLogs.length > 0
    ? progressLogs[0]?.weight
    : profile?.weight
  const weightDiff = firstWeight && latestWeight
    ? (latestWeight - firstWeight).toFixed(1)
    : 0

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #E8F5E9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px', height: '60px',
            border: `4px solid rgba(45,90,45,0.2)`,
            borderTop: `4px solid #2D5A2D`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#2D5A2D', fontWeight: '600' }}>Loading...</p>
        </div>
      </div>
    )
  }

  const parsedPlan = parsePlan()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #dcedc8 50%, #E8F5E9 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      direction: dir,
    }}>

      {/* ── TOP NAV ── */}
      <div style={{
        background: '#FDFCFA',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>🏆</div>
            <span style={{ fontWeight: '800', fontSize: '16px', color: '#2D5A2D' }}>
              Champions Park
            </span>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Beta badge */}
            {betaNumber && (
              <div style={{
                background: 'rgba(201,146,42,0.1)',
                border: '1px solid rgba(201,146,42,0.25)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#C9922A',
              }}>
                ⭐ #{betaNumber}
              </div>
            )}

            {/* User name */}
            <span style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>
              {profile?.full_name?.split(' ')[0]}
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                padding: '7px 14px',
                background: 'transparent',
                border: '1.5px solid rgba(0,0,0,0.12)',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#666',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>

        {/* ── WELCOME BANNER ── */}
        <div style={{
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: '24px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
              {t('dashboardWelcome')}, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.85 }}>
              {t('dashboardSubtitle')}
            </p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
              }}>
                🎯 {isBodybuilding ? t('goalMuscle') : t('goalWeightLoss')}
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
              }}>
                📅 {profile?.plan_duration} {t('week')}s
              </div>
              {profile?.fitness_level && (
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>
                  💪 {profile.fitness_level}
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: '64px', opacity: 0.3 }}>
            {isBodybuilding ? '🏋️' : '🔥'}
          </div>
        </div>

        {/* ── MOTIVATION CARD ── */}
        <div style={{
          background: '#FDFCFA',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '44px', height: '44px',
            background: accentLight,
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
          }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '11px', fontWeight: '700',
              color: accentColor, letterSpacing: '0.8px',
              textTransform: 'uppercase', marginBottom: '4px',
            }}>
              {t('motivationTitle')}
            </div>
            <p style={{
              fontSize: '14px', color: '#333',
              fontStyle: 'italic', lineHeight: '1.5',
              transition: 'opacity 0.5s ease',
            }}>
              "{currentQuote}"
            </p>
          </div>
          <div style={{
            background: accentLight,
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: '700',
            color: accentColor,
            flexShrink: 0,
          }}>
            {t('motivationBadge')}
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{
          background: '#FDFCFA',
          borderRadius: '16px',
          padding: '6px',
          marginBottom: '24px',
          display: 'flex',
          gap: '4px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}>
          {[
            { id: 'plan',     label: t('tabPlan') },
            { id: 'meals',    label: t('tabMeals') },
            { id: 'progress', label: t('tabProgress') },
            { id: 'photos',   label: t('tabPhotos') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '11px 8px',
                border: 'none',
                borderRadius: '12px',
                background: activeTab === tab.id ? accentColor : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════ */}
        {/* TAB: PLAN                             */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'plan' && (
          <div>
            <div style={{
              background: '#FDFCFA',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '20px', fontWeight: '800',
                color: '#1a1a1a', marginBottom: '20px',
              }}>
                {t('yourWorkoutPlan')}
              </h2>

              {parsedPlan ? (
                <div>
                  {parsedPlan.raw ? (
                    // Raw text plan
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      fontSize: '14px',
                      lineHeight: '1.8',
                      color: '#333',
                      background: '#f9f9f7',
                      borderRadius: '12px',
                      padding: '20px',
                    }}>
                      {parsedPlan.raw}
                    </div>
                  ) : (
                    // Structured plan
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Array.isArray(parsedPlan.weeks) && parsedPlan.weeks.map((week, wi) => (
                        <div key={wi} style={{
                          border: `1px solid ${accentColor}30`,
                          borderRadius: '12px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            background: accentLight,
                            padding: '12px 16px',
                            fontWeight: '700',
                            fontSize: '14px',
                            color: accentColor,
                          }}>
                            {t('week')} {week.week || wi + 1}
                          </div>
                          {Array.isArray(week.days) && week.days.map((day, di) => (
                            <div key={di} style={{
                              padding: '16px',
                              borderTop: di > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                            }}>
                              <div style={{
                                fontWeight: '700', fontSize: '14px',
                                color: '#1a1a1a', marginBottom: '8px',
                              }}>
                                {t('day')} {day.day || di + 1}
                                {day.isRest && (
                                  <span style={{
                                    marginInlineStart: '10px',
                                    fontSize: '12px',
                                    background: '#f0f0f0',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    color: '#888',
                                    fontWeight: '500',
                                  }}>
                                    {t('restDay')}
                                  </span>
                                )}
                              </div>
                              {Array.isArray(day.exercises) && day.exercises.map((ex, ei) => (
                                <div key={ei} style={{
                                  background: '#f9f9f7',
                                  borderRadius: '8px',
                                  padding: '10px 14px',
                                  marginBottom: '6px',
                                  fontSize: '13px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '8px',
                                }}>
                                  <span style={{ fontWeight: '600', color: '#1a1a1a' }}>
                                    {ex.name}
                                  </span>
                                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                                    {ex.sets && <span>{ex.sets} {t('sets')}</span>}
                                    {ex.reps && <span>{ex.reps} {t('reps')}</span>}
                                    {ex.duration && <span>{ex.duration}</span>}
                                  </div>
                                </div>
                              ))}
                              {day.notes && (
                                <p style={{ fontSize: '12px', color: '#888', marginTop: '6px', fontStyle: 'italic' }}>
                                  {day.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* If plan has direct days array */}
                      {Array.isArray(parsedPlan.days) && parsedPlan.days.map((day, di) => (
                        <div key={di} style={{
                          border: `1px solid ${accentColor}30`,
                          borderRadius: '12px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            background: accentLight,
                            padding: '12px 16px',
                            fontWeight: '700',
                            fontSize: '14px',
                            color: accentColor,
                          }}>
                            {t('day')} {day.day || di + 1}
                            {day.isRest && ` — ${t('restDay')}`}
                          </div>
                          <div style={{ padding: '16px' }}>
                            {Array.isArray(day.exercises) && day.exercises.map((ex, ei) => (
                              <div key={ei} style={{
                                background: '#f9f9f7',
                                borderRadius: '8px',
                                padding: '10px 14px',
                                marginBottom: '6px',
                                fontSize: '13px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '8px',
                              }}>
                                <span style={{ fontWeight: '600' }}>{ex.name}</span>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                                  {ex.sets && <span>{ex.sets} {t('sets')}</span>}
                                  {ex.reps && <span>{ex.reps} {t('reps')}</span>}
                                  {ex.duration && <span>{ex.duration}</span>}
                                </div>
                              </div>
                            ))}
                            {day.notes && (
                              <p style={{ fontSize: '12px', color: '#888', marginTop: '6px', fontStyle: 'italic' }}>
                                {day.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#aaa',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
                  <p>{t('errorLoadingPlan')}</p>
                </div>
              )}
            </div>

            {/* Locked: Regenerate */}
            <div style={{
              background: '#FDFCFA',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(0,0,0,0.06)',
              opacity: 0.7,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
              <p style={{ fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                {t('regeneratePlan')}
              </p>
              <p style={{ fontSize: '13px', color: '#888' }}>
                {t('regenerateLocked')}
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: MEALS                            */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'meals' && (
          <div>
            {/* Today's meal */}
            <div style={{
              background: '#FDFCFA',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '20px', fontWeight: '800',
                color: '#1a1a1a', marginBottom: '20px',
              }}>
                {t('todaysMeal')}
              </h2>

              {parsedPlan?.meals ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'breakfast', label: t('mealBreakfast'), emoji: '🌅' },
                    { key: 'lunch',     label: t('mealLunch'),     emoji: '☀️' },
                    { key: 'dinner',    label: t('mealDinner'),    emoji: '🌙' },
                    { key: 'snack',     label: t('mealSnack'),     emoji: '🍎' },
                  ].map(({ key, label, emoji }) => {
                    const meal = parsedPlan.meals[key] || parsedPlan.meals?.today?.[key]
                    if (!meal) return null
                    return (
                      <div key={key} style={{
                        border: `1px solid ${accentColor}25`,
                        borderRadius: '12px',
                        padding: '16px',
                        background: accentLight,
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '8px',
                        }}>
                          <span style={{ fontSize: '20px' }}>{emoji}</span>
                          <span style={{
                            fontWeight: '700', fontSize: '14px',
                            color: accentColor,
                          }}>{label}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                          {typeof meal === 'string' ? meal : meal.description || meal.name || JSON.stringify(meal)}
                        </p>
                        {meal.calories && (
                          <div style={{
                            display: 'flex', gap: '16px',
                            marginTop: '10px', fontSize: '12px',
                          }}>
                            {[
                              { label: t('calories'), value: meal.calories },
                              { label: t('protein'),  value: meal.protein },
                              { label: t('carbs'),    value: meal.carbs },
                              { label: t('fat'),      value: meal.fat },
                            ].map((macro) => macro.value && (
                              <span key={macro.label} style={{
                                background: 'rgba(255,255,255,0.6)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                color: '#555',
                              }}>
                                {macro.label}: {macro.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Show raw meal from plan if structured not available
                <div style={{
                  background: accentLight,
                  borderRadius: '12px',
                  padding: '20px',
                }}>
                  <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {parsedPlan?.meal_plan || parsedPlan?.raw?.includes?.('meal')
                      ? parsedPlan.meal_plan || 'See your plan for meal details.'
                      : `🥗 ${isBodybuilding
                          ? 'High protein meal: Grilled chicken 200g, brown rice 150g, steamed broccoli, olive oil. ~600 cal, 45g protein.'
                          : 'Balanced meal: Baked salmon 150g, sweet potato 100g, mixed salad with lemon dressing. ~450 cal, 35g protein.'
                        }`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Locked: Full meal plan */}
            <div style={{
              background: '#FDFCFA',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>
                  {t('lockedTitle')}
                </h3>
                <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                  {t('fullMealPlanLocked')}
                </p>
                <p style={{ fontSize: '13px', color: '#aaa' }}>
                  {t('lockedDesc')}
                </p>
              </div>

              {/* Waitlist form */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '12px 14px',
                      border: '1.5px solid rgba(0,0,0,0.12)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: '#fafafa',
                      outline: 'none',
                      fontFamily: 'inherit',
                      direction: 'ltr',
                    }}
                  />
                  <button
                    onClick={handleJoinWaitlist}
                    style={{
                      padding: '12px 20px',
                      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t('joinWaitlist')}
                  </button>
                </div>
                {waitlistMessage && (
                  <p style={{
                    marginTop: '10px',
                    fontSize: '13px',
                    color: waitlistMessage.includes('🎉') ? '#22c55e' : '#ef4444',
                    fontWeight: '600',
                  }}>
                    {waitlistMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: PROGRESS                         */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'progress' && (
          <div>
            {/* Stats row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '20px',
            }}>
              {[
                {
                  label: isBodybuilding ? t('weightGained') : t('weightLost'),
                  value: `${Math.abs(weightDiff)} kg`,
                  emoji: weightDiff < 0 ? '📉' : '📈',
                  color: weightDiff < 0 ? '#22c55e' : '#ef4444',
                },
                {
                  label: t('currentWeight'),
                  value: `${latestWeight || profile?.weight || '--'} kg`,
                  emoji: '⚖️',
                  color: accentColor,
                },
                {
                  label: t('totalSteps'),
                  value: progressLogs.reduce((sum, l) => sum + (l.steps || 0), 0).toLocaleString(),
                  emoji: '👣',
                  color: '#3b82f6',
                },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#FDFCFA',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>{stat.emoji}</div>
                  <div style={{
                    fontSize: '22px', fontWeight: '800',
                    color: stat.color, marginBottom: '4px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', fontWeight: '600' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Log progress form */}
            <div style={{
              background: '#FDFCFA',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '18px', fontWeight: '800',
                color: '#1a1a1a', marginBottom: '20px',
              }}>
                {t('logProgress')}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block', fontSize: '11px',
                    fontWeight: '700', letterSpacing: '0.8px',
                    color: '#555', marginBottom: '6px',
                    textTransform: 'uppercase',
                  }}>{t('currentWeight')}</label>
                  <input
                    type="number"
                    placeholder="kg"
                    value={progressForm.weight}
                    onChange={(e) => setProgressForm({ ...progressForm, weight: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '1.5px solid rgba(0,0,0,0.12)',
                      borderRadius: '10px', fontSize: '15px',
                      background: '#fafafa', outline: 'none',
                      fontFamily: 'inherit', direction: 'ltr',
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block', fontSize: '11px',
                    fontWeight: '700', letterSpacing: '0.8px',
                    color: '#555', marginBottom: '6px',
                    textTransform: 'uppercase',
                  }}>{t('steps')}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={progressForm.steps}
                    onChange={(e) => setProgressForm({ ...progressForm, steps: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '1.5px solid rgba(0,0,0,0.12)',
                      borderRadius: '10px', fontSize: '15px',
                      background: '#fafafa', outline: 'none',
                      fontFamily: 'inherit', direction: 'ltr',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleLogProgress}
                disabled={loggingProgress}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loggingProgress ? '#ccc' : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: loggingProgress ? 'not-allowed' : 'pointer',
                }}
              >
                {loggingProgress ? t('logging') : t('logButton')}
              </button>

              {progressMessage && (
                <p style={{
                  marginTop: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: progressMessage.includes('✅') ? '#22c55e' : '#ef4444',
                  fontWeight: '600',
                }}>
                  {progressMessage}
                </p>
              )}
            </div>

            {/* Progress history */}
            <div style={{
              background: '#FDFCFA',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <h2 style={{
                fontSize: '18px', fontWeight: '800',
                color: '#1a1a1a', marginBottom: '20px',
              }}>
                {t('progressHistory')}
              </h2>

              {progressLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
                  <p>{t('noProgressYet')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {progressLogs.map((log, i) => (
                    <div key={log.id || i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 16px',
                      background: '#f9f9f7',
                      borderRadius: '10px',
                      fontSize: '14px',
                    }}>
                      <span style={{ color: '#888', fontSize: '13px' }}>
                        {new Date(log.logged_at).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' :
                          language === 'tr' ? 'tr-TR' : 'en-GB'
                        )}
                      </span>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        {log.weight && (
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>
                            ⚖️ {log.weight} kg
                          </span>
                        )}
                        {log.steps && (
                          <span style={{ fontWeight: '700', color: '#3b82f6' }}>
                            👣 {log.steps.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: PHOTOS                           */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'photos' && (
          <div>
            <div style={{
              background: '#FDFCFA',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              marginBottom: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a' }}>
                  {t('myPhotos')}
                </h2>

                {/* Upload button */}
                <label style={{
                  padding: '10px 18px',
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) handlePhotoUpload(e.target.files[0])
                    }}
                  />
                  {uploadingPhoto ? t('uploading') : `📷 ${t('uploadNewPhoto')}`}
                </label>
              </div>

              {photos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#aaa' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
                  <p>{t('noPhotos')}</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px',
                }}>
                  {photos.map((photo, i) => (
                    <div key={photo.id || i} style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.08)',
                      position: 'relative',
                    }}>
                      <img
                        src={photo.url}
                        alt={photo.position}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div style={{
                        padding: '8px 10px',
                        fontSize: '11px',
                        color: '#888',
                        fontWeight: '600',
                        background: '#fafafa',
                      }}>
                        {photo.position} · {new Date(photo.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Locked: before/after */}
            <div style={{
              background: '#FDFCFA',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.06)',
              textAlign: 'center',
              opacity: 0.75,
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>
                {t('lockedTitle')}
              </h3>
              <p style={{ fontSize: '14px', color: '#888' }}>
                {t('beforeAfterLocked')}
              </p>
            </div>
          </div>
        )}

        {/* ── PRO WAITLIST FOOTER ── */}
        <div style={{
          marginTop: '32px',
          background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
          border: `1px solid ${accentColor}25`,
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: accentColor, marginBottom: '6px' }}>
            🚀 {t('proWaitlist')}
          </h3>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
            {t('lockedDesc')}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              style={{
                padding: '11px 16px',
                border: '1.5px solid rgba(0,0,0,0.12)',
                borderRadius: '10px',
                fontSize: '14px',
                background: 'white',
                outline: 'none',
                fontFamily: 'inherit',
                width: '240px',
                direction: 'ltr',
              }}
            />
            <button
              onClick={handleJoinWaitlist}
              style={{
                padding: '11px 20px',
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {t('joinWaitlist')}
            </button>
          </div>
          {waitlistMessage && (
            <p style={{
              marginTop: '10px',
              fontSize: '13px',
              color: waitlistMessage.includes('🎉') ? '#22c55e' : '#ef4444',
              fontWeight: '600',
            }}>
              {waitlistMessage}
            </p>
          )}
        </div>

        {/* Bottom padding */}
        <div style={{ height: '40px' }}></div>
      </div>
    </div>
  )
}
