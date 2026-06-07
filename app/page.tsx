'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const fraunces = 'var(--font-fraunces), Fraunces, serif';
const FALLBACK_RATE = 16.856;

export default function Home() {
  const router = useRouter();
  const [gbpInput, setGbpInput] = useState('100');
  const [rate, setRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('/api/rates');
        if (!res.ok) throw new Error('Rate fetch failed');
        const data: { rate: number; fetchedAt: number; isFallback: boolean } = await res.json();
        setRate(data.rate);
        setIsFallback(data.isFallback);
      } catch {
        setRate(FALLBACK_RATE);
        setIsFallback(true);
      } finally {
        setRateLoading(false);
      }
    }
    fetchRate();
  }, []);

  const gbp = parseFloat(gbpInput) || 0;
  const currentRate = rate ?? FALLBACK_RATE;
  const ghsAmount = gbp * currentRate;

  function handleContinue() {
    router.push(
      `/recipient?gbp=${gbp.toFixed(2)}&ghs=${ghsAmount.toFixed(2)}&rate=${currentRate.toFixed(5)}`
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1a14] text-[#f0ede6] flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen relative">

        {/* Top Nav */}
        <nav className="flex items-center justify-between px-4 pt-12 pb-4">
          <span
            className="text-[#f0b429] font-bold text-xl tracking-tight"
            style={{ fontFamily: fraunces }}
          >
            PipelineRemit
          </span>
          <button
            className="w-9 h-9 rounded-full bg-[#1a2a1c] border border-[#2a3d2c] flex items-center justify-center"
            aria-label="Profile"
          >
            <i className="ti ti-user text-[#8a9e8c] text-base" />
          </button>
        </nav>

        {/* Main content */}
        <main className="flex-1 px-4 pb-28 overflow-y-auto">

          {/* Hero */}
          <div className="mt-2 mb-6">
            <h1
              className="text-[32px] font-semibold leading-tight"
              style={{ fontFamily: fraunces }}
            >
              Send Money Home.<br />
              <span className="text-[#f0b429]">Instantly.</span>
            </h1>
            <p className="text-[#8a9e8c] text-sm mt-2 leading-snug">
              GBP to GHS. Straight to mobile money.<br />Under 30 minutes.
            </p>
          </div>

          {/* Rate Calculator */}
          <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 mb-6">

            {/* You Send */}
            <div className="mb-3">
              <label className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider">
                You Send
              </label>
              <div className="flex items-center bg-[#1f3222] border border-[#2a3d2c] rounded-[10px] px-3 py-3 mt-2 focus-within:border-[#f0b429] transition-colors">
                <span
                  className="text-[#f0ede6] text-2xl font-semibold mr-1 leading-none"
                  style={{ fontFamily: fraunces }}
                >
                  £
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={gbpInput}
                  onChange={(e) => setGbpInput(e.target.value)}
                  className="flex-1 bg-transparent text-[#f0ede6] text-2xl font-semibold outline-none w-0 min-w-0"
                  style={{ fontFamily: fraunces }}
                  aria-label="GBP amount"
                />
                <span className="text-[#8a9e8c] text-sm font-medium ml-2 shrink-0">GBP</span>
              </div>
            </div>

            {/* Exchange rate divider */}
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-[#2a3d2c]" />
              <div className="flex items-center gap-1 text-xs text-[#8a9e8c]">
                <i className="ti ti-arrows-down-up text-[#f0b429] text-xs" />
                {rateLoading ? (
                  <div className="h-3 w-36 bg-[#2a3d2c] rounded animate-pulse" />
                ) : (
                  <span>
                    1 GBP ={' '}
                    <span className="text-[#f0b429] font-medium">
                      {currentRate.toFixed(3)} GHS
                    </span>
                    {isFallback && (
                      <span className="text-[#8a9e8c] ml-1">(est.)</span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex-1 h-px bg-[#2a3d2c]" />
            </div>

            {/* Recipient Gets */}
            <div className="mb-4">
              <label className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider">
                Recipient Gets
              </label>
              <div className="flex items-center bg-[#1f3222] border border-[#2a3d2c] rounded-[10px] px-3 py-3 mt-2">
                <span
                  className="text-[#f0ede6] text-2xl font-semibold mr-1 leading-none"
                  style={{ fontFamily: fraunces }}
                >
                  ₵
                </span>
                {rateLoading ? (
                  <div className="flex-1 h-7 bg-[#2a3d2c] rounded animate-pulse mx-1" />
                ) : (
                  <span
                    className="flex-1 text-[#f0b429] text-2xl font-semibold"
                    style={{ fontFamily: fraunces }}
                  >
                    {ghsAmount > 0 ? ghsAmount.toFixed(2) : '0.00'}
                  </span>
                )}
                <span className="text-[#8a9e8c] text-sm font-medium ml-2 shrink-0">GHS</span>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#8a9e8c]">Fees</span>
                <span className="text-[#2ecc71] font-medium">None</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8a9e8c]">Delivery</span>
                <span className="text-[#2ecc71] flex items-center gap-1 text-xs font-medium">
                  <i className="ti ti-clock text-xs" />
                  Under 30 minutes
                </span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={rateLoading}
              className="w-full bg-[#f0b429] text-[#0f1a14] font-semibold text-[15px] rounded-[10px] py-[14px] hover:bg-[#d99e1e] active:bg-[#d99e1e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {rateLoading ? 'Getting live rate…' : 'Continue'}
            </button>

            <p className="text-center text-[#8a9e8c] text-[11px] mt-3">
              No fees · Live rate updated hourly
            </p>
          </div>

          {/* How it Works */}
          <div className="mb-6">
            <h2
              className="text-lg font-semibold mb-4 text-[#f0ede6]"
              style={{ fontFamily: fraunces }}
            >
              How it Works
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'Enter amount',
                  desc: 'Type how much GBP you want to send and see the GHS instantly.',
                },
                {
                  step: '2',
                  title: 'Add recipient',
                  desc: 'Enter their name and MTN or Telecel mobile money number.',
                },
                {
                  step: '3',
                  title: 'Pay & done',
                  desc: 'Pay securely via Open Banking. Money arrives in under 30 minutes.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f0b429] flex items-center justify-center shrink-0 mt-0.5">
                    <span
                      className="text-[#0f1a14] font-bold text-sm"
                      style={{ fontFamily: fraunces }}
                    >
                      {step}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#f0ede6] text-sm">{title}</p>
                    <p className="text-[#8a9e8c] text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Stats */}
          <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4">
            <div className="grid grid-cols-3 divide-x divide-[#2a3d2c]">
              {[
                { stat: '10K+', label: 'Transfers' },
                { stat: '3.5K+', label: 'Senders' },
                { stat: '<30m', label: 'Delivery' },
              ].map(({ stat, label }) => (
                <div key={label} className="flex flex-col items-center px-2 py-1">
                  <span
                    className="text-[#f0b429] text-xl font-semibold"
                    style={{ fontFamily: fraunces }}
                  >
                    {stat}
                  </span>
                  <span className="text-[#8a9e8c] text-xs mt-1">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#1a2a1c] border-t border-[#2a3d2c] flex items-center justify-around px-2 py-3 z-10">
          {[
            { icon: 'ti-home', label: 'Home', active: true },
            { icon: 'ti-send', label: 'Send', active: false },
            { icon: 'ti-clock-history', label: 'History', active: false },
            { icon: 'ti-user', label: 'Account', active: false },
          ].map(({ icon, label, active }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1 px-4 py-1"
              aria-label={label}
            >
              <i className={`ti ${icon} text-xl ${active ? 'text-[#f0b429]' : 'text-[#8a9e8c]'}`} />
              <span
                className={`text-[10px] font-medium ${active ? 'text-[#f0b429]' : 'text-[#8a9e8c]'}`}
              >
                {label}
              </span>
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
