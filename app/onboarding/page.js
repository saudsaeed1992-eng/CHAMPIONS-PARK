'use client'

// app/onboarding/page.js
// Champions Park — Full Onboarding Wizard
// 4 Steps: Profile, Equipment, Photos, Schedule
// Fully translated in EN, AR, KU, TR with RTL support

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '@/lib/LanguageContext'

const EQUIPMENT_KEYS = [
  'equipmentDumbbells',
  'equipmentBarbell',
  'equipmentResistanceBands',
  'equipmentPullUpBar',
  'equipmentKettlebell',
  'equipmentTreadmill',
  'equipmentCableMachine',
  'equipmentNoEquipment',
]

const DAY_KEYS = [
  { key: 'monday',    value: 'monday' },
  { key: 'tuesday',   value: 'tuesday' },
  { key: 'wednesday', value: 'wednesday' },
  { key: 'thursday',  value: 'thursday' },
  { key: 'friday',    value: 'friday' },
  { key: 'saturday',  value: 'saturday' },
  { key: 'sunday',    value: 'sunday' },
]

const DURATION_KEYS = [
  { key: 'duration30', value: '30' },
  { key: 'duration45', value: '45' },
  { key: 'duration60', value: '60' },
  { key: 'duration90', value: '90' },
]

const PLAN_DURATION_KEYS = [
  { key: 'planDuration2',  value: '2' },
  { key: 'planDuration4',  value: '4' },
  { key: 'planDuration8',  value: '8' },
  { key: 'planDuration12', value: '12' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { t, dir, isRTL, language } = useLanguage()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const [goal, setGoal] = useState('weight_loss')
  const [uploadingPhoto, setUploadingPhoto] = useState({})
  const [uploadedPhotos, setUploadedPhotos] = useState({})

  // Form data
  const [profile, setProfile] = useState({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    targetWeight: '',
    fitnessLevel: 'beginner',
    country: '',
  })

  const [equipment, setEquipment] = useState({
    gymAccess: false,
    selectedEquipment: [],
    injuries: '',
    dietaryRestrictions: '',
  })

  const [schedule, setSchedule] = useState({
    workoutDays: [],
    sessionDuration: '45',
    planDuration: '4',
    wakeTime: '07:00',
    sleepTime: '23:00',
    additionalNotes: '',
  })

  // Get current user + goal on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUserId(session.user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('goal, language')
        .eq('id', session.user.id)
        .single()

      if (profileData?.goal) setGoal(profileData.goal)
    }
    getUser()
  }, [])

  const toggleEquipment = (item) => {
    setEquipment((prev) => ({
      ...prev,
      selectedEquipment: prev.selectedEquipment.includes(item)
        ? prev.selectedEquipment.filter((e) => e !== item)
        : [...prev.selectedEquipment, item],
    }))
  }

  const toggleDay = (day) => {
    setSchedule((prev) => ({
      ...prev,
      workoutDays: prev.workoutDays.includes(day)
        ? prev.workoutDays.filter((d) => d !== day)
        : [...prev.workoutDays, day],
    }))
  }

  const handlePhotoUpload = async (file, position) => {
    if (!file || !userId) return
    setUploadingPhoto((prev) => ({ ...prev, [position]: true }))
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${position}_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('champion-photos')
        .upload(path, file, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('champion-photos')
          .getPublicUrl(path)

        await supabase.from('user_photos').upsert({
          user_id: userId,
          position,
          url: urlData.publicUrl,
          uploaded_at: new Date().toISOString(),
        })
        setUploadedPhotos((prev) => ({ ...prev, [position]: urlData.publicUrl }))
      }
    } catch (err) {
      console.error('Photo upload error:', err)
    } finally {
      setUploadingPhoto((prev) => ({ ...prev, [position]: false }))
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      // Save full profile
      await supabase.from('profiles').upsert({
        id: userId,
        age: parseInt(profile.age),
        gender: profile.gender,
        height: parseFloat(profile.height),
        weight: parseFloat(profile.weight),
        target_weight: parseFloat(profile.targetWeight),
        fitness_level: profile.fitnessLevel,
        country: profile.country,
        gym_access: equipment.gymAccess,
        equipment: equipment.selectedEquipment,
        injuries: equipment.injuries,
        dietary_restrictions: equipment.dietaryRestrictions,
        workout_days: schedule.workoutDays,
        session_duration: parseInt(schedule.sessionDuration),
        plan_duration: parseInt(schedule.planDuration),
        wake_time: schedule.wakeTime,
        sleep_time: schedule.sleepTime,
        additional_notes: schedule.additionalNotes,
        language: language,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })

      // Generate AI plan
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          goal,
          profile,
          equipment,
          schedule,
          language,
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Onboarding finish error:', err)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ── STYLES ──
  const cardStyle = {
    background: '#FDFCFA',
    borderRadius: '20px',
    padding: '32px',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
    border: '1px solid rgba(45,90,45,0.1)',
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid rgba(0,0,0,0.12)',
    borderRadius: '10px',
    fontSize: '15px',
    background: '#fafafa',
    color: '#1a1a1a',
    outline: 'none',
    fontFamily: 'inherit',
    direction: dir,
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.8px',
    color: '#555',
    marginBottom: '6px',
    textTransform: 'uppercase',
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  }

  const accentColor = goal === 'bodybuilding' ? '#8b5cf6' : '#2D5A2D'

  // Progress bar
  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #E8F5E9 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '24px',
      paddingTop: '40px',
      fontFamily: "'Inter', system-ui, sans-serif",
      direction: dir,
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px', width: '100%', maxWidth: '560px' }}>
        <div style={{
          width: '52px', height: '52px',
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <span style={{ fontSize: '24px' }}>🏆</span>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#2D5A2D' }}>
          {t('onboardingTitle')}
        </h1>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
          {t('onboardingSubtitle')}
        </p>

        {/* Step indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '16px',
          fontSize: '13px',
          color: '#888',
        }}>
          <span style={{ fontWeight: '600', color: accentColor }}>
            {t('step')} {currentStep}
          </span>
          <span>{t('of')} {totalSteps}</span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(0,0,0,0.08)',
          borderRadius: '3px',
          marginTop: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
            borderRadius: '3px',
            transition: 'width 0.4s ease',
          }}></div>
        </div>
      </div>

      {/* ── STEP 1: PROFILE ── */}
      {currentStep === 1 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
            {t('stepProfileTitle')}
          </h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
            {t('stepProfileSubtitle')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Age */}
            <div>
              <label style={labelStyle}>{t('age')}</label>
              <input
                type="number"
                placeholder={t('agePlaceholder')}
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Gender */}
            <div>
              <label style={labelStyle}>{t('gender')}</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                style={selectStyle}
              >
                <option value="male">{t('genderMale')}</option>
                <option value="female">{t('genderFemale')}</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label style={labelStyle}>{t('height')}</label>
              <input
                type="number"
                placeholder={t('heightPlaceholder')}
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Weight */}
            <div>
              <label style={labelStyle}>{t('weight')}</label>
              <input
                type="number"
                placeholder={t('weightPlaceholder')}
                value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Target weight */}
            <div>
              <label style={labelStyle}>{t('targetWeight')}</label>
              <input
                type="number"
                placeholder={t('targetWeightPlaceholder')}
                value={profile.targetWeight}
                onChange={(e) => setProfile({ ...profile, targetWeight: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Fitness level */}
            <div>
              <label style={labelStyle}>{t('fitnessLevel')}</label>
              <select
                value={profile.fitnessLevel}
                onChange={(e) => setProfile({ ...profile, fitnessLevel: e.target.value })}
                style={selectStyle}
              >
                <option value="beginner">{t('fitnessLevelBeginner')}</option>
                <option value="intermediate">{t('fitnessLevelIntermediate')}</option>
                <option value="advanced">{t('fitnessLevelAdvanced')}</option>
              </select>
            </div>
          </div>

          {/* Country */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>{t('country')}</label>
            <input
              type="text"
              placeholder={t('countryPlaceholder')}
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* ── STEP 2: EQUIPMENT ── */}
      {currentStep === 2 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
            {t('stepEquipmentTitle')}
          </h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
            {t('stepEquipmentSubtitle')}
          </p>

          {/* Gym access */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('gymAccess')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { value: true,  label: t('gymAccessYes') },
                { value: false, label: t('gymAccessNo') },
              ].map((opt) => (
                <div
                  key={String(opt.value)}
                  onClick={() => setEquipment({ ...equipment, gymAccess: opt.value })}
                  style={{
                    padding: '12px 16px',
                    border: equipment.gymAccess === opt.value
                      ? `2px solid ${accentColor}`
                      : '2px solid rgba(0,0,0,0.08)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: equipment.gymAccess === opt.value
                      ? `${accentColor}0d`
                      : 'transparent',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div style={{
                    width: '16px', height: '16px',
                    borderRadius: '50%',
                    border: equipment.gymAccess === opt.value
                      ? `5px solid ${accentColor}`
                      : '2px solid #ccc',
                    flexShrink: 0,
                  }}></div>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          {/* Equipment checkboxes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('availableEquipment')}</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}>
              {EQUIPMENT_KEYS.map((key) => {
                const val = key.replace('equipment', '').toLowerCase()
                const selected = equipment.selectedEquipment.includes(val)
                return (
                  <div
                    key={key}
                    onClick={() => toggleEquipment(val)}
                    style={{
                      padding: '10px 12px',
                      border: selected
                        ? `2px solid ${accentColor}`
                        : '2px solid rgba(0,0,0,0.08)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: selected ? `${accentColor}0d` : 'transparent',
                      fontSize: '13px',
                      fontWeight: selected ? '600' : '400',
                      color: selected ? accentColor : '#555',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{
                      width: '16px', height: '16px',
                      borderRadius: '4px',
                      border: selected ? `2px solid ${accentColor}` : '2px solid #ccc',
                      background: selected ? accentColor : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '10px',
                      color: 'white',
                    }}>
                      {selected ? '✓' : ''}
                    </span>
                    {t(key)}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Injuries */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('injuries')}</label>
            <textarea
              placeholder={t('injuriesPlaceholder')}
              value={equipment.injuries}
              onChange={(e) => setEquipment({ ...equipment, injuries: e.target.value })}
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: '1.5',
              }}
            />
          </div>

          {/* Dietary */}
          <div>
            <label style={labelStyle}>{t('dietaryRestrictions')}</label>
            <textarea
              placeholder={t('dietaryPlaceholder')}
              value={equipment.dietaryRestrictions}
              onChange={(e) => setEquipment({ ...equipment, dietaryRestrictions: e.target.value })}
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: '1.5',
              }}
            />
          </div>
        </div>
      )}

      {/* ── STEP 3: PHOTOS ── */}
      {currentStep === 3 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
            {t('stepPhotosTitle')}
          </h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
            {t('stepPhotosSubtitle')}
          </p>

          {/* Privacy note */}
          <div style={{
            background: 'rgba(45,90,45,0.06)',
            border: '1px solid rgba(45,90,45,0.15)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#2D5A2D',
            marginBottom: '20px',
          }}>
            {t('photoPrivacy')}
          </div>

          {/* Photo uploads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { position: 'front', label: t('photoFront'), emoji: '👤' },
              { position: 'back',  label: t('photoBack'),  emoji: '🔄' },
              { position: 'side',  label: t('photoSide'),  emoji: '↔️' },
            ].map(({ position, label, emoji }) => (
              <div key={position}>
                <label style={labelStyle}>{label}</label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '24px',
                  border: uploadedPhotos[position]
                    ? `2px solid ${accentColor}`
                    : '2px dashed rgba(0,0,0,0.15)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: uploadedPhotos[position]
                    ? `${accentColor}08`
                    : '#fafafa',
                  transition: 'all 0.2s ease',
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) handlePhotoUpload(e.target.files[0], position)
                    }}
                  />
                  {uploadingPhoto[position] ? (
                    <span style={{ fontSize: '13px', color: '#888' }}>{t('uploading')}</span>
                  ) : uploadedPhotos[position] ? (
                    <>
                      <img
                        src={uploadedPhotos[position]}
                        alt={label}
                        style={{
                          width: '80px', height: '80px',
                          objectFit: 'cover', borderRadius: '8px',
                        }}
                      />
                      <span style={{ fontSize: '13px', color: accentColor, fontWeight: '600' }}>
                        {t('uploaded')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '28px' }}>{emoji}</span>
                      <span style={{ fontSize: '13px', color: '#888' }}>{t('photoUploadPrompt')}</span>
                    </>
                  )}
                </label>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '12px', color: '#aaa',
            textAlign: 'center', marginTop: '16px',
          }}>
            {t('photoOptional')}
          </p>

          {/* Beta note */}
          <div style={{
            background: 'rgba(201,146,42,0.08)',
            border: '1px solid rgba(201,146,42,0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#C9922A',
            marginTop: '12px',
          }}>
            {t('photoBetaNote')}
          </div>
        </div>
      )}

      {/* ── STEP 4: SCHEDULE ── */}
      {currentStep === 4 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
            {t('stepScheduleTitle')}
          </h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
            {t('stepScheduleSubtitle')}
          </p>

          {/* Workout days */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('workoutDays')}</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
            }}>
              {DAY_KEYS.map(({ key, value }) => {
                const selected = schedule.workoutDays.includes(value)
                return (
                  <button
                    key={value}
                    onClick={() => toggleDay(value)}
                    style={{
                      padding: '10px 4px',
                      border: selected
                        ? `2px solid ${accentColor}`
                        : '2px solid rgba(0,0,0,0.08)',
                      borderRadius: '10px',
                      background: selected ? accentColor : 'transparent',
                      color: selected ? 'white' : '#555',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {t(key)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Session duration */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('sessionDuration')}</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
            }}>
              {DURATION_KEYS.map(({ key, value }) => {
                const selected = schedule.sessionDuration === value
                return (
                  <button
                    key={value}
                    onClick={() => setSchedule({ ...schedule, sessionDuration: value })}
                    style={{
                      padding: '10px 6px',
                      border: selected
                        ? `2px solid ${accentColor}`
                        : '2px solid rgba(0,0,0,0.08)',
                      borderRadius: '10px',
                      background: selected ? accentColor : 'transparent',
                      color: selected ? 'white' : '#555',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {t(key)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Plan duration */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('planDuration')}</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}>
              {PLAN_DURATION_KEYS.map(({ key, value }) => {
                const selected = schedule.planDuration === value
                return (
                  <button
                    key={value}
                    onClick={() => setSchedule({ ...schedule, planDuration: value })}
                    style={{
                      padding: '12px 8px',
                      border: selected
                        ? `2px solid ${accentColor}`
                        : '2px solid rgba(0,0,0,0.08)',
                      borderRadius: '10px',
                      background: selected ? accentColor : 'transparent',
                      color: selected ? 'white' : '#555',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {t(key)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Wake + sleep time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>{t('wakeTime')}</label>
              <input
                type="time"
                value={schedule.wakeTime}
                onChange={(e) => setSchedule({ ...schedule, wakeTime: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('sleepTime')}</label>
              <input
                type="time"
                value={schedule.sleepTime}
                onChange={(e) => setSchedule({ ...schedule, sleepTime: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Additional notes */}
          <div>
            <label style={labelStyle}>{t('additionalNotes')}</label>
            <textarea
              placeholder={t('additionalNotesPlaceholder')}
              value={schedule.additionalNotes}
              onChange={(e) => setSchedule({ ...schedule, additionalNotes: e.target.value })}
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: '1.5',
              }}
            />
          </div>
        </div>
      )}

      {/* ── NAVIGATION BUTTONS ── */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        width: '100%',
        maxWidth: '560px',
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            style={{
              flex: 1,
              padding: '14px',
              border: '2px solid rgba(0,0,0,0.12)',
              borderRadius: '12px',
              background: 'transparent',
              color: '#555',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {t('back')}
          </button>
        )}

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            style={{
              flex: 2,
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              color: 'white',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            {t('next')}
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            style={{
              flex: 2,
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              background: loading ? '#ccc' : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              color: 'white',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? t('finishing') : t('finishSetup')}
          </button>
        )}
      </div>

      {/* Step dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '20px',
        justifyContent: 'center',
      }}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              width: s === currentStep ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: s === currentStep ? accentColor : 'rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
