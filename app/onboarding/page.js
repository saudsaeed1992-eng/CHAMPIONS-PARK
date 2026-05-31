'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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
  const [gymPhoto, setGymPhoto] = useState(null);
  const [gymPhotoPreview, setGymPhotoPreview] = useState(null);

  const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
  const [photoPreviews, setPhotoPreviews] = useState({ front: null, back: null, left: null, right: null });

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
    if (id === 'none') { setEquipment(['none']); return; }
    setEquipment(prev => {
      const without = prev.filter(e => e !== 'none');
      return without.includes(id) ? without.filter(e => e !== id) : [...without, id];
    });
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

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

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
      if (data.success) { router.push('/dashboard'); }
      else { alert('Error: ' + JSON.stringify(data)); }
    } catch (err) {
      alert('Something went wrong: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#FDFCFA',
    border: '1.5px solid rgba(134,168,134,0.35)',
    borderRadius: '10px', color: '#1B3A2A',
    fontSize: '15px', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: '11px',
    fontWeight: '600', letterSpacing: '1px',
    textTransform: 'uppercase', color: '#5A7A5A',
    marginBottom: '6px',
  };

  const photoTypes = [
    { key: 'front', label: '📸 Front View' },
    { key: 'back', label: '📸 Back View' },
    { key: 'left', label: '📸 Left Side' },
    { key: 'right', label: '📸 Right Side' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #E8F5E9 100%)',
      fontFamily: 'Georgia, system-ui, sans-serif',
      padding: '24px 16px',
    }}>
      {generating && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(27,58,42,0.88)',
          zIndex: 1000, display: 'flex',
          flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '16px',
        }}>
          <div style={{ fontSize: '48px' }}>🤖</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#FDFCFA' }}>Claude is building your plan...</div>
          <div style={{ fontSize: '14px', color: 'rgba(253,252,250,0.7)' }}>Analyzing your profile and generating a personalized program</div>
          <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ height: '100%', width: '60%', background: '#86A886', borderRadius: '2px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      <div style={{ maxWidth: '580px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '32px', marginBottom: '6px' }}>🏆</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#1B3A2A', marginBottom: '4px' }}>Champions Park</h1>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '10px', fontWeight: '500' }}>
            Step {step} of 3
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                height: '5px', width: '90px', borderRadius: '3px',
                background: s <= step ? '#4A7A4A' : 'rgba(134,168,134,0.3)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        <div style={{
          background: '#FDFCFA',
          border: '1px solid rgba(134,168,134,0.3)',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(27,58,42,0.1)',
          padding: '32px',
        }}>

          {/* STEP 1 — Body Profile */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#1B3A2A', marginBottom: '6px' }}>Your Body Profile</h2>
              <p style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '24px', fontStyle: 'italic' }}>
                Tell us about yourself so Claude can personalize your plan
              </p>
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
                  <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} value={profile.injuries} onChange={e => setProfile({ ...profile, injuries: e.target.value })} placeholder="e.g. bad knees, lower back pain — or leave blank" />
                </div>
              </div>
              <button onClick={() => setStep(2)} style={{
                width: '100%', marginTop: '24px', padding: '14px',
                background: '#2D5A2D', border: 'none', borderRadius: '12px',
                color: '#FDFCFA', fontSize: '15px', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Continue → Equipment 💪
              </button>
            </div>
          )}

          {/* STEP 2 — Equipment */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#1B3A2A', marginBottom: '6px' }}>Your Equipment</h2>
              <p style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '20px', fontStyle: 'italic' }}>
                Select your equipment OR upload a photo of your gym
              </p>

              {/* Equipment checkboxes */}
              <div style={{
                fontSize: '11px', fontWeight: '600', letterSpacing: '1px',
                textTransform: 'uppercase', color: '#5A7A5A', marginBottom: '10px',
              }}>
                Option A — Select Equipment
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                {equipmentOptions.map(opt => (
                  <label key={opt.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 12px',
                    background: equipment.includes(opt.id) ? 'rgba(45,90,45,0.08)' : '#FDFCFA',
                    border: `1.5px solid ${equipment.includes(opt.id) ? '#2D5A2D' : 'rgba(134,168,134,0.35)'}`,
                    borderRadius: '10px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '500', color: '#1B3A2A',
                    transition: 'all 0.2s',
                  }}>
                    <input
                      type="checkbox"
                      checked={equipment.includes(opt.id)}
                      onChange={() => toggleEquipment(opt.id)}
                      style={{ accentColor: '#2D5A2D', width: '16px', height: '16px' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {/* Gym photo upload */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: '600', letterSpacing: '1px',
                  textTransform: 'uppercase', color: '#5A7A5A', marginBottom: '10px',
                }}>
                  Option B — Upload Gym / Equipment Photo
                </div>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '10px', padding: '20px',
                  background: gymPhotoPreview ? 'transparent' : 'rgba(134,168,134,0.08)',
                  border: `2px dashed ${gymPhoto ? '#2D5A2D' : 'rgba(134,168,134,0.4)'}`,
                  borderRadius: '12px', cursor: 'pointer', minHeight: '120px',
                  overflow: 'hidden',
                }}>
                  <input type="file" accept="image/*" onChange={e => handleGymPhotoChange(e.target.files[0])} style={{ display: 'none' }} />
                  {gymPhotoPreview ? (
                    <img src={gymPhotoPreview} alt="gym" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <>
                      <span style={{ fontSize: '32px' }}>📷</span>
                      <span style={{ fontSize: '13px', color: '#5A7A5A', textAlign: 'center' }}>
                        Click to upload a photo of your gym or equipment
                      </span>
                      <span style={{ fontSize: '11px', color: '#86A886' }}>JPG, PNG or WebP • Max 10MB</span>
                    </>
                  )}
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: '14px', background: 'transparent',
                  border: '1.5px solid rgba(134,168,134,0.4)', borderRadius: '12px',
                  color: '#1B3A2A', fontSize: '15px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>← Back</button>
                <button onClick={() => setStep(3)} style={{
                  flex: 2, padding: '14px', background: '#2D5A2D',
                  border: 'none', borderRadius: '12px', color: '#FDFCFA',
                  fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>Continue → Photos 📸</button>
              </div>
            </div>
          )}

          {/* STEP 3 — 4 Body Photos */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#1B3A2A', marginBottom: '6px' }}>Starting Photos</h2>
              <p style={{ fontSize: '13px', color: '#5A7A5A', marginBottom: '8px', fontStyle: 'italic' }}>
                Upload all 4 photos for a better personalized plan
              </p>
              <div style={{
                background: 'rgba(45,90,45,0.06)', border: '1px solid rgba(45,90,45,0.15)',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '20px',
                fontSize: '12px', color: '#2D5A2D',
              }}>
                💡 4 angles help Claude design a more accurate and balanced workout plan
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {photoTypes.map(({ key, label }) => (
                  <label key={key} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '16px 8px',
                    background: photoPreviews[key] ? 'transparent' : 'rgba(134,168,134,0.08)',
                    border: `2px dashed ${photos[key] ? '#2D5A2D' : 'rgba(134,168,134,0.4)'}`,
                    borderRadius: '12px', cursor: 'pointer',
                    minHeight: '130px', overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}>
                    <input
                      type="file" accept="image/*"
                      onChange={e => handlePhotoChange(key, e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    {photoPreviews[key] ? (
                      <>
                        <img src={photoPreviews[key]} alt={key} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
                        <span style={{ fontSize: '11px', color: '#2D5A2D', fontWeight: '600' }}>✓ {label}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '28px' }}>📷</span>
                        <span style={{ fontSize: '12px', color: '#5A7A5A', fontWeight: '600', textAlign: 'center' }}>{label}</span>
                        <span style={{ fontSize: '10px', color: '#86A886' }}>Tap to upload</span>
                      </>
                    )}
                  </label>
                ))}
              </div>

              {/* Progress indicator */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
                {photoTypes.map(({ key, label }) => (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px',
                    color: photos[key] ? '#2D5A2D' : '#86A886',
                    fontWeight: photos[key] ? '600' : '400',
                  }}>
                    <span>{photos[key] ? '✅' : '⬜'}</span>
                    <span>{key}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{
                  flex: 1, padding: '14px', background: 'transparent',
                  border: '1.5px solid rgba(134,168,134,0.4)', borderRadius: '12px',
                  color: '#1B3A2A', fontSize: '15px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>← Back</button>
                <button onClick={handleGenerate} style={{
                  flex: 2, padding: '14px',
                  background: Object.values(photos).every(Boolean) ? '#C9922A' : 'rgba(134,168,134,0.4)',
                  border: 'none', borderRadius: '12px', color: '#FDFCFA',
                  fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s',
                }}>
                  {Object.values(photos).every(Boolean) ? '✨ Generate My Free Plan' : `Upload ${4 - Object.values(photos).filter(Boolean).length} more photo(s)`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
