'use client';

import { useRouter } from 'next/navigation';

const fraunces = 'var(--font-fraunces), Fraunces, serif';

interface Transfer {
  id: string;
  name: string;
  phone: string;
  network: 'MTN' | 'Telecel';
  gbp: string;
  ghs: string;
  date: string;
  status: 'delivered' | 'processing' | 'failed';
  ref: string;
}

const MOCK_TRANSFERS: Transfer[] = [
  {
    id: '1',
    name: 'Kwame Mensah',
    phone: '024 412 3456',
    network: 'MTN',
    gbp: '100.00',
    ghs: '1,659.87',
    date: '7 Jun 2026',
    status: 'delivered',
    ref: 'PR-2026-4821',
  },
  {
    id: '2',
    name: 'Abena Osei',
    phone: '020 987 6543',
    network: 'Telecel',
    gbp: '50.00',
    ghs: '829.94',
    date: '2 Jun 2026',
    status: 'delivered',
    ref: 'PR-2026-3109',
  },
  {
    id: '3',
    name: 'Kojo Asante',
    phone: '054 321 0987',
    network: 'MTN',
    gbp: '200.00',
    ghs: '3,319.74',
    date: '28 May 2026',
    status: 'delivered',
    ref: 'PR-2026-2754',
  },
  {
    id: '4',
    name: 'Ama Boateng',
    phone: '055 654 3210',
    network: 'MTN',
    gbp: '75.00',
    ghs: '1,244.90',
    date: '20 May 2026',
    status: 'failed',
    ref: 'PR-2026-1887',
  },
];

const STATUS_STYLES: Record<Transfer['status'], { bg: string; text: string; label: string }> = {
  delivered: { bg: 'rgba(46,204,113,0.12)', text: '#2ecc71', label: 'Delivered' },
  processing: { bg: 'rgba(240,180,41,0.12)', text: '#f0b429', label: 'Processing' },
  failed: { bg: 'rgba(231,76,60,0.12)', text: '#e74c3c', label: 'Failed' },
};

export default function DashboardPage() {
  const router = useRouter();

  const totalSent = MOCK_TRANSFERS
    .filter((t) => t.status === 'delivered')
    .reduce((acc, t) => acc + parseFloat(t.gbp), 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-[#0f1a14] text-[#f0ede6] flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen">

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

          {/* Summary card */}
          <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 mb-6">
            <p className="text-[#8a9e8c] text-[11px] font-medium uppercase tracking-wider mb-1">
              Total Sent
            </p>
            <span
              className="text-[#f0b429] text-3xl font-semibold"
              style={{ fontFamily: fraunces }}
            >
              £{totalSent}
            </span>
            <p className="text-[#8a9e8c] text-xs mt-1">
              {MOCK_TRANSFERS.filter((t) => t.status === 'delivered').length} transfers completed
            </p>
          </div>

          {/* Quick send button */}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#f0b429] text-[#0f1a14] font-semibold text-[15px] rounded-[10px] py-[14px] hover:bg-[#d99e1e] active:bg-[#d99e1e] transition-colors mb-6 flex items-center justify-center gap-2"
          >
            <i className="ti ti-send text-base" />
            Send Money
          </button>

          {/* Transfer history */}
          <div>
            <h2
              className="text-base font-semibold text-[#f0ede6] mb-3"
              style={{ fontFamily: fraunces }}
            >
              Transfer History
            </h2>

            <div className="space-y-3">
              {MOCK_TRANSFERS.map((transfer) => {
                const s = STATUS_STYLES[transfer.status];
                return (
                  <div
                    key={transfer.id}
                    className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1f3222] border border-[#2a3d2c] flex items-center justify-center shrink-0">
                          <i className="ti ti-user text-[#8a9e8c] text-sm" />
                        </div>
                        <div>
                          <p className="text-[#f0ede6] font-semibold text-sm">{transfer.name}</p>
                          <p className="text-[#8a9e8c] text-xs mt-0.5">
                            {transfer.network === 'MTN' ? '🟡' : '🔴'} +233 {transfer.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className="text-[#f0ede6] font-semibold text-sm"
                          style={{ fontFamily: fraunces }}
                        >
                          £{transfer.gbp}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: s.bg, color: s.text }}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#2a3d2c] pt-2.5 mt-1">
                      <span className="text-[#8a9e8c] text-xs">{transfer.ref}</span>
                      <span className="text-[#8a9e8c] text-xs">{transfer.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#1a2a1c] border-t border-[#2a3d2c] flex items-center justify-around px-2 py-3 z-10">
          {[
            { icon: 'ti-home', label: 'Home', active: false, href: '/' },
            { icon: 'ti-send', label: 'Send', active: false, href: '/' },
            { icon: 'ti-clock-history', label: 'History', active: true, href: '/dashboard' },
            { icon: 'ti-user', label: 'Account', active: false, href: '/dashboard' },
          ].map(({ icon, label, active, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex flex-col items-center gap-1 px-4 py-1"
              aria-label={label}
            >
              <i className={`ti ${icon} text-xl ${active ? 'text-[#f0b429]' : 'text-[#8a9e8c]'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-[#f0b429]' : 'text-[#8a9e8c]'}`}>
                {label}
              </span>
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
