"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranscriber } from "@/hooks/useTranscriber";
import Transcript from "@/components/ui/transcript";
import AudioManager from "@/components/ui/audio/audioManager";

type InteractionType = "conversation" | "advice" | "meeting" | "treatment" | "proposal" | "session";

interface FormData {
  interactionType: InteractionType | "";
  notes: string;
  audioUrl: string;
  transcript: string;
  interactionDate: string;
}

export default function AddInteractionPage() {
  const transcriber = useTranscriber();
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    interactionType: "",
    notes: "",
    audioUrl: "",
    transcript: "",
    interactionDate: new Date().toISOString().slice(0, 16),
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);

      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personId,
          interactionType: formData.interactionType || undefined,
          notes: formData.notes || undefined,
          audioUrl: formData.audioUrl || undefined,
          transcript: formData.transcript || undefined,
          interactionDate: formData.interactionDate
            ? new Date(formData.interactionDate).toISOString()
            : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to create interaction");
      }

      router.push(`/app/people/${personId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create interaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-populate transcript field when transcription completes
  useEffect(() => {
    if (transcriber.output?.text) {
      setFormData(prev => ({
        ...prev,
        transcript: transcriber.output!.text,
      }))
    }
  }, [transcriber.output])

  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className='flex-1'>
            <div className='flex items-center justify-between text-sm font-medium'>
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
          href={`/app/people/${personId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to person
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Add Interaction
        </h1>
        <p className="text-gray-600 mt-2">
          Record details about this interaction
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
        {/* Interaction Type Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Interaction Details
          </h2>

          <div className="space-y-4">
            {/* Interaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interaction Type
              </label>
              <select
                name="interactionType"
                value={formData.interactionType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Select interaction type (optional)</option>
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
                Date & Time
              </label>
              <input
                type="datetime-local"
                name="interactionDate"
                value={formData.interactionDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Defaults to current date and time
              </p>
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notes
          </h2>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add notes about this interaction..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Maximum 2000 characters
          </p>
        </div>

        {/* Audio Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Audio Recording
          </h2>

          <div>
            {/* <label className="block text-sm font-medium text-gray-700 mb-2"> */}
              {/* Audio URL */}
            {/* </label> */}
            {/* <input */}
               {/* type="url" */}
               {/* name="audioUrl" */}
               {/* value={formData.audioUrl} */}
               {/* onChange={handleInputChange} */}
               {/* placeholder="https://example.com/audio.mp3" */}
               {/* className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm" */}
            {/* <p className="text-xs text-gray-500 mt-1"> */}
              {/* Optional - URL of audio recording from this interaction */}
            {/* </p> */}
            <AudioManager transcriber={transcriber} />
          </div>
        </div>

        {/* Transcript Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Transcript
          </h2>

          <textarea
            name="transcript"
            value={formData.transcript}
            onChange={handleInputChange}
            placeholder="Add transcript or summary of the interaction..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Maximum 5000 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Link href={`/app/people/${personId}`} className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "Creating..." : "Add Interaction"}
          </button>
        </div>
      </form>
      </div>
    </div>
  </div>
  );
}
