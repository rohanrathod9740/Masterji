'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Pencil1Icon, ArrowLeftIcon, TrashIcon, ExternalLinkIcon } from '@radix-ui/react-icons';

interface Interaction {
  id: string;
  interactionType: string;
  notes: string;
  audioUrl: string;
  transcript: string;
  interactionDate: string;
  personId: string;
  person?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type?: string;
  };
}

export default function InteractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        const response = await fetch(`/api/interactions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch interaction');
        }
        const data = await response.json();
        setInteraction(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load interaction');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInteraction();
    }
  }, [id]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this interaction? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/interactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || 'Failed to delete interaction'
        );
      }

      router.push('/app/interactions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interaction');
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      conversation: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '💬' },
      advice: { bg: 'bg-green-100', text: 'text-green-700', icon: '💡' },
      meeting: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🤝' },
      treatment: { bg: 'bg-red-100', text: 'text-red-700', icon: '⚕️' },
      proposal: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '📋' },
      session: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '📽️' },
    };
    return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📝' };
  };

  if (loading) {
    return (
          <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading interaction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interaction) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
          <div className="bg-white rounded-xl shadow-sm p-8 border-l-4 border-red-500">
            <p className="text-red-700 font-medium">{error || 'Interaction not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const typeColor = getTypeColor(interaction.interactionType);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/app/interactions/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md"
            >
              <Pencil1Icon className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 transition"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {/* Person Card */}
        {interaction.person && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-indigo-500 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {interaction.person.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {interaction.person.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    {interaction.person.email && <span>{interaction.person.email}</span>}
                    {interaction.person.phone && (
                      <>
                        {interaction.person.email && <span>•</span>}
                        <span>{interaction.person.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push(`/app/people/${interaction.person?.id}`)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="View person details"
              >
                <ExternalLinkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Type and Date Header */}
          <div className={`${typeColor.bg} p-6 border-b border-gray-100`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{typeColor.icon}</span>
              <div>
                <div className={`inline-block ${typeColor.bg} ${typeColor.text} px-3 py-1 rounded-full text-sm font-semibold`}>
                  {interaction.interactionType.charAt(0).toUpperCase() +
                    interaction.interactionType.slice(1)}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <span className="font-medium text-gray-900">
                {formatDate(interaction.interactionDate)}
              </span>
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Notes */}
            {interaction.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Notes
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {interaction.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Transcript */}
            {interaction.transcript && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Transcript
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {interaction.transcript}
                  </p>
                </div>
              </div>
            )}

            {/* Audio */}
            {interaction.audioUrl && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Audio Recording
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <audio
                    controls
                    className="w-full"
                    src={interaction.audioUrl}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <a
                    href={interaction.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-2 font-medium"
                  >
                    Open in new tab
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!interaction.notes &&
              !interaction.transcript &&
              !interaction.audioUrl && (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                  <p className="text-gray-500">No additional details for this interaction</p>
                </div>
              )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Interaction ID: <span className="font-mono text-gray-400">{id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
