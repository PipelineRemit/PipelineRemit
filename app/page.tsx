'use client';

import { useState } from 'react';

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:            '#f7f2ea',
  card:          '#ffffff',
  divider:       '#f0e8dc',
  primary:       '#c4651a',
  primaryTint:   '#fdece0',
  primaryDark:   '#b35c1c',
  textPrimary:   '#33261b',
  textSecondary: '#8a7a68',
  textLabel:     '#a8998a',
  success:       '#4b9b73',
  successText:   '#388a5f',
  successTint:   '#e6f4ec',
  error:         '#c0392b',
  errorTint:     '#fbe9e7',
};

// ── Sub-components ───────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
      maxWidth: 1080,
      margin: '0 auto',
      width: '100%',
    }}>
      <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
        <span style={{ color: C.textPrimary }}>Pipeline</span>
        <span style={{ color: C.primary }}>Remit</span>
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: 700,
        color: C.primary,
        background: C.primaryTint,
        borderRadius: 999,
        padding: '6px 14px',
        border: `1px solid ${C.divider}`,
      }}>
        Coming soon
      </span>
    </nav>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p style={{ fontSize: 15, fontWeight: 600, color: C.successText, marginTop: 8 }}>
        ✓ You&apos;re on the list! We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: '1 1 220px',
            padding: '14px 18px',
            borderRadius: 999,
            border: `1.5px solid ${C.divider}`,
            background: C.card,
            fontSize: 15,
            color: C.textPrimary,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '14px 28px',
            borderRadius: 999,
            background: status === 'loading' ? C.primaryDark : C.primary,
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            boxShadow: `0 8px 24px rgba(196,101,26,0.35)`,
          }}
        >
          {status === 'loading' ? 'Joining…' : 'Join the waitlist →'}
        </button>
      </div>
      {status === 'error' && (
        <p style={{ fontSize: 13, color: C.error, marginTop: 8, fontWeight: 500 }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}

function PhoneMockup() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 8px' }}>
      {/* Phone frame */}
      <div style={{
        width: 300,
        height: 620,
        borderRadius: 48,
        background: '#1a1a1a',
        padding: 10,
        boxShadow: '0 40px 80px rgba(51,38,27,0.22), 0 8px 24px rgba(51,38,27,0.12)',
        position: 'relative',
      }}>
        {/* Screen */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: 40,
          background: C.bg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 18px 18px',
        }}>
          {/* Status bar notch */}
          <div style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 90,
            height: 22,
            background: '#1a1a1a',
            borderRadius: 999,
            zIndex: 10,
          }} />

          {/* User row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: C.primaryTint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: C.primary,
              }}>AK</div>
              <span style={{ fontSize: 11, color: C.textSecondary, fontWeight: 500 }}>Aaron</span>
            </div>
            <span style={{ fontSize: 10, color: C.textLabel }}>Sign out</span>
          </div>

          {/* Wordmark */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>
              <span style={{ color: C.textPrimary }}>Pipeline</span>
              <span style={{ color: C.primary }}>Remit</span>
            </span>
          </div>

          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{
              background: C.primaryTint,
              border: `1px solid ${C.divider}`,
              borderRadius: 999,
              padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: 999, background: C.success }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: C.primary }}>UK → Ghana · No fees, ever</span>
            </div>
          </div>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.textPrimary, letterSpacing: -0.8, lineHeight: 1.1 }}>Send money home.</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.primary, fontStyle: 'italic', letterSpacing: -0.8, lineHeight: 1.1 }}>With ease.</div>
          </div>

          {/* Calculator card */}
          <div style={{
            background: C.card,
            borderRadius: 20,
            border: `1px solid ${C.divider}`,
            padding: '14px 14px 10px',
          }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: C.textLabel, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>You send</div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.textSecondary, marginRight: 2 }}>£</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.textPrimary, letterSpacing: -1 }}>100</span>
            </div>
            <div style={{ height: 1, background: C.divider, marginBottom: 10 }} />
            <div style={{ fontSize: 8, fontWeight: 700, color: C.textLabel, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>They receive</div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.primary, marginRight: 2 }}>₵</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.primary, letterSpacing: -1 }}>1,684.20</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 8, color: C.textLabel }}>Rate: 1 GBP = 16.842 GHS</span>
              <div style={{
                background: C.successTint, borderRadius: 999,
                padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: 999, background: C.success }} />
                <span style={{ fontSize: 8, fontWeight: 600, color: C.successText }}>Under 30 min</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            marginTop: 10,
            background: C.primary,
            borderRadius: 999,
            padding: '10px 0',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
          }}>
            Send money home →
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: '1', title: 'Enter amount', desc: 'Type how much GBP you want to send and see the live GHS amount instantly.' },
    { n: '2', title: 'Add recipient', desc: 'Their Ghanaian mobile number is all you need — we handle the rest.' },
    { n: '3', title: 'Money arrives', desc: 'GHS lands in their MTN or Telecel wallet in under 30 minutes.' },
  ];
  return (
    <section style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px' }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, color: C.textPrimary, letterSpacing: -0.6, textAlign: 'center', marginBottom: 48 }}>
        How it works
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {steps.map(s => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 999, flexShrink: 0,
              background: C.primaryTint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: C.primary,
              border: `1.5px solid ${C.divider}`,
            }}>{s.n}</div>
            <div style={{ paddingTop: 6 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustBar() {
  const signals = [
    { icon: '⚡', label: 'Under 30 minutes' },
    { icon: '📱', label: 'MTN & Telecel supported' },
    { icon: '🔒', label: 'Your money is safe' },
  ];
  return (
    <section style={{
      background: C.primaryTint,
      borderTop: `1px solid ${C.divider}`,
      borderBottom: `1px solid ${C.divider}`,
      padding: '32px 24px',
    }}>
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        gap: 48,
        flexWrap: 'wrap',
      }}>
        {signals.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, marginBottom: 10 }}>
        <span style={{ color: C.textPrimary }}>Pipeline</span>
        <span style={{ color: C.primary }}>Remit</span>
      </div>
      <p style={{ fontSize: 14, color: C.textSecondary, marginBottom: 20 }}>
        Sending money home shouldn&apos;t be complicated.
      </p>
      <p style={{ fontSize: 12, color: C.textLabel }}>
        © 2026 PipelineRemit. All rights reserved.
      </p>
    </footer>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Nav />

      {/* Hero */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>

          {/* Left — copy + form */}
          <div>
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 64px)',
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.05,
              margin: '0 0 20px',
            }}>
              <span style={{ color: C.textPrimary }}>Send money home.</span>
              <br />
              <span style={{ color: C.primary, fontStyle: 'italic' }}>With ease.</span>
            </h1>
            <p style={{
              fontSize: 18,
              color: C.textSecondary,
              lineHeight: 1.65,
              margin: '0 0 32px',
              maxWidth: 460,
            }}>
              Send GBP from the UK directly to MTN or Telecel mobile money wallets in Ghana. In under 30 minutes.
            </p>
            <WaitlistForm />
            <p style={{ fontSize: 12, color: C.textLabel, marginTop: 12 }}>
              Join the waitlist — be first to know when we launch.
            </p>
          </div>

          {/* Right — phone mockup */}
          <PhoneMockup />
        </div>
      </section>

      <HowItWorks />
      <TrustBar />
      <Footer />
    </div>
  );
}
