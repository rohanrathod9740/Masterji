"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkPasswordStrength, type PasswordStrengthResult } from "@/lib/passwordStrength";
import Link from "next/link";

const professions = [
  {
    title: "Healthcare Professionals",
    subtitle: "Connect with experienced doctors and medical specialists.",
    image: "/assets/doctor.jpeg",
  },
  {
    title: "Legal Experts",
    subtitle: "Find trusted lawyers for legal consultation and guidance.",
    image: "/assets/law.jpeg",
  },
  {
    title: "IT Consultants",
    subtitle: "Hire technology experts for digital transformation.",
    image: "/assets/it.jpeg",
  },
];

export default function SignupPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    type: "it",
    nameOfConsultancy: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % professions.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement| HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Calculate password strength when password field changes
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Registration successful!");
        setFormData({ name: "", email: "", phone: "", dob: "", type: "it", nameOfConsultancy: "", address: "", password: "" });
      } else {
        const error = await response.json();
        alert(error.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[30%_60%]">
        {/* Left Section */}
        <div className="relative hidden lg:block overflow-hidden">
          {professions.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-indigo-900/50 to-transparent" />

              <div className="absolute bottom-16 left-12 max-w-lg text-white">
                <h2 className="mb-4 text-3xl font-bold">
                  {item.title}
                </h2>
                <p className="text-lg text-gray-200">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* Slider Indicators */}
          <div className="absolute bottom-8 left-12 z-10 flex gap-3">
            {professions.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-3 rounded-full transition-all ${
                  currentSlide === idx
                    ? "w-8 bg-white"
                    : "w-3 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center bg-white p-3">

          <div className="w-full max-w-md">
            <Link
              href="/"
              aria-label="home"
              className="flex items-center space-x-2">
              <span className="bg-linear-to-r select-none font-bold text-4xl from-blue-600 to-purple-600 bg-clip-text text-transparent">
                   Ayushman.
              </span>
            </Link>
            <h2 className="mb-4 text-xl font-bold">
              Consultant Signup
            </h2>
            <p className="mb-6 text-gray-600">
              Tell us about your consultancy services
            </p>
          <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="it">IT Consultant</option>
                  <option value="healthcare">Healthcare Professional</option>
                  <option value="legal">Legal Expert</option>
                  <option value="realestate">Real Estate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Consultancy Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultancy Name
                </label>
                <input
                  type="text"
                  name="nameOfConsultancy"
                  placeholder="Enter your consultancy name"
                  value={formData.nameOfConsultancy}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                {/* Password Strength Indicator */}
                {formData.password && passwordStrength && (
                  <div className="mt-3 space-y-2">
                    {/* Strength Bar */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength.score
                              ? passwordStrength.strength === "weak"
                                ? "bg-red-500"
                                : passwordStrength.strength === "good"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Strength Text */}
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        passwordStrength.strength === "weak"
                          ? "text-red-600"
                          : passwordStrength.strength === "good"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}>
                        Password Strength: <span className="capitalize">{passwordStrength.strength}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  rows={4}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-medium py-2 px-4 rounded-md transition"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Card> 

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/user/login" className="font-bold hover:underline">
                Sign in
              </a>
              <br/>

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}