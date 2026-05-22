'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditInteractionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
            ? new Date(data.interactionDate).toISOString().split('T')[0]
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
      // Format the data for submission
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

  if (loading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-white">
        <h1 className="text-3xl font-bold mb-6">Edit Interaction</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interaction Type */}
          <div>
            <label htmlFor="interactionType" className="block text-sm font-medium text-gray-700 mb-1">
              Interaction Type *
            </label>
            <select
              id="interactionType"
              name="interactionType"
              value={formData.interactionType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label htmlFor="interactionDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="interactionDate"
              name="interactionDate"
              value={formData.interactionDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              maxLength={2000}
              rows={4}
              placeholder="Add notes about this interaction..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">{formData.notes.length}/2000 characters</p>
          </div>

          {/* Transcript */}
          <div>
            <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-1">
              Transcript
            </label>
            <textarea
              id="transcript"
              name="transcript"
              value={formData.transcript}
              onChange={handleChange}
              maxLength={5000}
              rows={6}
              placeholder="Add transcript of the interaction..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">{formData.transcript.length}/5000 characters</p>
          </div>

          {/* Audio URL */}
          <div>
            <label htmlFor="audioUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Audio URL
            </label>
            <input
              type="url"
              id="audioUrl"
              name="audioUrl"
              value={formData.audioUrl}
              onChange={handleChange}
              placeholder="https://example.com/audio.mp3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
