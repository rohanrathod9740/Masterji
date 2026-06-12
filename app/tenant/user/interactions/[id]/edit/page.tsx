'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon, TrashIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranscriber } from '@/hooks/useTranscriber';
import AudioManager from '@/components/ui/audio/audioManager';

export default function EditInteractionPage() {
  const transcriber = useTranscriber();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    interactionType: '',
    notes: '',
    audioUrl: '',
    transcript: '',
    interactionDate: '',
  });

  // Fetch interaction data
  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        const response = await fetch(`/api/interactions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch interaction');
        }
        const data = await response.json();
        setFormData({
          interactionType: data.interactionType || '',
          notes: data.notes || '',
          audioUrl: data.audioUrl || '',
          transcript: data.transcript || '',
          interactionDate: data.interactionDate
            ? new Date(data.interactionDate).toISOString().slice(0, 16)
            : '',
        });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        interactionDate: formData.interactionDate
          ? new Date(formData.interactionDate).toISOString()
          : undefined,
      };

      const response = await fetch(`/api/interactions/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update interaction');
      }

      router.push(`/app/interactions/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update interaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) {
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
        throw new Error(errorData.error || errorData.message || 'Failed to delete interaction');
      }

      router.push('/app/interactions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interaction');
      setDeleting(false);
    }
  };

  // Auto-populate transcript when transcription completes
  useEffect(() => {
    if (transcriber.output?.text) {
      setFormData(prev => ({
        ...prev,
        transcript: transcriber.output!.text,
      }))
    }
  }, [transcriber.output])

  if (loading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-20">
          <p className="text-gray-500 text-sm mt-8">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>
              {transcriber.modelLoadingProgress === 0 && `Model not loaded`}
              {transcriber.isModeLoading && `Loading model`}
              {transcriber.modelLoadingProgress === 100 && `Model ready`}
            </span>
            <span>{transcriber.modelLoadingProgress.toFixed()}%</span>
          </div>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href={`/app/interactions/${id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to interaction
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Edit Interaction
            </h1>
            <p className="text-gray-600 mt-2">
              Update the details of this interaction
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interaction Details Card */}
            <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Interaction Details
              </h2>

              <div className="space-y-4">
                {/* Interaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interaction Type *
                  </label>
                  <select
                    id="interactionType"
                    name="interactionType"
                    value={formData.interactionType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="">Select interaction type</option>
                    <option value="conversation">Conversation</option>
                    <option value="advice">Advice</option>
                    <option value="meeting">Meeting</option>
                    <option value="treatment">Treatment</option>
                    <option value="proposal">Proposal</option>
                    <option value="session">Session</option>
                  </select>
                </div>

                {/* Interaction Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date &amp; Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="interactionDate"
                    name="interactionDate"
                    value={formData.interactionDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Notes
              </h2>

              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                maxLength={2000}
                rows={4}
                placeholder="Add notes about this interaction..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.notes.length}/2000 characters
              </p>
            </div>

            {/* Audio Card */}
            <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Audio Recording
              </h2>
              <AudioManager transcriber={transcriber} />
            </div>

            {/* Transcript Card */}
            <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Transcript
              </h2>

              <textarea
                id="transcript"
                name="transcript"
                value={formData.transcript}
                onChange={handleChange}
                maxLength={5000}
                rows={4}
                placeholder="Add transcript or summary of the interaction..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.transcript.length}/5000 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href={`/app/interactions/${id}`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={submitting || deleting}
                >
                  Cancel
                </Button>
              </Link>
              <button
                type="submit"
                disabled={submitting || deleting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Delete Section */}
          <div className="mt-6 bg-white rounded-lg border border-red-100 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting || deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors text-sm"
            >
              <TrashIcon className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Interaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
