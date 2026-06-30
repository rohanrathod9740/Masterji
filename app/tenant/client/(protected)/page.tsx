'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SectionNav from '@/components/ui/client/SectionNav'
import ConsultantsCard from '@/components/ui/client/ConsultantsCard'
import ConsultantProfileCard, { ConsultantProfileData } from '@/components/ui/client/ConsultantProfileCard'
import ConsultantFilterCard, { FilterState, DEFAULT_FILTERS } from '@/components/ui/client/ConsultantFilterCard'
import { ConsultantCardData, SECTION_TO_CATEGORY } from '@/types'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ── Skeleton card — mirrors the real ConsultantsCard proportions ────────────
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className ?? ''}`}
    />
  )
}

function ConsultantCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-2.5 px-3 pt-3 pb-2">
        {/* Avatar */}
        <Shimmer className="size-10 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-3.5 w-28" />
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-24" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 px-3 py-2.5 flex-1">
        {/* Rating row */}
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Shimmer key={i} className="size-3 rounded-sm" />
          ))}
          <Shimmer className="h-3 w-6 ml-1" />
          <Shimmer className="h-3 w-14" />
        </div>
        {/* Bio lines */}
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-4/5" />
        {/* Meta */}
        <div className="flex gap-3">
          <Shimmer className="h-3 w-14" />
          <Shimmer className="h-3 w-20" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
        <Shimmer className="h-3.5 w-16" />
        <div className="flex gap-2">
          <Shimmer className="h-7 w-20 rounded-lg" />
          <Shimmer className="h-7 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function ViewConsultants() {
  const router = useRouter()
  const [selectedSection, setSelectedSection] = useState('all')
  const [consultants, setConsultants] = useState<ConsultantCardData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeProfile, setActiveProfile] = useState<ConsultantProfileData | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<String | null>(null)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)


  // Fetch consultants dynamically based on selected section + category filter
  useEffect(() => {
    const controller = new AbortController()

    const fetchConsultants = async () => {
      setLoading(true)
      setError(null)
      try {
        const queryParams = new URLSearchParams()

        // Section-nav category takes precedence; filter card category applies when section is 'all'
        if (selectedSection !== 'all') {
          const mapped = SECTION_TO_CATEGORY[selectedSection]
          if (mapped) queryParams.append('category', mapped)
        } else if (filters.category) {
          queryParams.append('category', filters.category)
        }

        const qs = queryParams.toString()
        const res = await fetch(`/api/client/consultants${qs ? `?${qs}` : ''}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Failed to load consultants')
        const json = await res.json()
        setConsultants(json.data ?? [])
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    const timer = setTimeout(fetchConsultants, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [selectedSection, filters.category])

  const handleViewProfile = useCallback(async (id: string) => {
    // Show the panel immediately with list data while detail loads
    const listData = consultants.find((c) => c.id === id)
    if (listData) setActiveProfile(listData as ConsultantProfileData)
    setProfileLoading(true)
    setProfileError(null)
    try {
      const res = await fetch(`/api/client/consultants/${id}`)
      if (!res.ok) throw new Error('Failed to load profile')
      const json = await res.json()
      setActiveProfile(json.data)
    } catch (err) {
      console.error(err)
      setProfileError("Could not load full profile — showing limited info.")
      // Keep the list-card data visible on error
    } finally {
      setProfileLoading(false)
    }
  }, [consultants])

  const handleBookAppointment = useCallback((id: string) => {
    router.push(`/tenant/client/appointment/${id}`)
  }, [router])

  const closeProfile = useCallback(() => setActiveProfile(null), [])

  // Client-side filters applied on top of the server-fetched list
  const filtered = useMemo(() => {
    let result = consultants

    // Sub-specialization / tag text match
    if (filters.subSpecialization.trim()) {
      const q = filters.subSpecialization.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.specialties.some((s) => s.toLowerCase().includes(q)) ||
          (c.designation ?? '').toLowerCase().includes(q)
      )
    }

    // Language — stored in specialties/tags in this schema; best-effort match
    if (filters.language) {
      const lang = filters.language.toLowerCase()
      result = result.filter((c) =>
        c.specialties.some((s) => s.toLowerCase().includes(lang))
      )
    }

    // Fee range
    if (filters.minFee !== '') {
      const min = Number(filters.minFee)
      result = result.filter((c) => c.consultationFee >= min)
    }
    if (filters.maxFee !== '') {
      const max = Number(filters.maxFee)
      result = result.filter((c) => c.consultationFee <= max)
    }

    // Minimum rating
    if (filters.rating !== '') {
      const minRating = Number(filters.rating)
      result = result.filter((c) => c.ratingAvg >= minRating)
    }

    // Availability — NOTE: isAcceptingNewClients is not in ConsultantCardData;
    // this filter gracefully no-ops until the field is added to the card shape.
    // (availability filter is already sent server-side when we extend the API)

    return result
  }, [consultants, filters])

  return (
<div className="p-4">

        {/* Sidebar + content — full width, sidebar sticky on the left */}
        <div className="flex gap-6 items-start">

          <aside className="hidden lg:block w-80 shrink-0 sticky top-24">
            <ConsultantFilterCard
              filters={filters}
              onChange={setFilters}
            />
          </aside>



          <div className="flex-1">

          <div className="relative mb-6 max-w-3xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              id="consultant-search"
              type="search"
              placeholder="Search by name, role, location…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

            {loading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ConsultantCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="text-center text-red-500 py-12">{error}</p>
            )}

            {!loading && !error && filtered.length === 0 && (
              <p className="text-center text-slate-400 py-12">No consultants found.</p>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((consultant) => (
                  <ConsultantsCard
                    key={consultant.id}
                    consultant={consultant}
                    onBookAppointment={handleBookAppointment}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Profile slide-over ── */}
        {activeProfile && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              aria-hidden="true"
              onClick={closeProfile}
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label={`${activeProfile.fullName}'s profile`}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl overflow-y-auto"
            >
              {profileLoading && (
                <div className="absolute inset-x-0 top-0 h-1 bg-indigo-200 overflow-hidden">
                  <div className="h-full w-1/2 bg-indigo-500 animate-[slide_1s_ease-in-out_infinite]" />
                </div>
              )}
              <ConsultantProfileCard
                consultant={activeProfile}
                onClose={closeProfile}
                onBookAppointment={handleBookAppointment}
              />
            </aside>
          </>
        )}
      </div>
  )
}
