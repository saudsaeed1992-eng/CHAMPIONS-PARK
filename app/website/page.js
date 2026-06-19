'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const BrainIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const DumbbellIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 5v14" /><path d="M18 5v14" />
    <path d="M8 8H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
    <path d="M16 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const UtensilsIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

const TrendingUpIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const GlobeIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CameraIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const ShieldIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CheckIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronDownIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MenuIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const StarIcon = ({ size = 16, color = '#C9922A', filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArrowRightIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <BrainIcon size={28} color="#C9922A" />,
    title: 'AI Workout Plans',
    description: 'Claude AI generates a fully personalized 2+ week training program tailored to your goal, injuries, equipment, and schedule.',
    tag: 'Powered by Claude AI',
    bg: '#1B3A2A',
    textColor: '#fff',
    tagBg: 'rgba(201,146,42,0.2)',
    tagColor: '#C9922A',
    span: 'col-span-7',
  },
  {
    icon: <UtensilsIcon size={28} color="#1B3A2A" />,
    title: 'Meal Plans & Recipes',
    description: 'Calorie-optimized meal plans with complete recipes, ingredients, and cooking instructions matched to your fitness goal.',
    tag: 'Nutrition Science',
    bg: '#E8F5E9',
    textColor: '#1B3A2A',
    tagBg: 'rgba(27,58,42,0.08)',
    tagColor: '#2D5A2D',
    span: 'col-span-5',
  },
  {
    icon: <TrendingUpIcon size={28} color="#1B3A2A" />,
    title: 'Progress Tracking',
    description: 'Log daily weight and steps. Visual charts show your transformation journey over time.',
    tag: 'Visual Charts',
    bg: '#FDFCFA',
    textColor: '#1B3A2A',
    tagBg: 'rgba(27,58,42,0.06)',
    tagColor: '#2D5A2D',
    span: 'col-span-4',
  },
  {
    icon: <GlobeIcon size={28} color="#C9922A" />,
    title: '4 Languages',
    description: 'Full support for English, Arabic (RTL), Kurdish Sorani (RTL), and Turkish — AI plans generated in your language.',
    tag: 'EN · AR · KU · TR',
    bg: '#0D2118',
    textColor: '#fff',
    tagBg: 'rgba(201,146,42,0.15)',
    tagColor: '#E8B84B',
    span: 'col-span-4',
  },
  {
    icon: <CameraIcon size={28} color="#C9922A" />,
    title: 'Progress Photos',
    description: 'Upload front, back, and side photos weekly. Beta members #1-5 unlock before/after comparison.',
    tag: 'Beta Exclusive',
    bg: '#C9922A',
    textColor: '#fff',
    tagBg: 'rgba(255,255,255,0.2)',
    tagColor: '#fff',
    span: 'col-span-4',
  },
  {
    icon: <ZapIcon size={28} color="#1B3A2A" />,
    title: 'Video Tutorials',
    description: 'Curated YouTube tutorials for every workout and recipe unlocked for beta members.',
    tag: 'Beta Members Only',
    bg: '#E8F5E9',
    textColor: '#1B3A2A',
    tagBg: 'rgba(27,58,42,0.08)',
    tagColor: '#2D5A2D',
    span: 'col-span-12',
    horizontal: true,
  },
];

const steps = [
  {
    num: '01',
    title: 'Sign Up & Set Your Goal',
    desc: 'Choose weight loss or muscle building. Tell us about your body, schedule, equipment, and any injuries.',
    color: '#C9922A',
  },
  {
    num: '02',
    title: 'AI Builds Your Plan',
    desc: 'Claude AI analyzes your profile and generates a complete personalized workout and nutrition plan in minutes.',
    color: '#2D5A2D',
  },
  {
    num: '03',
    title: 'Train, Track & Transform',
    desc: 'Follow your plan, log progress, upload photos, and watch your body transform — all in one place.',
    color: '#1B3A2A',
  },
];

