'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranscriber } from '@/hooks/useTranscriber';
import AudioManager from '@/components/ui/audio/audioManager';

export default function EditPersonPage() {
  const transcriber = useTranscriber();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    tags: [] as string[],
    transcript: '',
  });

  // Fetch person data
  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const response = await fetch(`/api/people/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch person');
        }
        const data = await response.json();
        setFormData({
          name: data.name || '',
          type: data.type || '',
          email: data.email || '',
          phone: data.phone || '',
          tags: data.tags || [],
          transcript: data.transcript || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load person');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPerson();
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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim());
    setFormData((prev) => ({
      ...prev,
      tags,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Auto-populate transcript when transcription completes
    // (handled via useEffect below)

    try {
      const response = await fetch(`/api/people/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update person');
      }

      router.push(`/app/people/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update person');
    } finally {
      setSubmitting(false);
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
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-white">
        <div className='flex items-center justify-between text-sm font-medium mb-4'>
          <span>
            {transcriber.modelLoadingProgress === 0 && `Model not loaded`}
            {transcriber.isModeLoading && `Loading model`}
            {transcriber.modelLoadingProgress === 100 && `Model ready`}
          </span>
          <span>{transcriber.modelLoadingProgress.toFixed()}%</span>
        </div>
        <h1 className="text-3xl font-bold mb-6">Edit Person</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a type</option>
              <option value="client">Client</option>
              <option value="shishya">Shishya</option>
              <option value="patient">Patient</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="e.g., important, follow-up, vip"
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
              className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Audio Recording Card (outside form to avoid submit conflicts) */}
        <div className="mt-6 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio Recording</h2>
            <AudioManager transcriber={transcriber} />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Transcript</h2>
            <textarea
              value={formData.transcript}
              onChange={(e) => setFormData(prev => ({ ...prev, transcript: e.target.value }))}
              placeholder="Transcript will auto-fill after transcription, or add manually..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 5000 characters</p>
          </div>
        </div>
      </div>
      </div>
  );
}
