"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PersonType = "client" | "shishya" | "patient" | "friend" | "other";
type InteractionType = "conversation" | "advice" | "meeting" | "treatment" | "proposal" | "session";

interface FormData {
  name: string;
  type: PersonType | "";
  email: string;
  phone: string;
  tags: string[];
  notes: string;
  audioUrl: string;
  interactionType: InteractionType | "";
}

export default function AddPersonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    email: "",
    phone: "",
    tags: [],
    notes: "",
    audioUrl: "",
    interactionType: "",
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setIsLoading(true);

      // Get current user to get userId
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        throw new Error("Failed to get user information");
      }
      const userData = await userRes.json();

      const response = await fetch("/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          name: formData.name,
          type: formData.type || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          notes: formData.notes || undefined,
          audioUrl: formData.audioUrl || undefined,
          interactionType: formData.interactionType || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create person");
      }

      router.push(`/app/people/${data.data.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create person"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4 sm:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link href="/app/people" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to people
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Add a new person
        </h1>
        <p className="text-gray-600 mt-2">
          Fill in the details to add someone to your network
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
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter person's name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Select a type</option>
                <option value="client">Client</option>
                <option value="patient">Patient</option>
                <option value="shishya">Shishya</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional - must be a valid email
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tags Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tags
          </h2>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag (e.g., VIP, Follow-up)"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                className="text-sm"
              >
                Add
              </Button>
            </div>

            {/* Display Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 group"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-blue-500 hover:text-blue-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            placeholder="Add any additional notes about this person..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Maximum 2000 characters
          </p>
        </div>

        {/* Interaction Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Initial Interaction
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

            {/* Audio URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio URL
              </label>
              <input
                type="url"
                name="audioUrl"
                value={formData.audioUrl}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional - URL of audio recording from this interaction
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Link href="/app/people" className="flex-1">
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
            {isLoading ? "Creating..." : "Create Person"}
          </button>
        </div>
      </form>
    </div>
  );
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
