'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import translations from '@/lib/translations';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    const lang = translations[language] || translations['en'];
    return lang[key] || translations['en'][key] || key;
  };
  const dir = translations[language]?.dir || 'ltr';

  const [profile, setProfile] = useState({
    full_name: '', age: '', gender: '',
    starting_weight: '', target_weight: '', height_cm: '', injuries: '',
  });

  const [equipment, setEquipment] = useState([]);
  const [gymPhoto, setGymPhoto] = useState(null);
  const [gymPhotoPreview, setGymPhotoPreview] = useState(null);
  const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
  const [photoPreviews, setPhotoPreviews] = useState({ front: null, back: null, left: null, right: null });

  const [schedule, setSchedule] = useState({
    workout_start: '07:00',
    workout_end: '08:00',
    plan_start_date: new Date().toISOString().split('T')[0],
    plan_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    wake_time: '06:00',
    sleep_time: '23:00',
    work_start: '09:00',
    work_end: '17:00',
    meals_per_day: '3',
    rest_days: [],
    daily_routine: '',
    notes: '',
  });

  const equipmentOptions = [
    { id: 'treadmill', label: '🏃 Treadmill' },
    { id: 'bike', label: '🚴 Stationary Bike' },
    { id: 'cable', label: '🔗 Cable Machine' },
    { id: 'dumbbells', label: '🏋️ Dumbbells' },
    { id: 'bench', label: '🪑 Bench Press' },
    { id: 'pullup', label: '🔄 Pull-up Bar' },
    { id: 'legpress', label: '🦵 Leg Press' },
    { id: 'bands', label: '〰️ Resistance Bands' },
    { id: 'elliptical', label: '🌀 Elliptical' },
    { id: 'barbell', label: '🏋️ Barbell + Plates' },
    { id: 'mat', label: '🧘 Yoga Mat' },
    { id: 'kettlebell', label: '🏋️ Kettlebells' },
    { id: 'rower', label: '🚣 Rowing Machine' },
    { id: 'smith', label: '🏗️ Smith Machine' },
    { id: 'none', label: '🚫 No Equipment' },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      setUser(session.user);
      const meta = session.user.user_metadata;
      if (meta?.full_name) setProfile(p => ({ ...p, full_name: meta.full_name }));

      // Load saved language
      const { data: profileData } = await supabase
        .from('profiles')
        .select('language')
        .eq('id', session.user.id)
        .single();
      if (profileData?.language) {
        setLanguage(profileData.language);
        document.documentElement.dir = translations[profileData.language]?.dir || 'ltr';
      } else {
        const saved = localStorage.getItem('cp_language');
        if (saved && translations[saved]) {
          setLanguage(saved);
          document.documentElement.dir = translations[saved]?.dir || 'ltr';
        }
      }
    };
    getUser();
  }, [router]);

  const toggleEquipment = (id) => {
    if (id === 'none') { setEquipment(['none']); return; }
    setEquipment(prev => {
      const without = prev.filter(e => e !== 'none');
      return without.includes(id) ? without.filter(e => e !== id) : [...without, id];
    });
  };

  const toggleRestDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      rest_days: prev.rest_days.includes(day)
        ? prev.rest_days.filter(d => d !== day)
        : [...prev.rest_days, day],
    }));
  };

  const handlePhotoChange = (type, file) => {
    if (!file) return;
    setPhotos(prev => ({ ...prev, [type]: file }));
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreviews(prev => ({ ...prev, [type]: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleGymPhotoChange = (file) => {
    if (!file) return;
    setGymPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setGymPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (type, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('user_id', user.id);
    formData.append('photo_type', type);
    formData.append('week_number', '1');
    const res = await fetch('/api/upload-photo', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  };

  const handleGenerate = async () => {
    if (!photos.front || !photos.back || !photos.left || !photos.right) {
      alert('Please upload all 4 photos before continuing.');
      return;
    }
    setGenerating(true);
    try {
      await Promise.all([
        uploadPhoto('front', photos.front),
        uploadPhoto('back', photos.back),
        uploadPhoto('left', photos.left),
        uploadPhoto('right', photos.right),
        gymPhoto ? uploadPhoto('gym', gymPhoto) : Promise.resolve(),
      ]);

      const { data: { session } } = await supabase.auth.getSession();
      const goalType = session.user.user_metadata?.goal_type || 'weight_loss';
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.full_name,
        age: parseInt(profile.age),
        gender: profile.gender,
        goal_type: goalType,
        starting_weight: parseFloat(profile.starting_weight),
        target_weight: parseFloat(profile.target_weight),
        height_cm: parseInt(profile.height_cm),
        injuries: profile.injuries,
        gym_equipment: equipment,
        beta_number: (count || 0) + 1,
        language: language,
      });

      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profile,
            user_id: user.id,
            gym_equipment: equipment,
            schedule: schedule,
          },
          goal_type: goalType,
        }),
      });

      const data = await res.json();
      if (data.success) { router.push('/dashboard'); }
      else { alert('Error: ' + JSON.stringify(data)); }
    } catch (err) {
      alert('Something went wrong: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: '#FDFCFA',
    border: '1.5px solid rgba(134,168,134,0.35)',
    borderRadius: '10px', color: '#1B3A2A',
    fontSize: '14px', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: '11px',
    fontWeight: '600', letterSpacing: '1px',
    textTransform: 'uppercase', color: '#5A7A5A',
    marginBottom: '5px',
  };

  const sectionStyle = {
    background: 'rgba(232,245,233,0.5)',
    border: '1px solid rgba(134,168,134,0.25)',
    borderRadius: '12px', padding: '16px',
    marginBottom: '16px',
  };

  const photoTypes = [
    { key: 'front', label: '📸 Front View' },
    { key: 'back', label: '📸 Back View' },
    { key: 'left', label: '📸 Left Side' },
    { key: 'right', label: '📸 Right Side' },
  ];

  const totalPhotos = Object.values(photos).filter(Boolean).length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #E8F5E9 100%)',
      fontFamily: 'Georgia, system-ui, sans-serif',
      padding: '24px 16px',
      direction: dir,
    }}>
      {generating && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(27,58,42,0.9)',
          zIndex: 1000, display: 'flex',
          flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '16px',
        }}>
          <div style={{ fontSize: '52px' }}>🤖</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#FDFCFA', fontFamily: 'Georgia, serif' }}>
            {t('finishing')}
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(253,252,250,0.7)', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
            Analyzing your profile, schedule and daily routine to create your perfect personalized program
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#86A886',
              }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: '580px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo.svg" alt="Champions Park" style={{ width: '52px', height: '52px', marginBottom: '4px' }} />
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1B3A2A', margin: 0 }}>Champions Park</h1>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '8px', fontWeight: '500' }}>
            {t('step')} {step} {t('of')} 4
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                height: '5px', width: '70px', borderRadius: '3px',
                background: s <= step ? '#2D5A2D' : 'rgba(134,168,134,0.3)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            {[
              { n: 1, label: 'Profile' },
              { n: 2, label: 'Equipment' },
              { n: 3, label: 'Photos' },
              { n: 4, label: 'Schedule' },
            ].map(({ n, label }) => (
              <div key={n} style={{
                fontSize: '10px', fontWeight: '600',
                color: step === n ? '#2D5A2D' : '#86A886',
                width: '70px', textAlign: 'center',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>{label}</div>
            ))}
          </div>
        </div>

        <div style={{
          background: '#FDFCFA',
          border: '1px solid rgba(134,168,134,0.3)',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(27,58,42,0.1)',
          padding: '28px',
        }}>

          {/* ── STEP 1: BODY PROFILE ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', color: '#1B3A2A', marginBottom: '4px' }}>{t('stepProfileTitle')}</h2>
              <p style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '20px', fontStyle: 'italic' }}>
                {t('stepProfileSubtitle')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>{t('fullName')}</label>
                  <input style={inputStyle} value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="John Champion" />
                </div>
                <div>
                  <label style={labelStyle}>{t('age')}</label>
                  <input style={{ ...inputStyle, direction: 'ltr' }} type="number" min="16" max="70" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} placeholder="25" />
                </div>
                <div>
                  <label style={labelStyle}>{t('gender')}</label>
                  <select style={inputStyle} value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="Male">{t('genderMale')}</option>
                    <option value="Female">{t('genderFemale')}</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('weight')}</label>
                  <input style={{ ...inputStyle, direction: 'ltr' }} type="number" value={profile.starting_weight} onChange={e => setProfile({ ...profile, starting_weight: e.target.value })} placeholder="80" />
                </div>
                <div>
                  <label style={labelStyle}>{t('targetWeight')}</label>
                  <input style={{ ...inputStyle, direction: 'ltr' }} type="number" value={profile.target_weight} onChange={e => setProfile({ ...profile, target_weight: e.target.value })} placeholder="70" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>{t('height')}</label>
                  <input style={{ ...inputStyle, direction: 'ltr' }} type="number" value={profile.height_cm} onChange={e => setProfile({ ...profile, height_cm: e.target.value })} placeholder="175" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>{t('injuries')}</label>
                  <textarea style={{ ...inputStyle, height: '70px', resize: 'vertical' }} value={profile.injuries} onChange={e => setProfile({ ...profile, injuries: e.target.value })} placeholder={t('injuriesPlaceholder')} />
                </div>
              </div>
              <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: '20px', padding: '13px', background: '#2D5A2D', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Continue → Equipment 💪
              </button>
            </div>
          )}

          {/* ── STEP 2: EQUIPMENT ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', color: '#1B3A2A', marginBottom: '4px' }}>{t('stepEquipmentTitle')}</h2>
              <p style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '16px', fontStyle: 'italic' }}>{t('stepEquipmentSubtitle')}</p>

              <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#5A7A5A', marginBottom: '8px' }}>Option A — Select Equipment</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '16px' }}>
                {equipmentOptions.map(opt => (
                  <label key={opt.id} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 12px',
                    background: equipment.includes(opt.id) ? 'rgba(45,90,45,0.08)' : '#FDFCFA',
                    border: `1.5px solid ${equipment.includes(opt.id) ? '#2D5A2D' : 'rgba(134,168,134,0.35)'}`,
                    borderRadius: '10px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '500', color: '#1B3A2A',
                    transition: 'all 0.2s',
                  }}>
                    <input type="checkbox" checked={equipment.includes(opt.id)} onChange={() => toggleEquipment(opt.id)} style={{ accentColor: '#2D5A2D', width: '15px', height: '15px' }} />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#5A7A5A', marginBottom: '8px' }}>Option B — Upload Gym Photo</div>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '18px',
                background: gymPhotoPreview ? 'transparent' : 'rgba(134,168,134,0.06)',
                border: `2px dashed ${gymPhoto ? '#2D5A2D' : 'rgba(134,168,134,0.4)'}`,
                borderRadius: '12px', cursor: 'pointer', minHeight: '100px', overflow: 'hidden',
                marginBottom: '20px',
              }}>
                <input type="file" accept="image/*" onChange={e => handleGymPhotoChange(e.target.files[0])} style={{ display: 'none' }} />
                {gymPhotoPreview ? (
                  <img src={gymPhotoPreview} alt="gym" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <>
                    <span style={{ fontSize: '28px' }}>📷</span>
                    <span style={{ fontSize: '13px', color: '#5A7A5A', textAlign: 'center' }}>Click to upload gym or equipment photo</span>
                  </>
                )}
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1.5px solid rgba(134,168,134,0.4)', borderRadius: '12px', color: '#1B3A2A', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>← {t('back')}</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, padding: '13px', background: '#2D5A2D', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Continue → Photos 📸</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: 4 BODY PHOTOS ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', color: '#1B3A2A', marginBottom: '4px' }}>{t('stepPhotosTitle')}</h2>
              <p style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '8px', fontStyle: 'italic' }}>{t('stepPhotosSubtitle')}</p>
              <div style={{ background: 'rgba(45,90,45,0.06)', border: '1px solid rgba(45,90,45,0.15)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#2D5A2D' }}>
                💡 4 angles help Claude design a more accurate and balanced workout plan
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {photoTypes.map(({ key, label }) => (
                  <label key={key} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', padding: '14px 8px',
                    background: photoPreviews[key] ? 'transparent' : 'rgba(134,168,134,0.06)',
                    border: `2px dashed ${photos[key] ? '#2D5A2D' : 'rgba(134,168,134,0.4)'}`,
                    borderRadius: '12px', cursor: 'pointer', minHeight: '120px', overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}>
                    <input type="file" accept="image/*" onChange={e => handlePhotoChange(key, e.target.files[0])} style={{ display: 'none' }} />
                    {photoPreviews[key] ? (
                      <>
                        <img src={photoPreviews[key]} alt={key} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                        <span style={{ fontSize: '11px', color: '#2D5A2D', fontWeight: '600' }}>✓ {label}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '26px' }}>📷</span>
                        <span style={{ fontSize: '12px', color: '#5A7A5A', fontWeight: '600', textAlign: 'center' }}>{label}</span>
                        <span style={{ fontSize: '10px', color: '#86A886' }}>Tap to upload</span>
                      </>
                    )}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                {photoTypes.map(({ key }) => (
                  <div key={key} style={{ fontSize: '11px', color: photos[key] ? '#2D5A2D' : '#86A886', fontWeight: photos[key] ? '600' : '400' }}>
                    {photos[key] ? '✅' : '⬜'} {key}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1.5px solid rgba(134,168,134,0.4)', borderRadius: '12px', color: '#1B3A2A', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>← {t('back')}</button>
                <button onClick={() => setStep(4)} disabled={totalPhotos < 4} style={{ flex: 2, padding: '13px', background: totalPhotos === 4 ? '#2D5A2D' : 'rgba(134,168,134,0.3)', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '14px', fontWeight: '700', cursor: totalPhotos === 4 ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.3s' }}>
                  {totalPhotos === 4 ? 'Continue → Schedule ⏰' : `Upload ${4 - totalPhotos} more photo(s)`}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: SCHEDULE & ROUTINE ── */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '20px', color: '#1B3A2A', marginBottom: '4px' }}>{t('stepScheduleTitle')}</h2>
              <p style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '20px', fontStyle: 'italic' }}>
                {t('stepScheduleSubtitle')}
              </p>

              {/* Workout Hours */}
              <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>⏰</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1B3A2A' }}>Daily Workout Window</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Workout Start Time</label>
                    <input type="time" style={{ ...inputStyle, direction: 'ltr' }} value={schedule.workout_start} onChange={e => setSchedule({ ...schedule, workout_start: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Workout End Time</label>
                    <input type="time" style={{ ...inputStyle, direction: 'ltr' }} value={schedule.workout_end} onChange={e => setSchedule({ ...schedule, workout_end: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Plan Duration */}
              <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>📅</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1B3A2A' }}>Plan Duration</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" style={{ ...inputStyle, direction: 'ltr' }} value={schedule.plan_start_date} onChange={e => setSchedule({ ...schedule, plan_start_date: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" style={{ ...inputStyle, direction: 'ltr' }} value={schedule.plan_end_date} onChange={e => setSchedule({ ...schedule, plan_end_date: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#5A7A5A', fontStyle: 'italic' }}>
                  {schedule.plan_start_date && schedule.plan_end_date
                    ? `📆 ${Math.ceil((new Date(schedule.plan_end_date) - new Date(schedule.plan_start_date)) / (1000 * 60 * 60 * 24))} days total`
                    : 'Select start and end dates'}
                </div>
              </div>

              {/* Daily Routine */}
              <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🌅</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1B3A2A' }}>Daily Routine</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>{t('wakeTime')}</label>
                    <input type="time" style={{ ...inputStyle, direction: 'ltr' }} value={schedule.wake_time} onChange={e => setSchedule({ ...schedule, wake_time: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('sleepTime')}</label>
                    <input type="time" style={{ ...inputStyle, direction: 'ltr' }} value={schedule.sleep_time} onChange={e => setSchedule({ ...schedule, sleep_time: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Work / School Start</label>
                    <input type="time" style={{ ...inputStyle, direction: 'ltr' }} value={schedule.work_start} onChange={e => setSchedule({ ...schedule, work_start: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Work / School End</label>
                    <input type="time" style={{ ...inputStyle, direction: 'ltr' }} value={schedule.work_end} onChange={e => setSchedule({ ...schedule, work_end: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Meals Per Day</label>
                  <select style={inputStyle} value={schedule.meals_per_day} onChange={e => setSchedule({ ...schedule, meals_per_day: e.target.value })}>
                    <option value="2">2 meals</option>
                    <option value="3">3 meals</option>
                    <option value="4">4 meals</option>
                    <option value="5">5 meals</option>
                    <option value="6">6 meals (bodybuilder)</option>
                  </select>
                </div>
              </div>

              {/* Rest Days */}
              <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>😴</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1B3A2A' }}>Preferred Rest Days</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {daysOfWeek.map(day => (
                    <button key={day} type="button" onClick={() => toggleRestDay(day)} style={{
                      padding: '6px 14px', borderRadius: '20px', border: 'none',
                      background: schedule.rest_days.includes(day) ? '#2D5A2D' : 'rgba(134,168,134,0.2)',
                      color: schedule.rest_days.includes(day) ? '#FDFCFA' : '#2D5A2D',
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                    }}>
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>📝</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1B3A2A' }}>General Daily Routine & Notes</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Describe Your Daily Routine</label>
                  <textarea
                    style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
                    value={schedule.daily_routine}
                    onChange={e => setSchedule({ ...schedule, daily_routine: e.target.value })}
                    placeholder="e.g. I wake at 6am, drop kids at school at 8am, work 9-5, usually tired by 8pm..."
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('additionalNotes')}</label>
                  <textarea
                    style={{ ...inputStyle, height: '70px', resize: 'vertical' }}
                    value={schedule.notes}
                    onChange={e => setSchedule({ ...schedule, notes: e.target.value })}
                    placeholder={t('additionalNotesPlaceholder')}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1.5px solid rgba(134,168,134,0.4)', borderRadius: '12px', color: '#1B3A2A', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>← {t('back')}</button>
                <button onClick={handleGenerate} style={{ flex: 2, padding: '13px', background: '#C9922A', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(201,146,42,0.3)' }}>
                  ✨ {t('finishSetup')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
