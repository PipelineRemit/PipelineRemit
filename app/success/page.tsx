'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const fraunces = 'var(--font-fraunces), Fraunces, serif';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const gbp = searchParams.get('gbp') ?? '100.00';
  const ghs = searchParams.get('ghs') ?? '1659.87';
  const name = searchParams.get('name') ?? 'Recipient';
  const phone = searchParams.get('phone') ?? '';
  const network = searchParams.get('network') ?? 'MTN';

  // Generate a stable reference code for this session
  const [refCode] = useState(
    () => `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
  );

  const firstName = name.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#0f1a14] text-[#f0ede6] flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen">

        {/* Header area */}
        <div className="pt-16 pb-6 px-4 flex flex-col items-center text-center">

          {/* Success circle */}
          <div className="w-20 h-20 rounded-full bg-[rgba(46,204,113,0.12)] border-2 border-[#2ecc71] flex items-center justify-center mb-5">
            <i className="ti ti-check text-[#2ecc71] text-4xl" />
          </div>

          <h1
            className="text-[28px] font-semibold text-[#f0ede6] leading-tight mb-2"
            style={{ fontFamily: fraunces }}
          >
            Transfer Sent!
          </h1>
          <p className="text-[#8a9e8c] text-sm leading-snug max-w-[260px]">
            Your money is on its way to{' '}
            <span className="text-[#f0ede6] font-medium">{firstName}</span>.
            It should arrive within 30 minutes.
          </p>
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 pb-8 overflow-y-auto">

          {/* Reference code */}
          <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 mb-4 flex flex-col items-center">
            <p className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider mb-2">
              Reference Code
            </p>
            <span
              className="text-[#f0b429] text-2xl font-semibold tracking-wider"
              style={{ fontFamily: fraunces }}
            >
              {refCode}
            </span>
            <p className="text-[#8a9e8c] text-xs mt-1.5">
              Save this for your records
            </p>
          </div>

          {/* Transfer details */}
          <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 mb-6">
            <p className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider mb-3">
              Transfer Details
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8a9e8c]">Amount sent</span>
                <span className="text-[#f0ede6] font-medium">£{gbp} GBP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a9e8c]">Amount received</span>
                <span className="text-[#f0b429] font-semibold" style={{ fontFamily: fraunces }}>
                  ₵{ghs} GHS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a9e8c]">Recipient</span>
                <span className="text-[#f0ede6] font-medium">{name}</span>
              </div>
              {phone && (
                <div className="flex justify-between">
                  <span className="text-[#8a9e8c]">Phone</span>
                  <span className="text-[#f0ede6]">+233 {phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8a9e8c]">Network</span>
                <span className="text-[#f0ede6] flex items-center gap-1.5">
                  <span>{network === 'MTN' ? '🟡' : '🔴'}</span>
                  {network} Mobile Money
                </span>
              </div>
              <div className="flex justify-between border-t border-[#2a3d2c] pt-3 mt-1">
                <span className="text-[#8a9e8c]">Estimated delivery</span>
                <span className="text-[#2ecc71] font-medium flex items-center gap-1">
                  <i className="ti ti-clock text-xs" />
                  Under 30 minutes
                </span>
              </div>
            </div>
          </div>

          {/* Status tracker teaser */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f0b429]" />
              <div className="flex-1 h-0.5 bg-[#f0b429]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2a3d2c]" />
              <div className="flex-1 h-0.5 bg-[#2a3d2c]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2a3d2c]" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-[#8a9e8c] mb-6 px-0.5">
            <span className="text-[#f0b429] font-medium">Sent</span>
            <span>Processing</span>
            <span>Delivered</span>
          </div>

          {/* Action buttons */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#f0b429] text-[#0f1a14] font-semibold text-[15px] rounded-[10px] py-[14px] hover:bg-[#d99e1e] active:bg-[#d99e1e] transition-colors mb-3"
          >
            Track Transfer
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-transparent border border-[#2a3d2c] text-[#f0ede6] font-semibold text-[15px] rounded-[10px] py-[14px] hover:border-[#8a9e8c] transition-colors"
          >
            Send Another
          </button>

        </main>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1a14]" />}>
      <SuccessContent />
    </Suspense>
  );
}
