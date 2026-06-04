'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeftIcon,
  TrashIcon,
  ExternalLinkIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  CheckIcon,
  CounterClockwiseClockIcon,
  CalendarIcon,
  PersonIcon,
  TextAlignLeftIcon,
} from '@radix-ui/react-icons';
import { format, differenceInDays, isPast, isToday } from 'date-fns';

interface Commitment {
  id: string;
  title: string;
  status: 'pending' | 'done' | 'missed';
  dueDate: string;
  createdAt: string;
  important_points?: string;
  personId: string;
}

interface Person {
  id: string;
  name: string;
  type: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <ClockIcon className="w-4 h-4" />,
    label: 'Pending',
  },
  done: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: <CheckCircledIcon className="w-4 h-4" />,
    label: 'Done',
  },
  missed: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: <CrossCircledIcon className="w-4 h-4" />,
    label: 'Missed',
  },
};

function getDueBadge(dueDate: string, status: string) {
  if (status === 'done' || status === 'missed') return null;
  const date = new Date(dueDate);
  if (isToday(date)) return { label: 'Due today', className: 'text-amber-700 bg-amber-100 border-amber-200' };
  if (isPast(date)) {
    const days = differenceInDays(new Date(), date);
    return { label: `${days}d overdue`, className: 'text-red-700 bg-red-100 border-red-200' };
  }
  const daysLeft = differenceInDays(date, new Date());
  return { label: `In ${daysLeft}d`, className: 'text-gray-600 bg-gray-100 border-gray-200' };
}

export default function CommitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [personData, setPersonData] = useState<Person | null>(null);

  // Fetch commitment
  useEffect(() => {
    if (!id) return;
    const fetchCommitment = async () => {
      try {
        const res = await fetch(`/api/commitments/${id}`);
        if (!res.ok) throw new Error('Failed to fetch commitment');
        const json = await res.json();
        setCommitment(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load commitment');
      } finally {
        setLoading(false);
      }
    };
    fetchCommitment();
  }, [id]);

  // Fetch person — depends on commitment.personId, not id
  useEffect(() => {
    if (!commitment?.personId) return;
    const fetchPerson = async () => {
      try {
        const res = await fetch(`/api/people/${commitment.personId}`);
        if (!res.ok) throw new Error('Failed to fetch person');
        const json = await res.json();
        setPersonData(json.data ?? json);
      } catch (err) {
        // Non-fatal: person sidebar just won't show details
        console.error('Failed to load person:', err);
      }
    };
    fetchPerson();
  }, [commitment?.personId]); // ✅ correct dependency

  const updateStatus = async (status: 'done' | 'pending') => {
    if (!commitment) return;
    setUpdating(true);
    const prev = commitment.status;
    setCommitment((c) => (c ? { ...c, status } : c));
    try {
      const res = await fetch(`/api/commitments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const json = await res.json();
      setCommitment(json.data ?? json);
    } catch {
      setCommitment((c) => (c ? { ...c, status: prev } : c));
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this commitment? This cannot be undone.')) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/commitments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || 'Failed to delete');
      }
      router.push('/app/commitments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete commitment');
      setDeleting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading commitment…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ──
  if (error && !commitment) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to commitments
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error || 'Commitment not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!commitment) return null;

  const statusCfg = STATUS_CONFIG[commitment.status];
  const dueBadge = getDueBadge(commitment.dueDate, commitment.status);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-20">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to commitments
      </button>

      {/* Inline error (post-load) */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: Person sidebar ── */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6">
          {commitment.personId ? (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Avatar banner */}
              <div className="h-16 bg-gradient-to-br from-blue-500 to-indigo-600" />
              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="-mt-8 mb-3">
                  <div className="w-16 h-16 rounded-full bg-blue-100 border-4 border-white shadow-md flex items-center justify-center font-bold text-lg text-blue-700">
                    {personData?.name
                      ? personData.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : '?'}
                  </div>
                </div>

                {/* Name + type */}
                <div className="mb-4">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    {personData?.name ?? '—'}
                  </h2>
                  {personData?.type && (
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize border border-blue-100">
                      {personData.type}
                    </span>
                  )}
                </div>

                {/* Contact details */}
                <div className="space-y-2 mb-5">
                  {personData?.email && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                      </svg>
                      <a href={`mailto:${personData.email}`} className="truncate hover:text-blue-600 transition-colors">
                        {personData.email}
                      </a>
                    </div>
                  )}
                  {personData?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      <a href={`tel:${personData.phone}`} className="hover:text-blue-600 transition-colors">
                        {personData.phone}
                      </a>
                    </div>
                  )}
                  {!personData?.email && !personData?.phone && (
                    <p className="text-xs text-gray-400 italic">No contact info</p>
                  )}
                </div>

                {/* View person link */}
                <button
                  onClick={() => router.push(`/app/people/${commitment.personId}`)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium border border-blue-200 transition-colors"
                >
                  <PersonIcon className="w-4 h-4" />
                  View full profile
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-5 text-center text-sm text-gray-400 shadow-sm">
              No person linked
            </div>
          )}
        </aside>

        {/* ── RIGHT: Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Title + status + actions */}
          <div className="mb-6">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
              >
                {statusCfg.icon}
                {statusCfg.label}
              </span>
              {dueBadge && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${dueBadge.className}`}>
                  {dueBadge.label}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {commitment.title}
              </h1>

              {/* Action buttons */}
              <div className="flex gap-2 shrink-0">
                {(commitment.status === 'pending' || commitment.status === 'missed') && (
                  <button
                    onClick={() => updateStatus('done')}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border border-green-400 bg-green-500 text-white hover:bg-green-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {updating ? 'Saving…' : 'Mark as done'}
                  </button>
                )}
                {commitment.status === 'done' && (
                  <button
                    onClick={() => updateStatus('pending')}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <CounterClockwiseClockIcon className="w-4 h-4" />
                    {updating ? 'Saving…' : 'Undo'}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <TrashIcon className="w-4 h-4" />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>

          {/* Detail cards */}
          <div className="space-y-4">
            {/* Dates */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Dates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Due date</p>
                    <p className="text-sm font-medium text-gray-800">
                      {format(new Date(commitment.dueDate), 'PPP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Created</p>
                    <p className="text-sm font-medium text-gray-800">
                      {format(new Date(commitment.createdAt), 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important points */}
            {commitment.important_points && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TextAlignLeftIcon className="w-3.5 h-3.5" />
                  Notes
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {commitment.important_points}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}