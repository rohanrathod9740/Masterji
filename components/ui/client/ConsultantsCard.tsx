'use client';

import { memo, useMemo } from 'react';
import { Star, MapPin, BadgeCheck, IndianRupee, BriefcaseBusiness } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { ConsultantCardData } from '@/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// ── Helpers ────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Deterministic pastel avatar background, keyed off the full name (not just
// the first two characters) so short names don't cluster on the same color.
const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-700',
] as const;

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const StarRating = memo(function StarRating({
  rating,
  max = 5,
}: {
  rating: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3 transition-colors',
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-slate-300'
          )}
        />
      ))}
    </div>
  );
});

// ── Types ──────────────────────────────────────────────────────────────────
type Props = {
  consultant: ConsultantCardData;
  onViewProfile?: (id: string) => void;
  onBookAppointment?: (id: string) => void;
  className?: string;
};

// ── Component ──────────────────────────────────────────────────────────────
function ConsultantsCard({ consultant, onViewProfile,onBookAppointment, className }: Props) {
  const {
    id,
    fullName,
    nameOfConsultancy,
    profilePhotoUrl,
    headline,
    bio,
    designation,
    yearsOfExperience,
    city,
    country,
    ratingAvg,
    ratingCount,
    specialties = [],
    consultationFee,
    featured,
    isVerified,
  } = consultant;
  const router = useRouter();

  // Avoid recomputing these on every re-render of the list (e.g. when a
  // sibling card's hover state triggers a parent update).
  const initials = useMemo(() => getInitials(fullName), [fullName]);
  const colorClass = useMemo(() => avatarColor(fullName), [fullName]);
  const visibleSpecialties = useMemo(() => specialties.slice(0, 4), [specialties]);
  const extraSpecialtyCount = specialties.length - visibleSpecialties.length;
  const formattedFee = useMemo(
    () => consultationFee.toLocaleString('en-IN'),
    [consultationFee]
  );

  return (
    <Card
      className={cn(
        'group relative flex flex-col  transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-100 hover:border-indigo-200',
        featured && 'border-amber-200',
        className
      )}
    >
      {/* Featured accent strip */}
      {featured && (
        <div
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"
          aria-hidden="true"
        />
      )}

      {/* ── Header: avatar + name + badges ── */}
      <CardHeader className="pb-0 px-3 pt-3 flex flex-row justify-between">
        <div className="flex items-start gap-2.5">
          {/* Avatar */}
          {profilePhotoUrl ? (
            <div className="relative size-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-100">
              <Image
                src={profilePhotoUrl}
                alt={fullName}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          ) : (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
                colorClass
              )}
              aria-hidden="true"
            >
              {initials}
            </div>
          )}

          {/* Name + designation + badges */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="truncate text-sm font-semibold text-slate-900">{fullName}</p>
              {isVerified && (
                <BadgeCheck
                  className="size-3.5 shrink-0 text-indigo-500"
                  aria-label="Verified consultant"
                />
              )}
              {featured && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  Featured
                </span>
              )}
            </div>
            <p className="word-wrap text-sm text-slate-500">
              {designation}
            </p>
            <p className="text-blue-800 font-bold text-sm">
                {nameOfConsultancy}
            </p>
            {headline && (
              <p className="mt-0.5 truncate text-xs italic text-slate-400">{headline}</p>
            )}
          </div>
        </div>
      </CardHeader>

      {/* ── Body ── */}
      <CardContent className="flex flex-col gap-2 px-3 py-2.5 flex-1">
        {/* Rating row */}
        <div className="flex items-center gap-1.5">
          <StarRating rating={Math.round(ratingAvg)} />
          <span className="text-xs font-semibold text-slate-800">{ratingAvg.toFixed(1)}</span>
          <span className="text-xs text-slate-400">
            ({ratingCount} review{ratingCount !== 1 ? 's' : ''})
          </span>
        </div>

        {/* Bio */}
        {bio && <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{bio}</p>}

        {/* Meta: experience + location */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BriefcaseBusiness className="size-3 text-slate-400" aria-hidden="true" />
            {yearsOfExperience}y exp
          </span>
          <span className="flex items-center gap-1">
            Website
            <MapPin className="size-3 text-slate-400" aria-hidden="true" />
            {city}, {country}
          </span>
        </div>

      </CardContent>

      {/* ── Footer: fee + CTA ── */}
      <CardFooter className="border-t border-slate-100 justify-between px-3 py-2 items-center">
        <div className="flex items-center gap-0.5 text-xs font-semibold text-slate-700">
          <IndianRupee className="size-3 text-slate-500" aria-hidden="true" />
          {formattedFee}
          <span className="ml-0.5 font-normal text-slate-400">/session</span>
        </div>
        <button
          type="button"
          onClick={() => onViewProfile?.(id)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md active:scale-[0.97]"
        >
          View profile
        </button>


        <button
          type="button"
          onClick={() => onBookAppointment?.(id)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md active:scale-[0.97]"
        >
          Book Appointment
        </button>

      </CardFooter>
    </Card>
  );
}

export default memo(ConsultantsCard);