'use client'

import React from 'react'
import { Button } from '../button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../card'
import { ConsultantCategory } from '@/types'
import { Star, DollarSign, Globe, Tag, Layers, CalendarCheck } from 'lucide-react'

// ── Filter shape ─────────────────────────────────────────────────────────────
export interface FilterState {
  category: ConsultantCategory | ''
  subSpecialization: string
  language: string
  minFee: string
  maxFee: string
  rating: string            // minimum star rating: '1'–'5' or ''
  availability: string      // '' | 'accepting'
}

export const DEFAULT_FILTERS: FilterState = {
  category: '',
  subSpecialization: '',
  language: '',
  minFee: '',
  maxFee: '',
  rating: '',
  availability: '',
}

const CATEGORIES: { label: string; value: ConsultantCategory }[] = [
  { label: 'Medical',       value: 'MEDICAL'       },
  { label: 'Legal',         value: 'LEGAL'         },
  { label: 'IT',            value: 'IT'            },
  { label: 'Physiotherapy', value: 'PHYSIOTHERAPY' },
  { label: 'Homeopathy',    value: 'HOMEOPATHY'    },
  { label: 'Astrology',     value: 'ASTROLOGY'     },
  { label: 'Other',         value: 'OTHER'         },
]

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
  'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam',
]

const STAR_OPTIONS = [5, 4, 3, 2, 1]

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-indigo-500">{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-slate-100" />
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ConsultantFilterCardProps {
  filters: FilterState
  onChange: (updated: FilterState) => void
}

export default function ConsultantFilterCard({ filters, onChange }: ConsultantFilterCardProps) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value })

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-800">Filters</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Narrow down consultants
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-4">

        {/* ── Category ─────────────────────────────────────────────────── */}
        <FilterSection icon={<Layers size={13} />} title="Category">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(({ label, value }) => {
              const active = filters.category === value
              return (
                <button
                  key={value}
                  onClick={() => set('category', active ? '' : value)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all border ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </FilterSection>

        <Divider />

        {/* ── Sub-specialization (tag search) ──────────────────────────── */}
        <FilterSection icon={<Tag size={13} />} title="Specialization / Tag">
          <input
            id="filter-sub-spec"
            type="text"
            placeholder="e.g. Orthopaedics, Tax Law…"
            value={filters.subSpecialization}
            onChange={(e) => set('subSpecialization', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </FilterSection>

        <Divider />

        {/* ── Language ─────────────────────────────────────────────────── */}
        <FilterSection icon={<Globe size={13} />} title="Language">
          <select
            id="filter-language"
            value={filters.language}
            onChange={(e) => set('language', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition appearance-none cursor-pointer"
          >
            <option value="">Any language</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </FilterSection>

        <Divider />

        {/* ── Consultation Fee ─────────────────────────────────────────── */}
        <FilterSection icon={<DollarSign size={13} />} title="Consultation Fee (₹)">
          <div className="flex items-center gap-2">
            <input
              id="filter-min-fee"
              type="number"
              min={0}
              placeholder="Min"
              value={filters.minFee}
              onChange={(e) => set('minFee', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <span className="text-slate-400 text-xs shrink-0">—</span>
            <input
              id="filter-max-fee"
              type="number"
              min={0}
              placeholder="Max"
              value={filters.maxFee}
              onChange={(e) => set('maxFee', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>
        </FilterSection>

        <Divider />

        {/* ── Minimum Rating ───────────────────────────────────────────── */}
        <FilterSection icon={<Star size={13} />} title="Minimum Rating">
          <div className="flex gap-1.5">
            {STAR_OPTIONS.map((n) => {
              const active = filters.rating === String(n)
              return (
                <button
                  key={n}
                  id={`filter-rating-${n}`}
                  onClick={() => set('rating', active ? '' : String(n))}
                  title={`${n} stars & above`}
                  className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium border transition-all ${
                    active
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                  }`}
                >
                  <Star
                    size={10}
                    className={active ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}
                  />
                  {n}+
                </button>
              )
            })}
          </div>
        </FilterSection>

        <Divider />

        {/* ── Availability ─────────────────────────────────────────────── */}
        <FilterSection icon={<CalendarCheck size={13} />} title="Availability">
          <label
            htmlFor="filter-availability"
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative">
              <input
                id="filter-availability"
                type="checkbox"
                checked={filters.availability === 'accepting'}
                onChange={(e) =>
                  set('availability', e.target.checked ? 'accepting' : '')
                }
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 rounded-full peer-checked:bg-indigo-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
              Accepting new clients only
            </span>
          </label>
        </FilterSection>

      </CardContent>

      <CardFooter className="pt-2 px-4 pb-4">
        <Button
          variant="outline"
          className="w-full text-xs h-8 rounded-lg border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-40"
          onClick={() => onChange(DEFAULT_FILTERS)}
          disabled={!hasActiveFilters}
        >
          {hasActiveFilters ? 'Clear Filters' : 'No Active Filters'}
        </Button>
      </CardFooter>
    </Card>
  )
}
