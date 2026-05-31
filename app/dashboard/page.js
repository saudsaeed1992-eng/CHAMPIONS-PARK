'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [photos, setPhotos] = useState([]);
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

  const quotes = {
    weight_loss: [
      { quote: 'Every workout is progress. Every healthy meal is a victory. Small wins compound into transformation.', author: 'Champions Park' },
      { quote: 'Your body achieves what your mind believes. Believe in the process.', author: 'Champions Park' },
      { quote: 'The pain you feel today is the strength you feel tomorrow.', author: 'Champions Park' },
      { quote: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
      { quote: 'Take care of your body. It is the only place you have to live.', author: 'Jim Rohn' },
    ],
    bodybuilding: [
      { quote: 'Iron sharpens iron. Every rep is building the champion you are becoming.', author: 'Champions Park' },
      { quote: 'Strength is built in the moments you push through when you want to stop.', author: 'Champions Park' },
      { quote: 'The last three or four reps is what makes the muscle grow.', author: 'Arnold Schwarzenegger' },
      { quote: 'Pain is temporary. Glory is forever.', author: 'Champions Park' },
      { quote: 'If it does not challenge you, it will not change you.', author: 'Fred DeVito' },
    ],
  };

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData) { router.push('/onboarding'); return; }
      setProfile(profileData);

      const { data: planData } = await supabase
        .from('ai_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (planData) setPlan(planData.plan_content);

      const { data: photoData } = await supabase
        .from('user_photos')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('week_number', 1);

      if (photoData) setPhotos(photoData);
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSaveProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch('/api/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: session.user.id, weight, steps }),
    });
    setProgressSaved(true);
    setTimeout(() => setProgressSaved(false), 3000);
  };

  const handleWaitlist = async () => {
    if (!waitEmail.includes('@')) return;
    setWaitLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: waitEmail, user_id: session?.user?.id }),
    });
    const data = await res.json();
    setWaitPosition(data.position);
    setWaitDone(true);
    setWaitLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '40px' }}>🏆</div>
        <div style={{ fontSize: '16px', color: '#7A8899' }}>Loading your dashboard...</div>
      </div>
    );
  }

  const isBuild = profile?.goal_type === 'bodybuilding';
  const accent = isBuild ? '#5C7A5A' : '#3b82f6';
  const workoutDays = plan?.workout_plan?.weeks?.find(w => w.week === weekTab)?.days || [];
  const meals = plan?.meal_plan?.meals || [];
  const targets = plan?.weekly_targets || {};
  const quoteList = quotes[profile?.goal_type] || quotes.weight_loss;
  const todayQuote = quoteList[new Date().getDate() % quoteList.length];
  const weightProgress = profile?.starting_weight && profile?.target_weight
    ? ((profile.starting_weight - (profile.starting_weight - 2)) / (profile.starting_weight - profile.target_weight)) * 100
    : 20;

  const s = { fontFamily: 'system-ui, sans-serif' };
  const cardStyle = { background: '#FDFCFA', border: '1px solid rgba(201,185,154,0.35)', borderRadius: '14px', boxShadow: '0 4px 16px rgba(27,42,74,0.08)', padding: '20px' };
  const tagStyle = (bg, color) => ({ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: bg, color: color });
  const lockStyle = { background: 'rgba(245,240,232,0.95)', border: '1px dashed rgba(201,185,154,0.5)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#7A8899' };

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
    <div style={{ minHeight: '100vh', background: '#F5F0E8', ...s }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(245,240,232,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,185,154,0.35)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🏆</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', color: '#1B2A4A' }}>Champions Park</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {[['plan', '🗓 Plan'], ['meals', '🍽 Meals'], ['progress', '📊 Progress'], ['photos', '📸 Photos']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: activeTab === tab ? '#1B2A4A' : 'transparent', color: activeTab === tab ? '#FDFCFA' : '#7A8899', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1B2A4A', color: '#FDFCFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
            {profile?.full_name?.[0] || 'U'}
          </div>
          <button onClick={handleLogout} style={{ padding: '7px 14px', background: 'transparent', border: '1.5px solid rgba(201,185,154,0.35)', borderRadius: '8px', color: '#1B2A4A', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#1B2A4A', marginBottom: '4px' }}>
                Welcome back, {profile?.full_name?.split(' ')[0]} 👋
              </h1>
              <p style={{ fontSize: '14px', color: '#7A8899', fontStyle: 'italic' }}>Here's your personalized plan for today</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={tagStyle(isBuild ? 'rgba(92,122,90,0.1)' : 'rgba(59,130,246,0.08)', accent)}>
                {isBuild ? '💪 Muscle Builder' : '🔥 Fat Loss Mode'}
              </span>
              <span style={tagStyle('#F5E8CC', '#C9922A')}>
                🏅 Beta Member #{profile?.beta_number || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: '⚖️', label: 'Starting Weight', value: `${profile?.starting_weight || '—'} kg` },
            { icon: '🎯', label: 'Target Weight', value: `${profile?.target_weight || '—'} kg` },
            { icon: '🔥', label: 'Daily Calories', value: targets.calories_per_day ? `${targets.calories_per_day} cal` : '—' },
            { icon: '💪', label: 'Daily Protein', value: targets.protein_grams ? `${targets.protein_grams}g` : '—' },
          ].map((stat, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '11px', color: '#7A8899', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B2A4A', fontWeight: '600' }}>{stat.value}</div>
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
            {profile.injuries.toLowerCase().includes('knee') && ['❌ Avoid deep squats and jumping', '⚠️ Stop if sharp knee pain occurs', '✅ Use step-ups instead of lunges'].map((n, i) => <div key={i} style={{ fontSize: '13px', color: '#4A5568', marginBottom: '3px' }}>{n}</div>)}
            {profile.injuries.toLowerCase().includes('back') && ['❌ Avoid heavy deadlifts until cleared', '❌ Use planks instead of sit-ups', '⚠️ Keep spine neutral on all lifts'].map((n, i) => <div key={i} style={{ fontSize: '13px', color: '#4A5568', marginBottom: '3px' }}>{n}</div>)}
            {profile.injuries.toLowerCase().includes('shoulder') && ['❌ Avoid overhead pressing when in pain', '❌ No upright rows', '⚠️ Prioritize rotator cuff mobility'].map((n, i) => <div key={i} style={{ fontSize: '13px', color: '#4A5568', marginBottom: '3px' }}>{n}</div>)}
          </div>
        )}

        {/* TAB: PLAN */}
        {activeTab === 'plan' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B2A4A' }}>🗓 Your 2-Week Starter Plan</h2>
                <p style={{ fontSize: '13px', color: '#7A8899', fontStyle: 'italic' }}>Personalized by Claude AI for your goal</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2].map(w => (
                  <button key={w} onClick={() => { setWeekTab(w); setSelectedDay(0); }} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: weekTab === w ? '#1B2A4A' : 'rgba(201,185,154,0.3)', color: weekTab === w ? '#FDFCFA' : '#1B2A4A', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Week {w}
                  </button>
                ))}
              </div>
            </div>

            {workoutDays.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#7A8899' }}>No workout days found for this week.</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                  {workoutDays.map((day, i) => (
                    <button key={i} onClick={() => setSelectedDay(i)} style={{ minWidth: '110px', padding: '14px 12px', background: selectedDay === i ? '#1B2A4A' : '#FDFCFA', border: `1.5px solid ${selectedDay === i ? '#1B2A4A' : 'rgba(201,185,154,0.35)'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{day.emoji || '💪'}</div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: selectedDay === i ? '#FDFCFA' : '#1B2A4A' }}>{day.day}</div>
                      <div style={{ fontSize: '11px', color: selectedDay === i ? 'rgba(253,252,250,0.7)' : '#7A8899', marginTop: '2px' }}>{day.duration}</div>
                    </button>
                  ))}
                </div>

                {workoutDays[selectedDay] && (
                  <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '28px' }}>{workoutDays[selectedDay].emoji}</span>
                      <div>
                        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1B2A4A', marginBottom: '4px' }}>{workoutDays[selectedDay].name}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={tagStyle('rgba(201,185,154,0.3)', '#1B2A4A')}>⏱ {workoutDays[selectedDay].duration}</span>
                          <span style={tagStyle(workoutDays[selectedDay].type === 'cardio' ? 'rgba(59,130,246,0.1)' : 'rgba(92,122,90,0.1)', workoutDays[selectedDay].type === 'cardio' ? '#3b82f6' : '#5C7A5A')}>{workoutDays[selectedDay].type}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(201,185,154,0.3)', marginBottom: '16px' }} />
                    {(workoutDays[selectedDay].exercises || []).map((ex, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '12px', background: '#F5F0E8', borderRadius: '10px', marginBottom: '8px', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1B2A4A', marginBottom: '2px' }}>{ex.name}</div>
                          <div style={{ fontSize: '11px', color: '#7A8899' }}>📝 {ex.notes}</div>
                        </div>
                        {[['Sets', ex.sets], ['Reps', ex.reps], ['Rest', ex.rest]].map(([lbl, val]) => (
                          <div key={lbl} style={{ textAlign: 'center', minWidth: '44px' }}>
                            <div style={{ fontSize: '10px', color: '#7A8899', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1B2A4A' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div style={{ ...lockStyle, marginTop: '12px' }}>
                      <span>🔒</span><span>▶ Video Tutorial — Pro Only</span>
                    </div>
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
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B2A4A', marginBottom: '8px' }}>🍽 Today's Meal Suggestions</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={tagStyle('#F5E8CC', '#C9922A')}>🔥 {targets.calories_per_day || '—'} cal/day</span>
                <span style={tagStyle('rgba(92,122,90,0.1)', '#5C7A5A')}>💪 {targets.protein_grams || '—'}g protein</span>
              </div>
            </div>
            {meals.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#7A8899' }}>No meal plan found.</div>
            ) : (
              meals.map((meal, i) => (
                <div key={i} style={{ ...cardStyle, marginBottom: '14px', borderLeft: '4px solid #C9922A', paddingLeft: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#7A8899', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{meal.meal}</div>
                      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B2A4A' }}>{meal.name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={tagStyle('rgba(201,185,154,0.3)', '#1B2A4A')}>{meal.calories} cal</span>
                      <span style={tagStyle('rgba(92,122,90,0.1)', '#5C7A5A')}>{meal.protein}</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#7A8899', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Ingredients</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(meal.ingredients || []).map((ing, j) => (
                        <span key={j} style={{ fontSize: '12px', background: '#F5F0E8', border: '1px solid rgba(201,185,154,0.35)', borderRadius: '6px', padding: '3px 8px', color: '#4A5568' }}>{ing}</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.6', marginBottom: '12px' }}>{meal.instructions}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ ...lockStyle, flex: 1 }}><span>🔒</span><span>Cooking Video — Pro Only</span></div>
                    <div style={{ ...lockStyle, flex: 1 }}><span>🔒</span><span>Full Macros — Pro Only</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: PROGRESS */}
        {activeTab === 'progress' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B2A4A', marginBottom: '18px' }}>📊 Today's Progress</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B2A4A', marginBottom: '16px' }}>📝 Log Today</h3>
                {[
                  { label: 'Weight (kg)', value: weight, set: setWeight, placeholder: 'e.g. 82.5', type: 'number' },
                  { label: 'Daily Steps', value: steps, set: setSteps, placeholder: 'e.g. 7500', type: 'number' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#7A8899', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</label>
                    <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '11px 14px', background: '#F5F0E8', border: '1.5px solid rgba(201,185,154,0.35)', borderRadius: '10px', color: '#1B2A4A', fontSize: '15px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button onClick={handleSaveProgress} style={{ width: '100%', padding: '13px', background: progressSaved ? '#5C7A5A' : '#1B2A4A', border: 'none', borderRadius: '10px', color: '#FDFCFA', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {progressSaved ? '✓ Progress Saved!' : 'Save Today\'s Progress'}
                </button>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['🔒 Water intake tracker — Pro Only', '🔒 Sleep hours tracker — Pro Only'].map((item, i) => (
                    <div key={i} style={lockStyle}><span>{item}</span></div>
                  ))}
                </div>
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1B2A4A', marginBottom: '16px' }}>🎯 Weight Progress</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7A8899', marginBottom: '8px' }}>
                  <span>{profile?.starting_weight} kg start</span>
                  <span style={{ color: '#1B2A4A', fontWeight: '600' }}>{Math.round(weightProgress)}% done</span>
                  <span>{profile?.target_weight} kg goal</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(201,185,154,0.3)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ height: '100%', width: `${weightProgress}%`, background: '#1B2A4A', borderRadius: '4px', transition: 'width 1s ease' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7A8899', marginBottom: '8px' }}>
                    <span>Daily Steps</span>
                    <span style={{ color: '#1B2A4A', fontWeight: '600' }}>Target: {targets.daily_steps || 8000}</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(201,185,154,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '65%', background: '#5C7A5A', borderRadius: '4px' }} />
                  </div>
                </div>
                {plan?.safety_notes && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#7A8899', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Safety Notes</div>
                    {plan.safety_notes.map((note, i) => (
                      <div key={i} style={{ fontSize: '13px', color: '#4A5568', marginBottom: '4px' }}>• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PHOTOS */}
        {activeTab === 'photos' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1B2A4A', marginBottom: '16px' }}>📸 Your Starting Photos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {['front', 'back', 'side'].map(type => {
                const photo = photos.find(p => p.photo_type === type);
                return (
                  <div key={type} style={{ ...cardStyle, aspectRatio: '3/4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', overflow: 'hidden' }}>
                    {photo ? (
                      <img src={photo.photo_url} alt={type} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <>
                        <span style={{ fontSize: '32px' }}>📷</span>
                        <span style={{ fontSize: '12px', color: '#7A8899', fontWeight: '600', textTransform: 'capitalize' }}>{type}</span>
                      </>
                    )}
                    <div style={{ fontSize: '11px', color: '#7A8899' }}>Week 1 — Starting Point</div>
                  </div>
                );
              })}
            </div>
            <div style={{ ...lockStyle, justifyContent: 'center', flexDirection: 'column', padding: '24px', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🔒</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568' }}>Before/After Comparison Gallery — Pro Only</span>
              <span style={{ fontSize: '12px', color: '#7A8899' }}>Join the waitlist below to unlock</span>
            </div>
          </div>
        )}

        {/* MOTIVATION */}
        <div style={{ ...cardStyle, marginTop: '24px', borderLeft: '4px solid #C9922A' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#7A8899', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>✨ Today's Motivation</div>
          <blockquote style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontStyle: 'italic', color: '#1B2A4A', lineHeight: '1.7', margin: 0, marginBottom: '8px' }}>
            "{todayQuote.quote}"
          </blockquote>
          <div style={{ fontSize: '12px', color: '#7A8899' }}>— {todayQuote.author}</div>
        </div>

        {/* PRO WAITLIST */}
        <div style={{ marginTop: '24px', background: '#1B2A4A', borderRadius: '20px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#FDFCFA', marginBottom: '6px' }}>🚀 Champions Park Pro — Coming Soon</h2>
          <p style={{ fontSize: '14px', color: 'rgba(253,252,250,0.6)', fontStyle: 'italic', marginBottom: '20px' }}>Join the waitlist. Be first. Get 50% off.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '24px' }}>
            {proFeatures.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(253,252,250,0.85)' }}>
                <span style={{ color: '#C9922A' }}>✓</span> {f}
              </div>
            ))}
          </div>
          {waitDone ? (
            <div style={{ background: 'rgba(92,122,90,0.2)', border: '1px solid rgba(92,122,90,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'center', color: '#FDFCFA' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>✅</div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>You're #{waitPosition} on the waitlist!</div>
              <div style={{ fontSize: '12px', color: 'rgba(253,252,250,0.5)' }}>{waitPosition} champions already waiting</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="email" value={waitEmail} onChange={e => setWaitEmail(e.target.value)} placeholder="your@email.com" style={{ flex: 1, minWidth: '200px', padding: '13px 16px', background: 'rgba(253,252,250,0.08)', border: '1px solid rgba(253,252,250,0.15)', borderRadius: '10px', color: '#FDFCFA', fontSize: '15px', fontFamily: 'inherit' }} />
              <button onClick={handleWaitlist} disabled={waitLoading} style={{ padding: '13px 24px', background: '#C9922A', border: 'none', borderRadius: '10px', color: '#FDFCFA', fontSize: '14px', fontWeight: '700', cursor: waitLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {waitLoading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>
          )}
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}
