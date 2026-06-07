'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const fraunces = 'var(--font-fraunces), Fraunces, serif';

const RATE = 16.856;

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const gbp = searchParams.get('gbp') ?? '100.00';
  const ghs = searchParams.get('ghs') ?? '1659.87';
  const name = searchParams.get('name') ?? 'Recipient';
  const phone = searchParams.get('phone') ?? '';
  const network = searchParams.get('network') ?? 'MTN';

  const gbpNum = parseFloat(gbp);
  const feeGbp = (gbpNum * 0.015).toFixed(2);

  const [loading, setLoading] = useState(false);

  function handleConfirm() {
    setLoading(true);
    // Simulate payment processing — will wire to real API in Phase 3
    setTimeout(() => {
      const params = new URLSearchParams({ gbp, ghs, name, phone, network });
      router.push(`/success?${params.toString()}`);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-[#0f1a14] text-[#f0ede6] flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen">

        {/* Top Nav */}
        <nav className="flex items-center justify-between px-4 pt-12 pb-4">
          <button
            onClick={() => router.back()}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-[#1a2a1c] border border-[#2a3d2c] flex items-center justify-center disabled:opacity-40"
            aria-label="Go back"
          >
            <i className="ti ti-arrow-left text-[#f0ede6] text-base" />
          </button>
          <span className="text-[#f0ede6] font-semibold text-[15px]">Confirm Transfer</span>
          <div className="w-9" />
        </nav>

        {/* Main content */}
        <main className="flex-1 px-4 pb-8 overflow-y-auto">

          {/* Transfer breakdown */}
          <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 mb-4">
            <p className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider mb-3">
              Transfer Summary
            </p>

            <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#2a3d2c]">
              <div className="flex flex-col">
                <span className="text-[#8a9e8c] text-xs mb-1">You send</span>
                <span className="text-[#f0ede6] text-2xl font-semibold" style={{ fontFamily: fraunces }}>
                  £{gbp}
                </span>
              </div>
              <i className="ti ti-arrow-right text-[#f0b429] text-xl" />
              <div className="flex flex-col items-end">
                <span className="text-[#8a9e8c] text-xs mb-1">They get</span>
                <span className="text-[#f0b429] text-2xl font-semibold" style={{ fontFamily: fraunces }}>
                  ₵{ghs}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8a9e8c]">Exchange rate</span>
                <span className="text-[#f0ede6]">1 GBP = {RATE} GHS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a9e8c]">Fee (1.5%)</span>
                <span className="text-[#f0ede6]">£{feeGbp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a9e8c]">Delivery</span>
                <span className="text-[#2ecc71] flex items-center gap-1 text-xs font-medium">
                  <i className="ti ti-clock text-xs" />
                  Under 30 minutes
                </span>
              </div>
            </div>
          </div>

          {/* Recipient details */}
          <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 mb-4">
            <p className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider mb-3">
              Recipient
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1f3222] border border-[#2a3d2c] flex items-center justify-center shrink-0">
                <i className="ti ti-user text-[#8a9e8c] text-base" />
              </div>
              <div>
                <p className="text-[#f0ede6] font-semibold text-sm">{name}</p>
                <p className="text-[#8a9e8c] text-xs mt-0.5">
                  +233 {phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#1f3222] rounded-[8px] px-3 py-2">
              <span className="text-sm">{network === 'MTN' ? '🟡' : '🔴'}</span>
              <span className="text-[#f0ede6] text-sm font-medium">
                {network} Mobile Money
              </span>
              <span className="ml-auto">
                <i className="ti ti-check text-[#2ecc71] text-sm" />
              </span>
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-3 bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 mb-6">
            <i className="ti ti-lock text-[#f0b429] text-lg shrink-0 mt-0.5" />
            <div>
              <p className="text-[#f0ede6] text-sm font-medium">Payment secured</p>
              <p className="text-[#8a9e8c] text-xs mt-0.5 leading-relaxed">
                Your payment is protected with 256-bit encryption via Open Banking. We never store your bank credentials.
              </p>
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-[#f0b429] text-[#0f1a14] font-semibold text-[15px] rounded-[10px] py-[14px] hover:bg-[#d99e1e] active:bg-[#d99e1e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="ti ti-loader-2 text-base animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <i className="ti ti-lock text-base" />
                Confirm &amp; Pay
              </>
            )}
          </button>

          <p className="text-center text-[#8a9e8c] text-xs mt-4">
            By confirming you agree to our{' '}
            <span className="text-[#f0b429] underline cursor-pointer">Terms of Service</span>
          </p>

        </main>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1a14]" />}>
      <ConfirmContent />
    </Suspense>
  );
}
