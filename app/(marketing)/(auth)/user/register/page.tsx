"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkPasswordStrength, type PasswordStrengthResult } from "@/lib/passwordStrength";
import { professionTags } from "@/types";
import { fileUploadSchema } from "@/schemas/documentSchema";
import { X, Paperclip } from "lucide-react";
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

const toggleableTags = professionTags.filter((t) => t.id !== "all");

export default function SignupPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docError, setDocError] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (!tag) return;
    if (!customTags.includes(tag) && !selectedTags.includes(tag)) {
      setCustomTags((prev) => [...prev, tag]);
    }
    setCustomTag("");
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    bio: "",
    category: "",
    nameOfConsultancy: "",
    designation: "",
    yearsOfExperience: "",
    appointmentFee: "",
    address: "",
    city: "",
    state: "",
    country: "",
    timezone: "",
    website: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % professions.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setDocError(null);
    const errors: string[] = [];
    const valid: File[] = [];
    for (const file of selected) {
      const res = fileUploadSchema.safeParse({ file });
      if (!res.success) {
        errors.push(`${file.name}: ${res.error?.message ?? "Invalid file"}`);
      } else {
        // Avoid duplicates by name
        if (!docFiles.some((f) => f.name === file.name && f.size === file.size)) {
          valid.push(file);
        }
      }
    }
    if (errors.length > 0) setDocError(errors.join(" · "));
    if (valid.length > 0) setDocFiles((prev) => [...prev, ...valid]);
    // Reset input so the same file can be re-added if removed
    e.target.value = "";
  };

  const removeDoc = (index: number) => {
    setDocFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const allTags = [...selectedTags, ...customTags];
    try {
      // Build multipart payload so the resume File is included
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      fd.append("consultationFee", String(Number(formData.appointmentFee)));
      fd.append("yearsOfExperience", String(Number(formData.yearsOfExperience)));
      fd.append("consultantTags", JSON.stringify(allTags));
      // Append all verification docs under the same key "docs"
      for (const file of docFiles) fd.append("docs", file);
      const response = await fetch("/api/user/auth/register", {
        method: "POST",
        body: fd,
      });
      if (response.ok) {
        alert("Registration successful!");
        setFormData({
          fullName: "", email: "", phone: "", password: "", dob: "", bio: "",
          category: "",
          nameOfConsultancy: "", designation: "", yearsOfExperience: "",
          appointmentFee: "", address: "", city: "", state: "", country: "", timezone: "",
          website: "", linkedinUrl: "", portfolioUrl: "",
        });
        setDocFiles([]);
        setSelectedTags([]);
        setCustomTags([]);
      } else {
        const error = await response.json();
        if (error.errors) {
          const fieldErrors = Object.entries(error.errors.fieldErrors || {})
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join("\n");
          alert(`Registration failed:\n${fieldErrors || JSON.stringify(error.errors)}`);
        } else {
          alert(error.message || "Registration failed. Please try again.");
        }
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
      <div className="grid min-h-screen lg:grid-cols-[25%_75%]">

        {/* Left Section — reduced panel */}
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
              <div className="absolute bottom-12 left-8 max-w-xs text-white">
                <h2 className="mb-2 text-2xl font-bold">{item.title}</h2>
                <p className="text-sm text-gray-200">{item.subtitle}</p>
              </div>
            </div>
          ))}

          <div className="absolute bottom-6 left-8 z-10 flex gap-2">
            {professions.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center bg-white p-4">
          <div className="w-full max-w-5xl">
            <Link href="/" aria-label="home" className="flex items-center space-x-2">
              <span className="bg-linear-to-r select-none font-bold text-3xl from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ayushman.
              </span>
            </Link>
            <h2 className="mb-1 text-xl font-bold">Consultant Signup</h2>
            <p className="mb-4 text-gray-600 text-sm">Tell us about your consultancy services</p>

            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="fullName" placeholder="Enter your full name"
                      value={formData.fullName} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" placeholder="Enter your email"
                      value={formData.email} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" name="phone" placeholder="Enter your phone number"
                      value={formData.phone} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Professional Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value="" disabled>Select a category</option>
                      <option value="MEDICAL">Medical</option>
                      <option value="LEGAL">Legal</option>
                      <option value="IT">IT / Software</option>
                      <option value="PHYSIOTHERAPY">Physiotherapy</option>
                      <option value="HOMEOPATHY">Homeopathy</option>
                      <option value="ASTROLOGY">Astrology</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Consultancy Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultancy Name</label>
                    <input type="text" name="nameOfConsultancy" placeholder="Enter your consultancy name"
                      value={formData.nameOfConsultancy} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input type="text" name="designation" placeholder="e.g. Senior Cardiologist"
                      value={formData.designation} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input type="number" name="yearsOfExperience" placeholder="e.g. 5" min={0} max={60}
                      value={formData.yearsOfExperience} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Appointment Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Fee (₹)</label>
                    <input type="number" name="appointmentFee" placeholder="e.g. 500" min={0}
                      value={formData.appointmentFee} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>



                  {/* Bio — full width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea name="bio" placeholder="Write a short professional bio."
                      value={formData.bio} rows={3} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" name="city" placeholder="Enter your city"
                      value={formData.city} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input type="text" name="state" placeholder="Enter your state"
                      value={formData.state} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" name="country" placeholder="Enter your country"
                      value={formData.country} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select name="timezone" value={formData.timezone} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value="" disabled>Select timezone</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Chicago">America/Chicago (CST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                      <option value="Pacific/Auckland">Pacific/Auckland (NZST)</option>
                    </select>
                  </div>

                  {/* Address — full width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <textarea name="address" placeholder="Enter your address"
                      value={formData.address} rows={2} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* ── Online Presence ── */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input type="url" name="website" placeholder="https://yourwebsite.com"
                      value={formData.website} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input type="url" name="linkedinUrl" placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedinUrl} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input type="url" name="portfolioUrl" placeholder="https://yourportfolio.com"
                      value={formData.portfolioUrl} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Verification Docs upload (multiple) */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Documents
                      <span className="text-gray-400 text-xs ml-1">(optional · PDF/DOC/DOCX/PNG/JPG, max 10 MB each)</span>
                    </label>
                    <p className="text-xs text-gray-400 mb-2">Upload your resume, certificates, or any documents that prove your expertise and authenticity.</p>

                    {/* Drop zone / picker */}
                    <label className={`flex items-center gap-2 w-full px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                      docError
                        ? "border-red-400 bg-red-50 text-red-600"
                        : "border-gray-300 bg-white text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/40"
                    }`}>
                      <Paperclip className="size-4 shrink-0" />
                      <span className="text-sm">
                        {docFiles.length > 0 ? "Add more files…" : "Click to attach files…"}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                        onChange={handleDocChange}
                        className="sr-only"
                      />
                    </label>

                    {docError && (
                      <p className="mt-1 text-xs text-red-600">{docError}</p>
                    )}

                    {/* File chips */}
                    {docFiles.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-1">
                        {docFiles.map((file, idx) => (
                          <li key={idx} className="flex items-center justify-between gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700">
                            <span className="flex items-center gap-1.5 truncate">
                              <Paperclip className="size-3 shrink-0" />
                              <span className="truncate">{file.name}</span>
                              <span className="text-indigo-400 shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                            </span>
                            <button type="button" onClick={() => removeDoc(idx)}
                              aria-label={`Remove ${file.name}`}
                              className="shrink-0 hover:text-indigo-900 flex items-center gap-0.5">
                              <X className="size-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Tags — full width */}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialisation Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {toggleableTags.map((tag) => {
                        const active = selectedTags.includes(tag.id);
                        return (
                          <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                              active
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-gray-300 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                            }`}>
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Add a custom tag to enhance your appearance in the search results" value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <button type="button" onClick={addCustomTag}
                        className="px-3 py-2 rounded-md border border-indigo-500 bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition">
                        Add
                      </button>
                    </div>
                    {customTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customTags.map((tag) => (
                          <span key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                            {tag}
                            <button type="button" onClick={() => removeCustomTag(tag)}
                              aria-label={`Remove ${tag}`} className="hover:text-indigo-900">
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Password — full width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" placeholder="Enter a strong password"
                      value={formData.password} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {formData.password && passwordStrength && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i}
                              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                i < passwordStrength.score
                                  ? passwordStrength.strength === "weak" ? "bg-red-500"
                                    : passwordStrength.strength === "good" ? "bg-yellow-500"
                                    : "bg-green-500"
                                  : "bg-gray-200"
                              }`} />
                          ))}
                        </div>
                        <span className={`text-sm font-medium ${
                          passwordStrength.strength === "weak" ? "text-red-600"
                            : passwordStrength.strength === "good" ? "text-yellow-600"
                            : "text-green-600"
                        }`}>
                          Password Strength: <span className="capitalize">{passwordStrength.strength}</span>
                        </span>
                      </div>
                    )}
                  </div>







                </div>

                <Button type="submit" disabled={isLoading} className="w-full font-medium py-2 px-4 rounded-md transition">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Card>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/user/login" className="font-bold hover:underline">Sign in</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}