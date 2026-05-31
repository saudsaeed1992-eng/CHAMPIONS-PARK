'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import translations from '@/lib/translations';

const YOUTUBE_VIDEOS = {
  cardio: [
    { name: 'Treadmill HIIT Workout', url: 'https://www.youtube.com/watch?v=CBp_7KaY61c' },
    { name: 'Low Impact Cardio', url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI' },
    { name: 'Fat Burning Cardio', url: 'https://www.youtube.com/watch?v=gC_L9qAHVJ8' },
  ],
  strength: [
    { name: 'Full Body Strength', url: 'https://www.youtube.com/watch?v=UBMk30rjy0o' },
    { name: 'Dumbbell Workout', url: 'https://www.youtube.com/watch?v=U9QgDcNNsDQ' },
    { name: 'Push Day Workout', url: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
  ],
};

const MEAL_VIDEOS = {
  Breakfast: 'https://www.youtube.com/watch?v=xAl2_LNFGkA',
  Lunch: 'https://www.youtube.com/watch?v=qO6IFBMxBOY',
  Dinner: 'https://www.youtube.com/watch?v=d5ES4T5Jj6s',
  Snack: 'https://www.youtube.com/watch?v=8MjBzou2P_I',
};

const QUOTES = {
  weight_loss: {
    en: [
      { quote: 'Every workout is progress. Every healthy meal is a victory.', author: 'Champions Park' },
      { quote: 'Your body achieves what your mind believes.', author: 'Champions Park' },
      { quote: 'The pain you feel today is the strength you feel tomorrow.', author: 'Champions Park' },
      { quote: 'Success is the sum of small efforts repeated every day.', author: 'Robert Collier' },
      { quote: 'Take care of your body — it is the only place you have to live.', author: 'Jim Rohn' },
    ],
    ar: [
      { quote: 'كل تمرين هو تقدم. كل وجبة صحية هي انتصار.', author: 'بارك أبطال' },
      { quote: 'جسدك يحقق ما يؤمن به عقلك.', author: 'بارك أبطال' },
      { quote: 'الألم الذي تشعر به اليوم هو القوة التي ستشعر بها غداً.', author: 'بارك أبطال' },
    ],
    ku: [
      { quote: 'هەر ورزشێک پێشکەوتنە. هەر خواردنێکی تەندروست سەرکەوتنێکە.', author: 'پارکی شامپیۆنان' },
      { quote: 'جەستەکەت ئەوەی دەبەخشێت کە دەتەوێ.', author: 'پارکی شامپیۆنان' },
      { quote: 'ئێشی ئەمڕۆ هێزی سبەیە.', author: 'پارکی شامپیۆنان' },
    ],
    tr: [
      { quote: 'Her antrenman bir ilerleme. Her sağlıklı öğün bir zafer.', author: 'Champions Park' },
      { quote: 'Vücudun, zihninin inandığını başarır.', author: 'Champions Park' },
      { quote: 'Bugün hissettiğin acı yarın hissedeceğin güç olacak.', author: 'Champions Park' },
    ],
  },
  bodybuilding: {
    en: [
      { quote: 'Iron sharpens iron. Every rep builds the champion you are becoming.', author: 'Champions Park' },
      { quote: 'Strength is built in the moments you push through when you want to stop.', author: 'Champions Park' },
      { quote: 'The last few reps are what makes the muscle grow.', author: 'Arnold Schwarzenegger' },
      { quote: 'Pain is temporary. Glory is forever.', author: 'Champions Park' },
      { quote: 'If it does not challenge you, it will not change you.', author: 'Fred DeVito' },
    ],
    ar: [
      { quote: 'الحديد يصقل الحديد. كل تكرار يبني البطل الذي تصبحه.', author: 'بارك أبطال' },
      { quote: 'القوة تُبنى في اللحظات التي تتغلب فيها على نفسك.', author: 'بارك أبطال' },
      { quote: 'الألم مؤقت. المجد إلى الأبد.', author: 'بارك أبطال' },
    ],
    ku: [
      { quote: 'ئاسن ئاسن تیژ دەکات. هەر دووبارەکردنەوەیەک شامپیۆنەکەت دروست دەکات.', author: 'پارکی شامپیۆنان' },
      { quote: 'هێز لە ئەو کاتانەدا دروست دەبێت کە دەیەوێت بوەستیت بەڵام بەردەوام دەبیت.', author: 'پارکی شامپیۆنان' },
      { quote: 'ئێش کاتێکەیە. شانازی هەمیشەیە.', author: 'پارکی شامپیۆنان' },
    ],
    tr: [
      { quote: 'Demir demiri bileler. Her tekrar şampiyon olduğunu inşa eder.', author: 'Champions Park' },
      { quote: 'Güç, durmak istediğin ama devam ettiğin anlarda inşa edilir.', author: 'Champions Park' },
      { quote: 'Acı geçici. Zafer sonsuzdur.', author: 'Champions Park' },
    ],
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [progressLogs, setProgressLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedDay, setSelectedDay] = useState(0);
  const [weekTab, setWeekTab] = useState(1);
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');
  const [progressSaved, setProgressSaved] = useState(false);
  const [waitEmail, setWaitEmail] = useState('');
  const [waitDone, setWaitDone] = useState(false);
  const [waitPosition, setWaitPosition] = useState(0);
  const [waitLoading, setWaitLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [regenSchedule, setRegenSchedule] = useState({
    workout_start: '07:00',
    workout_end: '08:00',
    plan_start_date: new Date().toISOString().split('T')[0],
    plan_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daily_routine: '',
  });

  const t = (key) => {
    const lang = translations[language] || translations['en'];
    return lang[key] || translations['en'][key] || key;
  };
  const dir = translations[language]?.dir || 'ltr';
  const isRTL = dir === 'rtl';

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      setUserId(session.user.id);

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData) { router.push('/onboarding'); return; }
      setProfile(profileData);

      // Load language
      if (profileData.language && translations[profileData.language]) {
        setLanguage(profileData.language);
        document.documentElement.dir = translations[profileData.language]?.dir || 'ltr';
        document.documentElement.lang = profileData.language;
      } else {
        const saved = localStorage.getItem('cp_language');
        if (saved && translations[saved]) {
          setLanguage(saved);
          document.documentElement.dir = translations[saved]?.dir || 'ltr';
        }
      }

      const { data: planData } = await supabase
        .from('ai_plans').select('*').eq('user_id', session.user.id)
        .order('generated_at', { ascending: false }).limit(1).single();
      if (planData) setPlan(planData.plan_content);

      const { data: photoData } = await supabase
        .from('user_photos').select('*').eq('user_id', session.user.id);
      if (photoData) setPhotos(photoData);

      const { data: logs } = await supabase
        .from('progress_logs').select('*').eq('user_id', session.user.id)
        .order('log_date', { ascending: true });
      if (logs) setProgressLogs(logs);

      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSaveProgress = async () => {
    if (!weight && !steps) return;
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch('/api/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, weight, steps, date: today }),
    });
    const data = await res.json();
    if (data.success) {
      setProgressSaved(true);
      setWeight('');
      setSteps('');
      const { data: logs } = await supabase
        .from('progress_logs').select('*').eq('user_id', userId)
        .order('log_date', { ascending: true });
      if (logs) setProgressLogs(logs);
      setTimeout(() => setProgressSaved(false), 3000);
    }
  };

  const handleWaitlist = async () => {
    if (!waitEmail.includes('@')) return;
    setWaitLoading(true);
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: waitEmail, user_id: userId }),
    });
    const data = await res.json();
    setWaitPosition(data.position);
    setWaitDone(true);
    setWaitLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '40px' }}>🏆</div>
        <div style={{ fontSize: '16px', color: '#5A7A5A', fontFamily: 'Georgia, serif' }}>Loading your dashboard...</div>
      </div>
    );
  }

  const isBuild = profile?.goal_type === 'bodybuilding';
  const accentColor = isBuild ? '#5C7A5A' : '#2D5A2D';
  const workoutDays = plan?.workout_plan?.weeks?.find(w => w.week === weekTab)?.days || [];
  const meals = plan?.meal_plan?.meals || [];
  const targets = plan?.weekly_targets || {};

  // Get quote in user's language
  const goalKey = profile?.goal_type === 'bodybuilding' ? 'bodybuilding' : 'weight_loss';
  const quoteList = QUOTES[goalKey][language] || QUOTES[goalKey]['en'];
  const todayQuote = quoteList[new Date().getDate() % quoteList.length];

  const startW = parseFloat(profile?.starting_weight) || 0;
  const targetW = parseFloat(profile?.target_weight) || 0;
  const latestLog = progressLogs[progressLogs.length - 1];
  const currentW = latestLog?.current_weight || startW;
  const weightProgress = startW && targetW && startW !== targetW
    ? Math.min(((startW - currentW) / (startW - targetW)) * 100, 100)
    : 0;
  const isVideoUnlocked = (profile?.beta_number || 999) <= 20;
  const isBeforeAfterUnlocked = (profile?.beta_number || 999) <= 5;

  const cardStyle = {
    background: '#FDFCFA',
    border: '1px solid rgba(134,168,134,0.3)',
    borderRadius: '14px',
    boxShadow: '0 4px 16px rgba(27,58,42,0.08)',
    padding: '20px',
  };

  const tagStyle = (bg, color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
    background: bg, color: color,
  });

  const lockStyle = {
    background: 'rgba(232,245,233,0.8)',
    border: '1px dashed rgba(134,168,134,0.4)',
    borderRadius: '10px', padding: '14px',
    display: 'flex', alignItems: 'center',
    gap: '10px', fontSize: '13px', color: '#5A7A5A',
  };

  const inputS = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(134,168,134,0.08)',
    border: '1.5px solid rgba(134,168,134,0.3)',
    borderRadius: '10px', color: '#1B3A2A',
    fontSize: '14px', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const proFeatures = [
    'Full 8-week AI workout plan',
    'Complete meal plan with macros',
    'YouTube tutorials for every exercise',
    'Cooking videos for every meal',
    'Before/after photo comparison',
    'Advanced analytics dashboard',
    'AI plan regeneration monthly',
    'Bodybuilder bulk/cut cycle planner',
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #E8F5E9 100%)', fontFamily: 'Georgia, system-ui, sans-serif', direction: dir }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(232,245,233,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(134,168,134,0.3)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.svg" alt="Champions Park" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', color: '#1B3A2A' }}>Champions Park</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {[
            ['plan', `🗓 ${t('tabPlan')}`],
            ['meals', `🍽 ${t('tabMeals')}`],
            ['progress', `📊 ${t('tabProgress')}`],
            ['photos', `📸 ${t('tabPhotos')}`],
          ].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: activeTab === tab ? '#2D5A2D' : 'transparent', color: activeTab === tab ? '#FDFCFA' : '#5A7A5A', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2D5A2D', color: '#FDFCFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
            {profile?.full_name?.[0] || 'U'}
          </div>
          <button onClick={handleLogout} style={{ padding: '7px 14px', background: 'transparent', border: '1.5px solid rgba(134,168,134,0.4)', borderRadius: '8px', color: '#1B3A2A', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{t('logout')}</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#1B3A2A', marginBottom: '4px' }}>{t('dashboardWelcome')}, {profile?.full_name?.split(' ')[0]} 👋</h1>
              <p style={{ fontSize: '14px', color: '#5A7A5A', fontStyle: 'italic' }}>{t('dashboardSubtitle')}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={tagStyle(isBuild ? 'rgba(92,122,90,0.12)' : 'rgba(45,90,45,0.1)', accentColor)}>
                {isBuild ? `💪 ${t('goalMuscle')}` : `🔥 ${t('goalWeightLoss')}`}
              </span>
              <span style={tagStyle('rgba(201,146,42,0.12)', '#C9922A')}>🏅 {t('betaMemberBadge')} #{profile?.beta_number || '—'}</span>
              {isVideoUnlocked && <span style={tagStyle('rgba(45,90,45,0.12)', '#2D5A2D')}>🎥 Videos Unlocked</span>}
              {isBeforeAfterUnlocked && <span style={tagStyle('rgba(201,146,42,0.15)', '#C9922A')}>⭐ VIP Member</span>}
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: '⚖️', label: t('weight'), value: `${profile?.starting_weight || '—'} kg` },
            { icon: '📉', label: t('currentWeight'), value: `${currentW} kg`, sub: currentW < startW ? `↓ ${(startW - currentW).toFixed(1)} kg ${t('weightLost')}` : '' },
            { icon: '🎯', label: t('targetWeight'), value: `${profile?.target_weight || '—'} kg` },
            { icon: '🔥', label: t('calories'), value: targets.calories_per_day ? `${targets.calories_per_day} cal` : '—' },
          ].map((stat, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '11px', color: '#5A7A5A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B3A2A', fontWeight: '600' }}>{stat.value}</div>
              {stat.sub && <div style={{ fontSize: '12px', color: '#4A7A4A', marginTop: '2px' }}>{stat.sub}</div>}
            </div>
          ))}
        </div>

        {/* INJURY CARD */}
        {profile?.injuries && (
          <div style={{ marginBottom: '20px', background: 'rgba(184,92,56,0.06)', border: '1px solid rgba(184,92,56,0.2)', borderRadius: '14px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span style={{ fontWeight: '700', color: '#B85C38', fontSize: '14px' }}>Injury Safety Reminders</span>
            </div>
            {profile.injuries.toLowerCase().includes('knee') && ['❌ Avoid deep squats and jumping', '⚠️ Stop if sharp knee pain occurs', '✅ Low-impact alternatives in your plan'].map((n, i) => <div key={i} style={{ fontSize: '13px', color: '#4A3030', marginBottom: '3px' }}>{n}</div>)}
            {profile.injuries.toLowerCase().includes('back') && ['❌ Avoid heavy deadlifts until cleared', '❌ Use planks instead of sit-ups', '⚠️ Keep spine neutral on all lifts'].map((n, i) => <div key={i} style={{ fontSize: '13px', color: '#4A3030', marginBottom: '3px' }}>{n}</div>)}
            {profile.injuries.toLowerCase().includes('shoulder') && ['❌ Avoid overhead pressing when in pain', '❌ No upright rows', '⚠️ Prioritize rotator cuff mobility'].map((n, i) => <div key={i} style={{ fontSize: '13px', color: '#4A3030', marginBottom: '3px' }}>{n}</div>)}
          </div>
        )}

        {/* TAB: PLAN */}
        {activeTab === 'plan' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B3A2A' }}>🗓 {t('yourWorkoutPlan')}</h2>
                <p style={{ fontSize: '13px', color: '#5A7A5A', fontStyle: 'italic' }}>Personalized by Claude AI for your goal</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2].map(w => (
                  <button key={w} onClick={() => { setWeekTab(w); setSelectedDay(0); }} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: weekTab === w ? '#2D5A2D' : 'rgba(134,168,134,0.25)', color: weekTab === w ? '#FDFCFA' : '#1B3A2A', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{t('week')} {w}</button>
                ))}
              </div>
            </div>

            {workoutDays.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#5A7A5A' }}>No workout days found for this week.</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                  {workoutDays.map((day, i) => (
                    <button key={i} onClick={() => setSelectedDay(i)} style={{ minWidth: '110px', padding: '14px 12px', background: selectedDay === i ? '#2D5A2D' : '#FDFCFA', border: `1.5px solid ${selectedDay === i ? '#2D5A2D' : 'rgba(134,168,134,0.35)'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'center', flexShrink: 0, transition: 'all 0.2s', fontFamily: 'inherit' }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{day.emoji || '💪'}</div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: selectedDay === i ? '#FDFCFA' : '#1B3A2A' }}>{day.day}</div>
                      <div style={{ fontSize: '11px', color: selectedDay === i ? 'rgba(253,252,250,0.7)' : '#5A7A5A', marginTop: '2px' }}>{day.duration}</div>
                    </button>
                  ))}
                </div>

                {workoutDays[selectedDay] && (
                  <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '28px' }}>{workoutDays[selectedDay].emoji}</span>
                      <div>
                        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1B3A2A', marginBottom: '4px' }}>{workoutDays[selectedDay].name}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={tagStyle('rgba(134,168,134,0.2)', '#2D5A2D')}>⏱ {workoutDays[selectedDay].duration}</span>
                          <span style={tagStyle('rgba(45,90,45,0.1)', '#2D5A2D')}>{workoutDays[selectedDay].type}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(134,168,134,0.25)', marginBottom: '16px' }} />
                    {(workoutDays[selectedDay].exercises || []).map((ex, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '12px', background: 'rgba(232,245,233,0.5)', borderRadius: '10px', marginBottom: '8px', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1B3A2A', marginBottom: '2px' }}>{ex.name}</div>
                          <div style={{ fontSize: '11px', color: '#5A7A5A' }}>📝 {ex.notes}</div>
                        </div>
                        {[[t('sets'), ex.sets], [t('reps'), ex.reps], ['Rest', ex.rest]].map(([lbl, val]) => (
                          <div key={lbl} style={{ textAlign: 'center', minWidth: '44px' }}>
                            <div style={{ fontSize: '10px', color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1B3A2A' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                    {isVideoUnlocked ? (
                      <div style={{ marginTop: '12px' }}>
                        {(YOUTUBE_VIDEOS[workoutDays[selectedDay].type] || YOUTUBE_VIDEOS.cardio).map((vid, i) => (
                          <a key={i} href={vid.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', marginBottom: '8px', background: 'rgba(45,90,45,0.08)', border: '1px solid rgba(45,90,45,0.2)', borderRadius: '10px', textDecoration: 'none', color: '#1B3A2A', fontSize: '13px', fontWeight: '500' }}>
                            <span style={{ fontSize: '18px' }}>▶️</span>
                            <span>{vid.name}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#5A7A5A' }}>YouTube →</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div style={{ ...lockStyle, marginTop: '12px' }}>
                        <span>🔒</span><span>Video Tutorial — Unlocked for first 20 beta members</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB: MEALS */}
        {activeTab === 'meals' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B3A2A', marginBottom: '8px' }}>🍽 {t('todaysMeal')}</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={tagStyle('rgba(201,146,42,0.12)', '#C9922A')}>🔥 {targets.calories_per_day || '—'} cal/day</span>
                <span style={tagStyle('rgba(45,90,45,0.1)', '#2D5A2D')}>💪 {targets.protein_grams || '—'}g protein</span>
              </div>
            </div>
            {meals.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#5A7A5A' }}>No meal plan found.</div>
            ) : (
              meals.map((meal, i) => (
                <div key={i} style={{ ...cardStyle, marginBottom: '14px', borderLeft: '4px solid #4A7A4A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{meal.meal}</div>
                      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B3A2A' }}>{meal.name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={tagStyle('rgba(134,168,134,0.2)', '#2D5A2D')}>{meal.calories} {t('calories')}</span>
                      <span style={tagStyle('rgba(45,90,45,0.1)', '#2D5A2D')}>{meal.protein}</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Ingredients</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(meal.ingredients || []).map((ing, j) => (
                        <span key={j} style={{ fontSize: '12px', background: 'rgba(232,245,233,0.8)', border: '1px solid rgba(134,168,134,0.3)', borderRadius: '6px', padding: '3px 8px', color: '#2D5A2D' }}>{ing}</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4A5A4A', lineHeight: '1.6', marginBottom: '12px' }}>{meal.instructions}</p>
                  {isVideoUnlocked ? (
                    <a href={MEAL_VIDEOS[meal.meal] || MEAL_VIDEOS.Breakfast} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(45,90,45,0.08)', border: '1px solid rgba(45,90,45,0.2)', borderRadius: '10px', textDecoration: 'none', color: '#1B3A2A', fontSize: '13px', fontWeight: '500' }}>
                      <span>🎥</span><span>Watch Cooking Video</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#5A7A5A' }}>YouTube →</span>
                    </a>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ ...lockStyle, flex: 1 }}><span>🔒</span><span>Cooking Video — First 20 members</span></div>
                      <div style={{ ...lockStyle, flex: 1 }}><span>🔒</span><span>{t('fullMealPlanLocked')}</span></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: PROGRESS */}
        {activeTab === 'progress' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B3A2A', marginBottom: '18px' }}>📊 {t('tabProgress')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B3A2A', marginBottom: '4px' }}>📝 {t('logProgress')}</h3>
                <p style={{ fontSize: '12px', color: '#5A7A5A', marginBottom: '16px', fontStyle: 'italic' }}>
                  {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                {[
                  { label: t('currentWeight'), value: weight, set: setWeight, placeholder: 'e.g. 82.5' },
                  { label: t('steps'), value: steps, set: setSteps, placeholder: 'e.g. 7500' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#5A7A5A', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</label>
                    <input type="number" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '11px 14px', background: 'rgba(232,245,233,0.5)', border: '1.5px solid rgba(134,168,134,0.35)', borderRadius: '10px', color: '#1B3A2A', fontSize: '15px', fontFamily: 'inherit', boxSizing: 'border-box', direction: 'ltr' }} />
                  </div>
                ))}
                <button onClick={handleSaveProgress} style={{ width: '100%', padding: '13px', background: progressSaved ? '#4A7A4A' : '#2D5A2D', border: 'none', borderRadius: '10px', color: '#FDFCFA', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.3s' }}>
                  {progressSaved ? `✓ ${t('progressLogged')}` : t('logButton')}
                </button>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['💧 Water intake tracker — Pro Only', '😴 Sleep hours tracker — Pro Only'].map((item, i) => (
                    <div key={i} style={lockStyle}><span>{item}</span></div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B3A2A', marginBottom: '16px' }}>📈 {t('progressHistory')}</h3>
                {progressLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#5A7A5A', fontSize: '13px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                    {t('noProgressYet')}
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', marginBottom: '8px' }}>
                      {progressLogs.slice(-7).map((log, i) => {
                        const maxW = Math.max(...progressLogs.map(l => l.current_weight || 0));
                        const minW = Math.min(...progressLogs.map(l => l.current_weight || 0));
                        const range = maxW - minW || 1;
                        const pct = log.current_weight ? ((log.current_weight - minW) / range) * 60 + 20 : 20;
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ fontSize: '9px', color: '#5A7A5A' }}>{log.current_weight || '—'}</div>
                            <div style={{ width: '100%', height: `${pct}px`, background: i === progressLogs.slice(-7).length - 1 ? '#2D5A2D' : 'rgba(45,90,45,0.35)', borderRadius: '4px 4px 0 0', transition: 'height 0.8s ease' }} />
                            <div style={{ fontSize: '9px', color: '#5A7A5A' }}>{new Date(log.log_date).toLocaleDateString('en', { month: 'numeric', day: 'numeric' })}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ height: '1px', background: 'rgba(134,168,134,0.25)', margin: '12px 0' }} />
                    <h4 style={{ fontSize: '13px', color: '#2D5A2D', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>👟 {t('steps')}</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px' }}>
                      {progressLogs.slice(-7).map((log, i) => {
                        const pct = log.daily_steps ? Math.min((log.daily_steps / 10000) * 100, 100) : 10;
                        const hitGoal = (log.daily_steps || 0) >= 8000;
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                            <div style={{ width: '100%', height: `${pct * 0.5}px`, background: hitGoal ? '#4A7A4A' : 'rgba(134,168,134,0.4)', borderRadius: '3px 3px 0 0' }} />
                            <div style={{ fontSize: '9px', color: '#5A7A5A' }}>{new Date(log.log_date).toLocaleDateString('en', { day: 'numeric' })}</div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ ...cardStyle, marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B3A2A', marginBottom: '14px' }}>🎯 {t('targetWeight')}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#5A7A5A', marginBottom: '8px' }}>
                <span>{startW} kg</span>
                <span style={{ color: '#2D5A2D', fontWeight: '600' }}>{Math.round(weightProgress)}%</span>
                <span>{targetW} kg</span>
              </div>
              <div style={{ height: '10px', background: 'rgba(134,168,134,0.25)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${weightProgress}%`, background: 'linear-gradient(90deg, #4A7A4A, #2D5A2D)', borderRadius: '5px', transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#4A7A4A' }}>
                {currentW < startW ? `↓ ${(startW - currentW).toFixed(1)} kg ${t('weightLost')} · ${(currentW - targetW).toFixed(1)} kg remaining` : t('noProgressYet')}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PHOTOS */}
        {activeTab === 'photos' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B3A2A', marginBottom: '16px' }}>📸 {t('myPhotos')}</h2>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Week 1 — Starting Point</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {['front', 'back', 'left', 'right'].map(type => {
                  const photo = photos.find(p => p.photo_type === type && p.week_number === 1);
                  return (
                    <div key={type} style={{ ...cardStyle, aspectRatio: '3/4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px', overflow: 'hidden' }}>
                      {photo ? (
                        <img src={photo.photo_url} alt={type} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <>
                          <span style={{ fontSize: '24px' }}>📷</span>
                          <span style={{ fontSize: '11px', color: '#5A7A5A', fontWeight: '600', textTransform: 'capitalize' }}>{type}</span>
                        </>
                      )}
                      <div style={{ fontSize: '10px', color: '#5A7A5A', textAlign: 'center' }}>{type} view</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isBeforeAfterUnlocked ? (
              <div style={{ ...cardStyle, background: 'rgba(45,90,45,0.06)', border: '1px solid rgba(45,90,45,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '20px' }}>⭐</span>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B3A2A' }}>Before & After Comparison — VIP Unlocked!</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {['front', 'back'].map(type => {
                    const week1 = photos.find(p => p.photo_type === type && p.week_number === 1);
                    const latest = photos.filter(p => p.photo_type === type).sort((a, b) => b.week_number - a.week_number)[0];
                    return (
                      <div key={type}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#2D5A2D', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px', textAlign: 'center' }}>{type} view</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          {[{ photo: week1, label: 'Before' }, { photo: latest, label: 'After' }].map(({ photo, label }) => (
                            <div key={label} style={{ position: 'relative' }}>
                              <div style={{ ...cardStyle, aspectRatio: '3/4', padding: '4px', overflow: 'hidden' }}>
                                {photo ? <img src={photo.photo_url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5A7A5A', fontSize: '11px' }}>No photo</div>}
                              </div>
                              <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#2D5A2D', marginTop: '4px' }}>{label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔒</div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B3A2A', marginBottom: '6px' }}>{t('beforeAfterLocked')}</h3>
                <p style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '8px' }}>Unlocked for the first 5 beta members</p>
                <span style={tagStyle('rgba(201,146,42,0.12)', '#C9922A')}>You are Beta Member #{profile?.beta_number} — {t('lockedDesc')}</span>
              </div>
            )}
          </div>
        )}

        {/* REGENERATE PLAN — LOCKED */}
        <div style={{ marginTop: '24px', ...cardStyle, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(3px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px' }}>🔒</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1B3A2A', fontWeight: '700' }}>{t('regenerateLocked')}</div>
            <div style={{ fontSize: '13px', color: '#5A7A5A', maxWidth: '280px', lineHeight: '1.6' }}>
              {t('lockedDesc')}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,146,42,0.12)', border: '1px solid rgba(201,146,42,0.3)', borderRadius: '20px', padding: '8px 20px', fontSize: '13px', fontWeight: '600', color: '#C9922A' }}>
              🚀 {t('joinWaitlist')}
            </div>
          </div>
          <div style={{ filter: 'blur(2px)', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '22px' }}>🔄</span>
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1B3A2A', margin: 0 }}>{t('regeneratePlan')}</h3>
                <p style={{ fontSize: '12px', color: '#5A7A5A', margin: 0, fontStyle: 'italic' }}>Update your schedule and generate a fresh AI plan</p>
              </div>
            </div>
            <button style={{ width: '100%', padding: '13px', background: '#2D5A2D', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '15px', fontWeight: '700', cursor: 'not-allowed', fontFamily: 'inherit', opacity: 0.5 }}>
              🔄 {t('regeneratePlan')}
            </button>
          </div>
        </div>

        {/* MOTIVATION */}
        <div style={{ ...cardStyle, marginTop: '24px', borderLeft: isRTL ? 'none' : '4px solid #4A7A4A', borderRight: isRTL ? '4px solid #4A7A4A' : 'none' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>✨ {t('motivationTitle')}</div>
          <blockquote style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontStyle: 'italic', color: '#1B3A2A', lineHeight: '1.7', margin: 0, marginBottom: '8px' }}>
            "{todayQuote.quote}"
          </blockquote>
          <div style={{ fontSize: '12px', color: '#5A7A5A' }}>— {todayQuote.author}</div>
        </div>

        {/* PRO WAITLIST */}
        <div style={{ marginTop: '24px', background: '#1B3A2A', borderRadius: '20px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(134,168,134,0.08)', pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#FDFCFA', marginBottom: '6px' }}>🚀 Champions Park Pro — Coming Soon</h2>
          <p style={{ fontSize: '14px', color: 'rgba(253,252,250,0.6)', fontStyle: 'italic', marginBottom: '20px' }}>{t('lockedDesc')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '24px' }}>
            {proFeatures.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(253,252,250,0.85)' }}>
                <span style={{ color: '#86A886' }}>✓</span> {f}
              </div>
            ))}
          </div>
          {waitDone ? (
            <div style={{ background: 'rgba(134,168,134,0.15)', border: '1px solid rgba(134,168,134,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'center', color: '#FDFCFA' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>✅</div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>{t('waitlistSuccess')} #{waitPosition}</div>
              <div style={{ fontSize: '12px', color: 'rgba(253,252,250,0.5)' }}>{waitPosition} champions already waiting</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="email" value={waitEmail} onChange={e => setWaitEmail(e.target.value)} placeholder="your@email.com" style={{ flex: 1, minWidth: '200px', padding: '13px 16px', background: 'rgba(253,252,250,0.08)', border: '1px solid rgba(253,252,250,0.15)', borderRadius: '10px', color: '#FDFCFA', fontSize: '15px', fontFamily: 'inherit', direction: 'ltr' }} />
              <button onClick={handleWaitlist} disabled={waitLoading} style={{ padding: '13px 24px', background: '#4A7A4A', border: 'none', borderRadius: '10px', color: '#FDFCFA', fontSize: '14px', fontWeight: '700', cursor: waitLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {waitLoading ? '...' : t('joinWaitlist')}
              </button>
            </div>
          )}
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}
