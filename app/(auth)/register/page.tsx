"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  userName: string;
  userEmail: string;
  userPhone: string;
  userPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ValidationError {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  errors?: ValidationError;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    userEmail: "",
    userPhone: "",
    userPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError("");
    setSuccessMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Handle validation errors from schema
          const formattedErrors: FormErrors = {};
          if (data.errors.fieldErrors) {
            Object.entries(data.errors.fieldErrors).forEach(
              ([field, messages]: [string, string[]]) => {
                formattedErrors[field] = messages[0] || "Validation error";
              }
            );
          }
          setErrors(formattedErrors);
        } else if (data.message) {
          setGeneralError(data.message);
        } else {
          setGeneralError("Registration failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success
      setSuccessMessage("Registration successful! Redirecting to dashboard...");
      setFormData({
        userName: "",
        userEmail: "",
        userPhone: "",
        userPassword: "",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setGeneralError(
        "An error occurred during registration. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Join us to get started
        </p>

        {generalError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {generalError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.userName ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.userName && (
              <p className="mt-1 text-sm text-red-600">{errors.userName}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="userEmail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="userEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.userEmail ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.userEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.userEmail}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="userPhone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="userPhone"
              name="userPhone"
              value={formData.userPhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.userPhone ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.userPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.userPhone}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="userPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="userPassword"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.userPassword ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.userPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.userPassword}</p>
            )}
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p className="font-medium">Password must contain:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (!@#$%^&*...)</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
