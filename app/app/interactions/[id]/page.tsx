'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Pencil1Icon,
  ArrowLeftIcon,
  TrashIcon,
  ExternalLinkIcon,
  ChatBubbleIcon,
  LightningBoltIcon,
  CalendarIcon,
  HeartIcon,
  ClipboardIcon,
  VideoIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';

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
    const colors: Record<
      string,
      { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }
    > = {
      conversation: { bg: 'bg-blue-100', text: 'text-blue-700', icon: ChatBubbleIcon },
      advice: { bg: 'bg-green-100', text: 'text-green-700', icon: LightningBoltIcon },
      meeting: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CalendarIcon },
      treatment: { bg: 'bg-red-100', text: 'text-red-700', icon: HeartIcon },
      proposal: { bg: 'bg-amber-100', text: 'text-amber-700', icon: ClipboardIcon },
      session: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: VideoIcon },
    };
    return (
      colors[type] || {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: QuestionMarkCircledIcon,
      }
    );
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interaction) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to interactions
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error || 'Interaction not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const typeColor = getTypeColor(interaction.interactionType);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to interactions
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {interaction.interactionType
                  ? interaction.interactionType.charAt(0).toUpperCase() +
                    interaction.interactionType.slice(1)
                  : 'Interaction'}
              </h1>
              <p className="text-gray-600 mt-2">
                {formatDate(interaction.interactionDate)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/app/interactions/${id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                <Pencil1Icon className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 transition"
              >
                <TrashIcon className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Person Card */}
        {interaction.person && (
          <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Person</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">{interaction.person.name}</p>
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
              <button
                onClick={() => router.push(`/app/people/${interaction.person?.id}`)}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View person
                <ExternalLinkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Interaction Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <div className="flex items-center gap-3">
              <typeColor.icon className="w-5 h-5 text-gray-700" />
              <span className={`text-sm font-semibold ${typeColor.text} ${typeColor.bg} px-3 py-1 rounded-full`}>
                {interaction.interactionType.charAt(0).toUpperCase() +
                  interaction.interactionType.slice(1)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {interaction.notes && (
            <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                {interaction.notes}
              </p>
            </div>
          )}

          {/* Transcript */}
          {interaction.transcript && (
            <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h2>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 whitespace-pre-wrap">
                {interaction.transcript}
              </p>
            </div>
          )}

          {/* Audio */}
          {interaction.audioUrl && (
            <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio Recording</h2>
              <audio controls className="w-full" src={interaction.audioUrl}>
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
          )}

          {!interaction.notes && !interaction.transcript && !interaction.audioUrl && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No additional details for this interaction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
