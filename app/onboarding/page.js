'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    gender: '',
    starting_weight: '',
    target_weight: '',
    height_cm: '',
    injuries: '',
  });

  const [equipment, setEquipment] = useState([]);
  const [photos, setPhotos] = useState({ front: null, back: null, side: null });
  const [photoPreviews, setPhotoPreviews] = useState({ front: null, back: null, side: null });

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
    { id: 'none', label: '🚫 No Equipment' },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      setUser(session.user);
      const meta = session.user.user_metadata;
      if (meta?.full_name) setProfile(p => ({ ...p, full_name: meta.full_name }));
    };
    getUser();
  }, [router]);

  const toggleEquipment = (id) => {
    setEquipment(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handlePhotoChange = (type, file) => {
    if (!file) return;
    setPhotos(prev => ({ ...prev, [type]: file }));
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreviews(prev => ({ ...prev, [type]: e.target.result }));
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
    if (!photos.front || !photos.back || !photos.side) {
      alert('Please upload all 3 photos before continuing.');
      return;
    }
    setGenerating(true);
    try {
      await Promise.all([
        uploadPhoto('front', photos.front),
        uploadPhoto('back', photos.back),
        uploadPhoto('side', photos.side),
      ]);

      const { data: { session } } = await supabase.auth.getSession();
      const goalType = session.user.user_metadata?.goal_type || 'weight_loss';

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const betaNumber = (count || 0) + 1;

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
        beta_number: betaNumber,
      });

      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { ...profile, user_id: user.id, gym_equipment: equipment },
          goal_type: goalType,
        }),
      });

      const data = await res.json();
      console.log('Plan response:', data);
      if (data.success) { router.push('/dashboard'); }
      else { alert('Error: ' + JSON.stringify(data)); }
    } catch (err) {
      alert('Something went wrong: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 14px', background: '#FDFCFA', border: '1.5px solid rgba(201,185,154,0.35)', borderRadius: '10px', color: '#1B2A4A', fontSize: '15px', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8899', marginBottom: '6px' };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
      {generating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,42,74,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ fontSize: '48px' }}>🤖</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#FDFCFA' }}>Claude is building your plan...</div>
          <div style={{ fontSize: '14px', color: 'rgba(253,252,250,0.6)' }}>Analyzing your profile and generating a personalized program</div>
        </div>
      )}

      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Progress */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#7A8899', marginBottom: '10px', fontWeight: '500' }}>Step {step} of 3</div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ height: '4px', width: '80px', borderRadius: '2px', background: s <= step ? '#1B2A4A' : 'rgba(201,185,154,0.4)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>

        <div style={{ background: '#FDFCFA', border: '1px solid rgba(201,185,154,0.35)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(27,42,74,0.12)', padding: '32px' }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1B2A4A', marginBottom: '6px' }}>Your Body Profile</h2>
              <p style={{ fontSize: '13px', color: '#7A8899', marginBottom: '24px' }}>Tell us about yourself so Claude can personalize your plan</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="John Champion" />
                </div>
                <div>
                  <label style={labelStyle}>Age</label>
                  <input style={inputStyle} type="number" min="16" max="70" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} placeholder="25" />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select style={inputStyle} value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Current Weight (kg)</label>
                  <input style={inputStyle} type="number" value={profile.starting_weight} onChange={e => setProfile({ ...profile, starting_weight: e.target.value })} placeholder="80" />
                </div>
                <div>
                  <label style={labelStyle}>Target Weight (kg)</label>
                  <input style={inputStyle} type="number" value={profile.target_weight} onChange={e => setProfile({ ...profile, target_weight: e.target.value })} placeholder="70" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Height (cm)</label>
                  <input style={inputStyle} type="number" value={profile.height_cm} onChange={e => setProfile({ ...profile, height_cm: e.target.value })} placeholder="175" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Injuries or Limitations</label>
                  <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} value={profile.injuries} onChange={e => setProfile({ ...profile, injuries: e.target.value })} placeholder="e.g. bad knees, lower back pain, shoulder injury — or leave blank if none" />
                </div>
              </div>
              <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: '24px', padding: '14px', background: '#1B2A4A', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Continue → Equipment
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1B2A4A', marginBottom: '6px' }}>Your Equipment</h2>
              <p style={{ fontSize: '13px', color: '#7A8899', marginBottom: '24px' }}>Select all equipment you have access to</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                {equipmentOptions.map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: equipment.includes(opt.id) ? 'rgba(27,42,74,0.06)' : '#FDFCFA', border: `1.5px solid ${equipment.includes(opt.id) ? '#1B2A4A' : 'rgba(201,185,154,0.35)'}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#1B2A4A' }}>
                    <input type="checkbox" checked={equipment.includes(opt.id)} onChange={() => toggleEquipment(opt.id)} style={{ accentColor: '#1B2A4A' }} />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1.5px solid rgba(201,185,154,0.35)', borderRadius: '12px', color: '#1B2A4A', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, padding: '14px', background: '#1B2A4A', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Continue → Photos</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1B2A4A', marginBottom: '6px' }}>Starting Photos</h2>
              <p style={{ fontSize: '13px', color: '#7A8899', marginBottom: '24px' }}>Upload front, back and side photos — all 3 required</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {[{ key: 'front', label: '📸 Front' }, { key: 'back', label: '📸 Back' }, { key: 'side', label: '📸 Side' }].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 8px', background: photoPreviews[key] ? 'transparent' : '#F5F0E8', border: `2px dashed ${photos[key] ? '#1B2A4A' : 'rgba(201,185,154,0.5)'}`, borderRadius: '12px', cursor: 'pointer', minHeight: '100px', overflow: 'hidden' }}>
                    <input type="file" accept="image/*" onChange={e => handlePhotoChange(key, e.target.files[0])} style={{ display: 'none' }} />
                    {photoPreviews[key] ? (
                      <img src={photoPreviews[key]} alt={key} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <>
                        <span style={{ fontSize: '24px' }}>📷</span>
                        <span style={{ fontSize: '12px', color: '#7A8899', fontWeight: '500' }}>{label}</span>
                      </>
                    )}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1.5px solid rgba(201,185,154,0.35)', borderRadius: '12px', color: '#1B2A4A', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                <button onClick={handleGenerate} style={{ flex: 2, padding: '14px', background: '#C9922A', border: 'none', borderRadius: '12px', color: '#FDFCFA', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>✨ Generate My Free Plan</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