const testimonials = [
  {
    name: 'Ahmed Al-Rashid',
    role: 'Beta Member #12 · Weight Loss',
    text: 'The AI plan was shockingly accurate. It knew exactly what I needed — even adjusted for my knee injury. Lost 8kg in 6 weeks.',
    flag: '🇮🇶',
    lang: 'Arabic',
  },
  {
    name: 'Serkan Yılmaz',
    role: 'Beta Member #47 · Muscle Building',
    text: 'Getting a full gym program and meal plan in Turkish that fits MY schedule? I thought it was impossible. Champions Park delivered.',
    flag: '🇹🇷',
    lang: 'Turkish',
  },
  {
    name: 'Layla Hassan',
    role: 'Beta Member #3 · Weight Loss',
    text: "The before/after comparison feature is motivating beyond words. Three months ago I didn't believe in myself. Now I do.",
    flag: '🇰🇼',
    lang: 'English',
  },
];

const faqs = [
  {
    q: 'What does "Beta — 300 Free Spots" mean?',
    a: "We're in early beta and offering 300 users completely free access to the full platform. Your beta number is assigned by signup order — join early for exclusive perks like video tutorials and before/after photo comparison.",
  },
  {
    q: 'How does the AI create my plan?',
    a: 'After onboarding, Claude AI (by Anthropic) analyzes your goal, body metrics, available equipment, weekly schedule, and any injury limitations to generate a tailored 2+ week workout plan and calorie-optimized meal plan — all in your preferred language.',
  },
  {
    q: 'Which languages are supported?',
    a: 'English, Arabic (with full RTL layout), Kurdish Sorani (RTL), and Turkish. Your AI plan, meal plan, and all app content are generated and displayed in your chosen language.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. All data is stored securely on Supabase (PostgreSQL). Progress photos are stored in private Supabase Storage — only you can access them. We never sell or share your personal data.',
  },
  {
    q: 'What happens after the 300 beta spots fill up?',
    a: 'The free beta closes. A Pro tier will launch with a subscription fee. Beta members keep their free access as a thank-you for being early supporters.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChampionsParkWebsite() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [spotsLeft] = useState(247);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const c = {
    dark: '#1B3A2A',
    med: '#2D5A2D',
    light: '#E8F5E9',
    gold: '#C9922A',
    goldLight: '#E8B84B',
    cream: '#FDFCFA',
    text: '#0D1F14',
    muted: '#4A6A52',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Barlow', -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; color: #0D1F14; -webkit-font-smoothing: antialiased; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }

        /* Hero */
        .hero-section {
          background: linear-gradient(155deg, #0A1A10 0%, #1B3A2A 45%, #0F2518 100%);
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
        }
        .hero-glow-gold {
          position: absolute;
          top: 10%;
          left: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(201,146,42,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-glow-green {
          position: absolute;
          bottom: 20%;
          right: 5%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(74,122,74,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Navbar */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          transition: all 0.25s ease;
          padding: 0 24px;
        }
        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid transparent;
          transition: all 0.25s ease;
        }
        .navbar.scrolled .navbar-inner {
          background: rgba(13, 26, 16, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 12px 24px;
          border-bottom-color: rgba(255,255,255,0.06);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
          margin-top: 8px;
        }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link {
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
        }
        .nav-link:hover { color: #fff; }
        .nav-logo-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 22px;
          color: #fff;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .nav-cta {
          background: #C9922A;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .nav-cta:hover { background: #B8821F; box-shadow: 0 4px 16px rgba(201,146,42,0.4); }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-links.open {
            display: flex;
            flex-direction: column;
            position: fixed;
            inset: 0;
            background: rgba(10,22,14,0.97);
            backdrop-filter: blur(20px);
            justify-content: center;
            align-items: center;
            gap: 40px;
            z-index: 49;
          }
          .nav-links.open .nav-link { font-size: 28px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
          .menu-btn { display: flex !important; }
        }
        .menu-btn { display: none; background: none; border: none; cursor: pointer; color: #fff; z-index: 60; position: relative; }

        /* Buttons */
        .btn-gold {
          background: #C9922A;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 16px 32px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-gold:hover { background: #B8821F; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,146,42,0.45); }
        .btn-ghost {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 15px 28px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 17px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.5); }
        .btn-dark {
          background: #1B3A2A;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 16px 32px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-dark:hover { background: #0D2118; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(27,58,42,0.4); }

        /* Bento Grid */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
        }
        .bento-7 { grid-column: span 7; }
        .bento-5 { grid-column: span 5; }
        .bento-4 { grid-column: span 4; }
        .bento-12 { grid-column: span 12; }
        @media (max-width: 900px) {
          .bento-7, .bento-5, .bento-4, .bento-12 { grid-column: span 12; }
        }

        /* Feature cards */
        .feature-card {
          border-radius: 20px;
          padding: 32px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .feature-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.15); }

        /* Steps */
        .steps-container { display: flex; flex-direction: column; gap: 0; }
        .step-item { display: flex; gap: 24px; }
        .step-left { display: flex; flex-direction: column; align-items: center; }
        .step-num {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 48px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .step-line { width: 2px; flex: 1; min-height: 48px; background: linear-gradient(180deg, #C9922A 0%, #E8F5E9 100%); margin: 8px 0; }
        .step-line:last-child { display: none; }

        /* Testimonials */
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .testimonial-grid { grid-template-columns: 1fr; } }
        @media (min-width: 640px) and (max-width: 900px) { .testimonial-grid { grid-template-columns: repeat(2, 1fr); } }

        /* FAQ */
        .faq-item {
          border: 1px solid rgba(27,58,42,0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .faq-item.open { border-color: rgba(27,58,42,0.25); }
        .faq-q {
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          padding: 20px 24px;
          font-family: 'Barlow', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #0D1F14;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          transition: background 0.2s;
        }
        .faq-q:hover { background: rgba(27,58,42,0.03); }
        .faq-a {
          padding: 0 24px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          font-size: 15px;
          line-height: 1.65;
          color: #4A6A52;
        }
        .faq-a.open { max-height: 200px; padding: 0 24px 20px; }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-delay-1 { animation-delay: 0.1s; opacity: 0; animation-fill-mode: forwards; animation-name: fadeUp; animation-duration: 0.6s; animation-timing-function: ease; }
        .fade-up-delay-2 { animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards; animation-name: fadeUp; animation-duration: 0.6s; animation-timing-function: ease; }
        .fade-up-delay-3 { animation-delay: 0.35s; opacity: 0; animation-fill-mode: forwards; animation-name: fadeUp; animation-duration: 0.6s; animation-timing-function: ease; }

        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,146,42,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(201,146,42,0); }
        }
        .badge-pulse { animation: badge-pulse 2.5s ease-in-out infinite; }

        /* Section headings */
        .section-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #C9922A;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-eyebrow::before {
          content: '';
          display: block;
          width: 24px;
          height: 2px;
          background: #C9922A;
          border-radius: 2px;
        }
        .section-heading {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: #0D1F14;
        }
        .gold-text { color: #C9922A; }

        /* Spots badge */
        .spots-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(201,146,42,0.12);
          border: 1px solid rgba(201,146,42,0.3);
          border-radius: 100px;
          padding: 8px 18px 8px 10px;
          font-size: 13px;
          font-weight: 600;
          color: #E8B84B;
          letter-spacing: 0.03em;
        }
        .spot-dot {
          width: 8px;
          height: 8px;
          background: #C9922A;
          border-radius: 50%;
          animation: badge-pulse 2s ease-in-out infinite;
        }

        /* Hero content */
        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 140px 24px 80px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .hero-headline {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(56px, 9vw, 110px);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: #fff;
          text-transform: uppercase;
          margin: 20px 0 24px;
        }
        .hero-sub {
          font-size: clamp(17px, 2.5vw, 21px);
          font-weight: 400;
          line-height: 1.55;
          color: rgba(255,255,255,0.7);
          max-width: 540px;
          margin-bottom: 40px;
        }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 60px; }
        .hero-stats {
          display: flex;
          gap: 40px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
          flex-wrap: wrap;
        }
        .hero-stat-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 38px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
          margin-top: 4px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Stats section */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(27,58,42,0.1);
        }
        @media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .stat-box {
          background: #fff;
          padding: 40px 32px;
          text-align: center;
        }
        .stat-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 52px;
          font-weight: 900;
          color: #1B3A2A;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .stat-label {
          font-size: 13px;
          color: #4A6A52;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 8px;
        }

        /* Languages section */
        .lang-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 640px) { .lang-grid { grid-template-columns: 1fr; } }
        .lang-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s;
          cursor: default;
        }
        .lang-card:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }

        /* Beta section */
        .beta-inner {
          background: linear-gradient(135deg, #0A1A10 0%, #1B3A2A 100%);
          border-radius: 28px;
          padding: 80px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .beta-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .beta-inner::after {
          content: '';
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(201,146,42,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        @media (max-width: 640px) { .beta-inner { padding: 48px 24px; } }

        /* Footer */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
        }
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }

        /* Scroll indicator */
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
        .scroll-indicator { animation: scrollBounce 2s ease-in-out infinite; }

        /* Container */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/website" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/logo.svg" alt="Champions Park logo" width={36} height={36} />
            <span className="nav-logo-text">Champions Park</span>
          </Link>

          {/* Desktop links */}
          <div className={`nav-links${menuOpen ? ' open' : ''}`} role="list">
            {['Features', 'How It Works', 'Languages', 'FAQ'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="nav-link"
                role="listitem"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <Link href="/" className="nav-cta" onClick={() => setMenuOpen(false)}>
              Join Beta — Free
              <ArrowRightIcon size={16} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XIcon size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="hero-section" id="hero" aria-label="Hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow-gold" aria-hidden="true" />
        <div className="hero-glow-green" aria-hidden="true" />

        <div className="hero-content">
          {/* Beta badge */}
          <div className="fade-up">
            <div className="spots-badge" role="status" aria-live="polite">
              <span className="spot-dot" aria-hidden="true" />
              <span>{spotsLeft} of 300 beta spots remaining</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="hero-headline fade-up-delay-1">
            Where<br />
            <span style={{ color: '#C9922A' }}>Champions</span><br />
            Are Built.
          </h1>

          {/* Sub */}
          <p className="hero-sub fade-up-delay-2">
            AI-powered fitness coaching that builds your personalized workout plan, meal plan, and tracks your transformation — in your language.
          </p>

          {/* CTAs */}
          <div className="hero-ctas fade-up-delay-3">
            <Link href="/" className="btn-gold">
              Start Free — Join Beta
              <ArrowRightIcon size={18} color="#fff" />
            </Link>
            <a href="#features" className="btn-ghost">
              See Features
            </a>
          </div>

          {/* Hero stats */}
          <div className="hero-stats">
            {[
              { val: '300', label: 'Free Beta Spots' },
              { val: '4', label: 'Languages' },
              { val: 'AI', label: 'Powered by Claude' },
              { val: '2+', label: 'Week Plans' },
            ].map(s => (
              <div key={s.label}>
                <div className="hero-stat-val">{s.val}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
          role="button"
          aria-label="Scroll to content"
          tabIndex={0}
        >
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Scroll</span>
          <div className="scroll-indicator">
            <ChevronDownIcon size={20} color="rgba(255,255,255,0.35)" />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section id="stats" aria-label="Key statistics">
        <div className="stats-grid">
          {[
            { val: '300', label: 'Free Beta Spots' },
            { val: '4', label: 'Languages Supported' },
            { val: '2+', label: 'Weeks Per AI Plan' },
            { val: '100%', label: 'Free During Beta' },
          ].map(s => (
            <div key={s.label} className="stat-box">
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 0', background: '#F8FAF8' }} aria-label="Features">
        <div className="container">
          <div style={{ marginBottom: 56 }}>
            <p className="section-eyebrow">Everything You Need</p>
            <h2 className="section-heading">
              Built for <span className="gold-text">Champions.</span><br />
              Not just gym-goers.
            </h2>
            <p style={{ fontSize: 18, color: '#4A6A52', marginTop: 16, maxWidth: 520, lineHeight: 1.6 }}>
              Every feature is designed to remove the guesswork and give you a science-backed, AI-personalized path to your goal.
            </p>
          </div>

          <div className="bento-grid">
            {/* AI Workout Plans — large */}
            <div className="feature-card bento-7" style={{ background: '#1B3A2A', gridRow: 'span 1' }}>
              <div style={{ display: 'inline-flex', background: 'rgba(201,146,42,0.15)', border: '1px solid rgba(201,146,42,0.2)', borderRadius: 8, padding: '6px 12px', marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9922A' }}>Powered by Claude AI</span>
              </div>
              <div style={{ marginBottom: 20 }}><BrainIcon size={32} color="#C9922A" /></div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.01em' }}>AI Workout Plans</h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 380 }}>
                Claude AI generates a fully personalized 2+ week training program tailored to your goal, injuries, available equipment, and weekly schedule.
              </p>
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Adapts to your injuries & limitations', 'Gym or home equipment plans', 'Progressive overload built-in'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#C9922A', flexShrink: 0 }}><CheckIcon size={16} color="#C9922A" /></span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Plans */}
            <div className="feature-card bento-5" style={{ background: '#E8F5E9' }}>
              <div style={{ display: 'inline-flex', background: 'rgba(27,58,42,0.08)', borderRadius: 8, padding: '6px 12px', marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2D5A2D' }}>Nutrition Science</span>
              </div>
              <div style={{ marginBottom: 20 }}><UtensilsIcon size={32} color="#1B3A2A" /></div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#1B3A2A', marginBottom: 12, lineHeight: 1.1 }}>Meal Plans & Recipes</h3>
              <p style={{ fontSize: 15, color: '#4A6A52', lineHeight: 1.6 }}>
                Calorie-optimized meal plans with complete recipes, ingredient lists, and cooking instructions matched to your fitness goal.
              </p>
            </div>

            {/* Progress Tracking */}
            <div className="feature-card bento-4" style={{ background: '#fff', border: '1px solid rgba(27,58,42,0.08)' }}>
              <div style={{ marginBottom: 20 }}><TrendingUpIcon size={32} color="#1B3A2A" /></div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#1B3A2A', marginBottom: 10, lineHeight: 1.1 }}>Progress Tracking</h3>
              <p style={{ fontSize: 14, color: '#4A6A52', lineHeight: 1.6 }}>Log daily weight and steps. Visual charts reveal your transformation journey over time.</p>
            </div>

            {/* Languages */}
            <div className="feature-card bento-4" style={{ background: '#0D2118' }}>
              <div style={{ display: 'inline-flex', background: 'rgba(201,146,42,0.12)', borderRadius: 8, padding: '5px 10px', marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8B84B' }}>EN · AR · KU · TR</span>
              </div>
              <div style={{ marginBottom: 16 }}><GlobeIcon size={32} color="#C9922A" /></div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 10, lineHeight: 1.1 }}>4 Languages</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Full RTL support for Arabic and Kurdish Sorani. AI plans generated in your language.</p>
            </div>

            {/* Progress Photos */}
            <div className="feature-card bento-4" style={{ background: '#C9922A' }}>
              <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px 10px', marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>Beta Exclusive</span>
              </div>
              <div style={{ marginBottom: 16 }}><CameraIcon size={32} color="#fff" /></div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 10, lineHeight: 1.1 }}>Progress Photos</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>Upload weekly photos. Beta members #1–5 unlock before/after comparison views.</p>
            </div>

            {/* Video Tutorials — full width */}
            <div className="feature-card bento-12" style={{ background: '#fff', border: '1px solid rgba(27,58,42,0.08)', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'inline-flex', background: '#E8F5E9', borderRadius: 8, padding: '5px 10px', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D5A2D' }}>Beta Members Only</span>
                </div>
                <div style={{ marginBottom: 14 }}><ZapIcon size={32} color="#1B3A2A" /></div>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#1B3A2A', marginBottom: 10, lineHeight: 1.1 }}>Video Tutorials</h3>
                <p style={{ fontSize: 15, color: '#4A6A52', lineHeight: 1.6, maxWidth: 400 }}>Curated YouTube workout and cooking tutorials paired to every exercise and recipe in your plan. Unlocked for beta members #1–20.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {['Workout videos', 'Cooking tutorials', 'Form guides', 'Recipe walkthroughs'].map(tag => (
                  <span key={tag} style={{ background: '#E8F5E9', color: '#1B3A2A', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 0', background: '#fff' }} aria-label="How it works">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <p className="section-eyebrow">Simple Process</p>
              <h2 className="section-heading">
                From sign-up to<br />
                <span className="gold-text">transformation</span><br />
                in minutes.
              </h2>
              <p style={{ fontSize: 17, color: '#4A6A52', marginTop: 20, lineHeight: 1.65 }}>
                No personal trainer needed. No guesswork. Just an AI that builds your perfect plan the moment you finish onboarding.
              </p>
              <div style={{ marginTop: 40 }}>
                <Link href="/" className="btn-dark">
                  Get Your Free Plan
                  <ArrowRightIcon size={18} color="#fff" />
                </Link>
              </div>
            </div>

            <div className="steps-container">
              {steps.map((step, i) => (
                <div key={step.num}>
                  <div className="step-item">
                    <div className="step-left">
                      <div className="step-num" style={{ color: step.color }}>{step.num}</div>
                      {i < steps.length - 1 && <div className="step-line" />}
                    </div>
                    <div style={{ paddingTop: 4, paddingBottom: i < steps.length - 1 ? 40 : 0 }}>
                      <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 800, color: '#0D1F14', marginBottom: 10, letterSpacing: '-0.01em' }}>{step.title}</h3>
                      <p style={{ fontSize: 15, color: '#4A6A52', lineHeight: 1.65 }}>{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive fix for steps section */}
        <style>{`
          @media (max-width: 768px) {
            #how-it-works .container > div {
              grid-template-columns: 1fr !important;
              gap: 48px !important;
            }
          }
        `}</style>
      </section>

      {/* ── Languages ──────────────────────────────────────────────────────── */}
      <section
        id="languages"
        style={{ padding: '100px 0', background: 'linear-gradient(155deg, #0A1A10 0%, #1B3A2A 100%)' }}
        aria-label="Supported languages"
      >
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <p className="section-eyebrow">Multilingual</p>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px,5vw,56px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#fff', marginBottom: 20 }}>
                Your plan.<br />
                <span style={{ color: '#C9922A' }}>Your language.</span>
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: 420 }}>
                Champions Park is built for a global community. AI-generated workout plans, meal plans, and all UI text rendered natively in 4 languages — including full right-to-left layout for Arabic and Kurdish.
              </p>
              <div style={{ marginTop: 32 }}>
                <Link href="/" className="btn-gold">
                  Join in Your Language
                  <ArrowRightIcon size={18} color="#fff" />
                </Link>
              </div>
            </div>

            <div className="lang-grid">
              {[
                { code: 'EN', name: 'English', dir: 'LTR', sample: 'Push Day — Chest & Shoulders' },
                { code: 'AR', name: 'العربية', dir: 'RTL', sample: 'يوم الدفع — الصدر والكتفين' },
                { code: 'KU', name: 'کوردی', dir: 'RTL', sample: 'ڕۆژی بینی — سینە و مەندیل' },
                { code: 'TR', name: 'Türkçe', dir: 'LTR', sample: 'İtiş Günü — Göğüs ve Omuzlar' },
              ].map(lang => (
                <div key={lang.code} className="lang-card" dir={lang.dir === 'RTL' ? 'rtl' : 'ltr'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexDirection: lang.dir === 'RTL' ? 'row-reverse' : 'row' }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: '#C9922A' }}>{lang.code}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 6 }}>{lang.dir}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{lang.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>{lang.sample}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            #languages .container > div { grid-template-columns: 1fr !important; gap: 48px !important; }
          }
        `}</style>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: '#F8FAF8' }} aria-label="Testimonials">
        <div className="container">
          <div style={{ marginBottom: 56, textAlign: 'center' }}>
            <p className="section-eyebrow" style={{ justifyContent: 'center' }}>Beta Members Say</p>
            <h2 className="section-heading">Real people. <span className="gold-text">Real results.</span></h2>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: '1px solid rgba(27,58,42,0.08)',
                  borderRadius: 20,
                  padding: '32px',
                  transition: 'all 0.25s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(27,58,42,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                  {[...Array(5)].map((_, j) => <StarIcon key={j} size={16} />)}
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: '#2D3E32', marginBottom: 28, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid rgba(27,58,42,0.06)', paddingTop: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 20 }} role="img" aria-label={`Flag for ${t.name}`}>{t.flag}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0D1F14' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#86A886', fontWeight: 500, marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Beta CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: '#fff' }} aria-label="Join beta">
        <div className="container">
          <div className="beta-inner">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="spots-badge badge-pulse" style={{ marginBottom: 32, display: 'inline-flex' }} role="status">
                <span className="spot-dot" aria-hidden="true" />
                <span>{spotsLeft} spots left — closes when full</span>
              </div>

              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(44px,7vw,80px)', fontWeight: 900, color: '#fff', lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 24 }}>
                Your Champion<br />
                <span style={{ color: '#C9922A' }}>Journey Starts</span><br />
                Today.
              </h2>

              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.6 }}>
                Join 300 free beta members and get a fully personalized AI workout and meal plan — free, forever, as a thank-you for being early.
              </p>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/" className="btn-gold" style={{ fontSize: 19, padding: '18px 40px' }}>
                  Claim Your Free Spot
                  <ArrowRightIcon size={20} color="#fff" />
                </Link>
              </div>

              <div style={{ marginTop: 40, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['No credit card required', '100% free during beta', 'Cancel anytime'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckIcon size={16} color="#C9922A" />
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '100px 0', background: '#F8FAF8' }} aria-label="Frequently asked questions">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-eyebrow" style={{ justifyContent: 'center' }}>FAQ</p>
            <h2 className="section-heading">Questions answered.</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} role="list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`} role="listitem">
                <button
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span>{faq.q}</span>
                  <span
                    style={{ flexShrink: 0, transition: 'transform 0.25s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', color: '#C9922A' }}
                    aria-hidden="true"
                  >
                    <ChevronDownIcon size={20} color="#C9922A" />
                  </span>
                </button>
                <div
                  id={`faq-answer-${i}`}
                  className={`faq-a${openFaq === i ? ' open' : ''}`}
                  role="region"
                  aria-hidden={openFaq !== i}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0A1A10', padding: '80px 0 40px' }} aria-label="Footer">
        <div className="container">
          <div className="footer-grid" style={{ marginBottom: 64 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Image src="/logo.svg" alt="Champions Park" width={40} height={40} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Champions Park</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 280 }}>
                AI-powered fitness coaching that builds personalized workout and meal plans in your language.
              </p>
              <div style={{ marginTop: 24 }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C9922A', color: '#fff', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>
                  Join Beta — Free
                </Link>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Product</h4>
              <nav aria-label="Product links">
                {['Features', 'How It Works', 'Languages', 'Beta Program'].map(link => (
                  <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >{link}</a>
                ))}
              </nav>
            </div>

            {/* Languages */}
            <div>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Languages</h4>
              <nav aria-label="Language links">
                {[{ name: 'English', code: 'EN' }, { name: 'العربية', code: 'AR' }, { name: 'کوردی', code: 'KU' }, { name: 'Türkçe', code: 'TR' }].map(l => (
                  <div key={l.code} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: '#C9922A', width: 24 }}>{l.code}</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{l.name}</span>
                  </div>
                ))}
              </nav>
            </div>

            {/* App */}
            <div>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>App</h4>
              <nav aria-label="App links">
                {['Sign Up', 'Log In', 'Dashboard', 'Pro Waitlist'].map(link => (
                  <Link key={link} href="/" style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >{link}</Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Footer bottom */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} Champions Park. All rights reserved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, background: '#4A7A4A', borderRadius: '50%', display: 'inline-block' }} aria-hidden="true" />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Beta — 300 Spots Available</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
