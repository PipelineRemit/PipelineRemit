'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const fraunces = 'var(--font-fraunces), Fraunces, serif';

function RecipientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const gbp = searchParams.get('gbp') ?? '100.00';
  const ghs = searchParams.get('ghs') ?? '1659.87';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState<'MTN' | 'Telecel'>('MTN');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  function validate(): boolean {
    const next: { name?: string; phone?: string } = {};
    if (!name.trim()) next.name = 'Please enter the recipient\'s full name.';
    if (!phone.trim()) next.phone = 'Please enter a valid phone number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleContinue() {
    if (!validate()) return;
    const params = new URLSearchParams({
      gbp,
      ghs,
      name: name.trim(),
      phone: phone.trim(),
      network,
    });
    router.push(`/confirm?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#0f1a14] text-[#f0ede6] flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen">

        {/* Top Nav */}
        <nav className="flex items-center justify-between px-4 pt-12 pb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-[#1a2a1c] border border-[#2a3d2c] flex items-center justify-center"
            aria-label="Go back"
          >
            <i className="ti ti-arrow-left text-[#f0ede6] text-base" />
          </button>
          <span className="text-[#f0ede6] font-semibold text-[15px]">Recipient Details</span>
          <div className="w-9" />
        </nav>

        {/* Main content */}
        <main className="flex-1 px-4 pb-8 overflow-y-auto">

          {/* Transfer summary */}
          <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 mb-6">
            <p className="text-[#8a9e8c] text-xs font-medium uppercase tracking-wider mb-3">
              You&apos;re Sending
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[#8a9e8c] text-xs">You send</span>
                <span className="text-[#f0ede6] text-xl font-semibold" style={{ fontFamily: fraunces }}>
                  £{gbp}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <i className="ti ti-arrow-right text-[#f0b429] text-lg" />
                <span className="text-[#8a9e8c] text-[10px] mt-0.5">GBP → GHS</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#8a9e8c] text-xs">They get</span>
                <span className="text-[#f0b429] text-xl font-semibold" style={{ fontFamily: fraunces }}>
                  ₵{ghs}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#f0ede6] mb-4" style={{ fontFamily: fraunces }}>
              Who are you sending to?
            </h2>

            {/* Full Name */}
            <div className="mb-4">
              <label className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider block mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="e.g. Kwame Mensah"
                className={`w-full bg-[#1f3222] border rounded-[10px] px-3 py-3 text-[#f0ede6] text-sm placeholder-[#8a9e8c] outline-none focus:border-[#f0b429] transition-colors ${errors.name ? 'border-[#e74c3c]' : 'border-[#2a3d2c]'}`}
              />
              {errors.name && (
                <p className="text-[#e74c3c] text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider block mb-2">
                Phone Number
              </label>
              <div className={`flex items-center bg-[#1f3222] border rounded-[10px] overflow-hidden focus-within:border-[#f0b429] transition-colors ${errors.phone ? 'border-[#e74c3c]' : 'border-[#2a3d2c]'}`}>
                <div className="flex items-center gap-1.5 px-3 py-3 border-r border-[#2a3d2c] shrink-0">
                  <span className="text-[#8a9e8c] text-sm font-medium">🇬🇭</span>
                  <span className="text-[#8a9e8c] text-sm font-medium">+233</span>
                </div>
                <input
                  type="text"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
                  placeholder="024 412 3456"
                  className="flex-1 bg-transparent px-3 py-3 text-[#f0ede6] text-sm placeholder-[#8a9e8c] outline-none"
                />
              </div>
              {errors.phone && (
                <p className="text-[#e74c3c] text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Network selector */}
            <div className="mb-6">
              <label className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider block mb-2">
                Mobile Money Network
              </label>
              <div className="flex gap-3">
                {(['MTN', 'Telecel'] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[10px] border text-sm font-semibold transition-colors ${
                      network === n
                        ? 'bg-[#f0b429] border-[#f0b429] text-[#0f1a14]'
                        : 'bg-[#1f3222] border-[#2a3d2c] text-[#8a9e8c]'
                    }`}
                  >
                    <span>{n === 'MTN' ? '🟡' : '🔴'}</span>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              className="w-full bg-[#f0b429] text-[#0f1a14] font-semibold text-[15px] rounded-[10px] py-[14px] hover:bg-[#d99e1e] active:bg-[#d99e1e] transition-colors"
            >
              Continue
            </button>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 justify-center text-[#8a9e8c]">
            <i className="ti ti-lock text-sm" />
            <span className="text-xs">Recipient details are stored securely</span>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function RecipientPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1a14]" />}>
      <RecipientContent />
    </Suspense>
  );
}
