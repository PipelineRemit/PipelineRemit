'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getTransactions, TransactionWithRecipient } from '@/lib/database';

const fraunces = 'var(--font-fraunces), Fraunces, serif';

const STATUS_STYLES: Record<
  TransactionWithRecipient['status'],
  { bg: string; text: string; label: string }
> = {
  delivered:  { bg: 'rgba(46,204,113,0.12)',  text: '#2ecc71', label: 'Delivered'  },
  processing: { bg: 'rgba(240,180,41,0.12)',  text: '#f0b429', label: 'Processing' },
  pending:    { bg: 'rgba(240,180,41,0.12)',  text: '#f0b429', label: 'Pending'    },
  failed:     { bg: 'rgba(231,76,60,0.12)',   text: '#e74c3c', label: 'Failed'     },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatGbp(amount: number): string {
  return amount.toFixed(2);
}

// ─── Loading skeleton ────────────────────────────────────────

function TransferSkeleton() {
  return (
    <div className="bg-[#1a2a1c] border border-[#2a3d2c] rounded-2xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2a3d2c] shrink-0" />
          <div>
            <div className="h-3.5 w-28 bg-[#2a3d2c] rounded mb-2" />
            <div className="h-3 w-20 bg-[#2a3d2c] rounded" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-3.5 w-12 bg-[#2a3d2c] rounded" />
          <div className="h-5 w-16 bg-[#2a3d2c] rounded-full" />
        </div>
      </div>
      <div className="border-t border-[#2a3d2c] pt-2.5 flex justify-between">
        <div className="h-3 w-24 bg-[#2a3d2c] rounded" />
        <div className="h-3 w-20 bg-[#2a3d2c] rounded" />
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────

function EmptyState({ isConfigured }: { isConfigured: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-[#1a2a1c] border border-[#2a3d2c] flex items-center justify-center mb-4">
        <i className="ti ti-send text-[#8a9e8c] text-2xl" />
      </div>
      <p className="text-[#f0ede6] font-semibold text-sm mb-1">No transfers yet</p>
      <p className="text-[#8a9e8c] text-xs leading-relaxed max-w-[220px]">
        {isConfigured
          ? 'Your transfer history will appear here once you make your first send.'
          : 'Connect your Supabase account to see real transfer history.'}
      </p>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<TransactionWithRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransfers() {
      // If Supabase keys are still placeholders, skip the fetch entirely
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // No user logged in yet — show empty state (normal pre-auth state)
          setLoading(false);
          return;
        }

        const data = await getTransactions(session.user.id);
        setTransfers(data);
      } catch (err) {
        console.error('[dashboard] Failed to load transfers:', err);
        setFetchError('Could not load your transfer history. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadTransfers();
  }, []);

  const deliveredTransfers = transfers.filter((t) => t.status === 'delivered');
  const totalSent = deliveredTransfers
    .reduce((acc, t) => acc + t.gbp_amount, 0)
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
            {loading ? (
              <>
                <div className="h-9 w-24 bg-[#2a3d2c] rounded animate-pulse mb-1" />
                <div className="h-3 w-32 bg-[#2a3d2c] rounded animate-pulse" />
              </>
            ) : (
              <>
                <span
                  className="text-[#f0b429] text-3xl font-semibold"
                  style={{ fontFamily: fraunces }}
                >
                  £{totalSent}
                </span>
                <p className="text-[#8a9e8c] text-xs mt-1">
                  {deliveredTransfers.length === 0
                    ? 'No completed transfers yet'
                    : `${deliveredTransfers.length} transfer${deliveredTransfers.length === 1 ? '' : 's'} completed`}
                </p>
              </>
            )}
          </div>

          {/* Quick send */}
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

            {/* Error state */}
            {fetchError && (
              <div className="bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.2)] rounded-2xl p-4 mb-3 flex items-start gap-3">
                <i className="ti ti-alert-circle text-[#e74c3c] text-base shrink-0 mt-0.5" />
                <p className="text-[#e74c3c] text-sm">{fetchError}</p>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="space-y-3">
                <TransferSkeleton />
                <TransferSkeleton />
                <TransferSkeleton />
              </div>
            )}

            {/* Empty state */}
            {!loading && !fetchError && transfers.length === 0 && (
              <EmptyState isConfigured={isSupabaseConfigured} />
            )}

            {/* Transfer list */}
            {!loading && transfers.length > 0 && (
              <div className="space-y-3">
                {transfers.map((transfer) => {
                  const s = STATUS_STYLES[transfer.status];
                  const recipient = transfer.recipients;
                  const networkEmoji = recipient?.network === 'MTN' ? '🟡' : '🔴';
                  const displayNetwork =
                    recipient?.network === 'TELECEL' ? 'Telecel' : recipient?.network ?? '—';

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
                            <p className="text-[#f0ede6] font-semibold text-sm">
                              {recipient?.full_name ?? '—'}
                            </p>
                            <p className="text-[#8a9e8c] text-xs mt-0.5">
                              {networkEmoji} {displayNetwork} · +233 {recipient?.phone_number ?? '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                          <span
                            className="text-[#f0ede6] font-semibold text-sm"
                            style={{ fontFamily: fraunces }}
                          >
                            £{formatGbp(transfer.gbp_amount)}
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
                        <span className="text-[#8a9e8c] text-xs font-medium">
                          {transfer.reference_code}
                        </span>
                        <span className="text-[#8a9e8c] text-xs">
                          {formatDate(transfer.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#1a2a1c] border-t border-[#2a3d2c] flex items-center justify-around px-2 py-3 z-10">
          {[
            { icon: 'ti-home',          label: 'Home',    active: false, href: '/'          },
            { icon: 'ti-send',          label: 'Send',    active: false, href: '/'          },
            { icon: 'ti-clock-history', label: 'History', active: true,  href: '/dashboard' },
            { icon: 'ti-user',          label: 'Account', active: false, href: '/dashboard' },
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
