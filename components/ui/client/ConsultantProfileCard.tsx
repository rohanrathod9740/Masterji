'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import {
  X,
  Star,
  MapPin,
  BadgeCheck,
  BriefcaseBusiness,
  IndianRupee,
  Globe,
  ExternalLink,
  Clock,
  Languages,
  Award,
  CalendarCheck,
  Sparkles,
  FileText,
} from 'lucide-react';

import LinkedIn from '@/components/brandIcons/LinkedIn';
import { cn } from '@/lib/utils';
import { ConsultantCardData } from '@/types';

// ── Extended profile type (superset of ConsultantCardData) ─────────────────
export type ConsultantProfileData = ConsultantCardData & {
  state?: string | null;
  timezone?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  languages?: { id: string; name: string }[];
  certifications?: {
    id: string;
    title: string;
    issuer: string;
    issuedAt?: string | null;
    expiresAt?: string | null;
    credentialUrl?: string | null;
  }[];
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    client: { fullName: string };  // mapped from ClientProfile.fullName on the server
  }[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'from-violet-500 to-indigo-600',
  'from-sky-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-purple-600',
] as const;

function avatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Sub-components ────────────────────────────────────────────────────────────
const StarRating = memo(function StarRating({
  rating,
  max = 5,
  size = 'md',
}: {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'transition-colors',
            size === 'sm' ? 'size-3' : 'size-4',
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-slate-300'
          )}
        />
      ))}
    </div>
  );
});

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
      {children}
    </h3>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-100">
      {label}
    </span>
  );
}

// ── Skeleton (loading state) ─────────────────────────────────────────────────
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      aria-hidden="true"
    />
  );
}

function ConsultantProfileSkeleton({
  standalone = false,
  className,
}: {
  standalone?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading consultant profile"
      className={cn(
        'relative flex flex-col bg-white',
        standalone
          ? 'rounded-2xl shadow-xl ring-1 ring-slate-200'
          : 'h-full overflow-y-auto',
        className
      )}
    >
      {/* Hero skeleton */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start gap-4">
          <SkeletonBlock className="size-20 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-5 w-1/2" />
            <SkeletonBlock className="h-4 w-1/3" />
            <SkeletonBlock className="h-4 w-2/5" />
            <SkeletonBlock className="h-3 w-3/4" />
            <SkeletonBlock className="h-4 w-1/4 mt-2" />
          </div>
        </div>

        {/* Quick stats strip skeleton */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 ring-1 ring-slate-100">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 py-3 px-2">
              <SkeletonBlock className="h-4 w-10" />
              <SkeletonBlock className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100 mx-6" />

      {/* Body sections skeleton */}
      <div className="flex flex-col gap-6 px-6 py-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-2/3" />
        </div>

        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-24" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonBlock key={i} className="h-5 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-4 w-1/2" />
        </div>
      </div>

      {/* Sticky footer skeleton */}
      <div className="sticky bottom-0 mt-auto border-t border-slate-100 bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-3 w-14" />
          </div>
          <SkeletonBlock className="h-10 w-44 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
type Props = {
  consultant?: ConsultantProfileData | null;
  onClose?: () => void;
  onBookAppointment?: (id: string) => void;
  /** Render as a full-page card (no slide-over close button) */
  standalone?: boolean;
  className?: string;
  /** Show skeleton loading state until backend data has arrived */
  isLoading?: boolean;
};

function ConsultantProfileCard({
  consultant,
  onClose,
  onBookAppointment,
  standalone = false,
  className,
  isLoading = false,
}: Props) {
  // Show skeleton while loading, or if no consultant data is available yet.
  if (isLoading || !consultant) {
    return <ConsultantProfileSkeleton standalone={standalone} className={className} />;
  }

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
    state,
    country,
    timezone,
    ratingAvg,
    ratingCount,
    specialties = [],
    consultationFee,
    featured,
    isVerified,
    website,
    linkedinUrl,
    portfolioUrl,
    languages = [],
    certifications = [],
    reviews = [],
  } = consultant;

  const initials = useMemo(() => getInitials(fullName), [fullName]);
  const gradient = useMemo(() => avatarGradient(fullName), [fullName]);
  const formattedFee = useMemo(
    () => consultationFee.toLocaleString('en-IN'),
    [consultationFee]
  );
  const roundedRating = Math.round(ratingAvg);

  return (
    <article
      className={cn(
        'relative flex flex-col bg-white',
        standalone
          ? 'rounded-2xl shadow-xl ring-1 ring-slate-200'
          : 'h-full overflow-y-auto',
        className
      )}
      aria-label={`Profile of ${fullName}`}
    >
      {/* Featured accent strip */}
      {featured && (
        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"
          aria-hidden="true"
        />
      )}

      {/* Close button (slide-over mode only) */}
      {!standalone && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm ring-1 ring-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <X className="size-4" />
        </button>
      )}

      {/* ════════════════════════════════════════
          HERO — avatar · name · badges · rating
      ════════════════════════════════════════ */}
      <header className={cn('px-6 pb-5', featured ? 'pt-7' : 'pt-6')}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {profilePhotoUrl ? (
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-slate-100 shadow-md">
              <Image
                src={profilePhotoUrl}
                alt={fullName}
                fill
                className="object-cover"
                sizes="80px"
                priority
              />
            </div>
          ) : (
            <div
              className={cn(
                'flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white text-2xl font-bold shadow-md',
                gradient
              )}
              aria-hidden="true"
            >
              {initials}
            </div>
          )}

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-slate-900 truncate">{fullName}</h2>
              {isVerified && (
                <BadgeCheck
                  className="size-5 shrink-0 text-indigo-500"
                  aria-label="Verified consultant"
                />
              )}
              {featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  <Sparkles className="size-3" aria-hidden="true" />
                  Featured
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-slate-600">{designation}</p>
            <p className="text-sm font-bold text-indigo-700">{nameOfConsultancy}</p>

            {headline && (
              <p className="mt-1 text-xs italic text-slate-400 line-clamp-2">{headline}</p>
            )}

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StarRating rating={roundedRating} size="md" />
              <span className="text-sm font-semibold text-slate-800">
                {ratingAvg.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">
                ({ratingCount} review{ratingCount !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 ring-1 ring-slate-100">
          <div className="flex flex-col items-center py-3 px-2">
            <span className="text-base font-bold text-slate-900">{yearsOfExperience}+</span>
            <span className="mt-0.5 text-[11px] text-slate-500">Yrs Exp.</span>
          </div>
          <div className="flex flex-col items-center py-3 px-2">
            <span className="flex items-center gap-0.5 text-base font-bold text-slate-900">
              <IndianRupee className="size-3.5" aria-hidden="true" />
              {formattedFee}
            </span>
            <span className="mt-0.5 text-[11px] text-slate-500">Per Session</span>
          </div>
          <div className="flex flex-col items-center py-3 px-2">
            <span className="text-base font-bold text-slate-900">{ratingAvg.toFixed(1)}</span>
            <span className="mt-0.5 text-[11px] text-slate-500">Avg. Rating</span>
          </div>
        </div>
      </header>

      <div className="h-px bg-slate-100 mx-6" />

      {/* ════════════════════════════════════════
          BODY — all detail sections
      ════════════════════════════════════════ */}
      <div className="flex flex-col gap-6 px-6 py-5">

        {/* About */}
        {bio && (
          <section aria-label="About">
            <SectionHeading>About</SectionHeading>
            <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{bio}</p>
          </section>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <section aria-label="Specialties">
            <SectionHeading>
              <BriefcaseBusiness className="size-3.5" aria-hidden="true" />
              Specialties
            </SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {specialties.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </section>
        )}

        {/* Location & Timezone */}
        <section aria-label="Location">
          <SectionHeading>
            <MapPin className="size-3.5" aria-hidden="true" />
            Location
          </SectionHeading>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
            <span>{[city, state, country].filter(Boolean).join(', ')}</span>
            {timezone && (
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="size-3.5" aria-hidden="true" />
                {timezone}
              </span>
            )}
          </div>
        </section>

        {/* Languages */}
        {languages.length > 0 && (
          <section aria-label="Languages">
            <SectionHeading>
              <Languages className="size-3.5" aria-hidden="true" />
              Languages
            </SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <span
                  key={lang.id}
                  className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100"
                >
                  {lang.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section aria-label="Certifications">
            <SectionHeading>
              <Award className="size-3.5" aria-hidden="true" />
              Certifications
            </SectionHeading>
            <ul className="space-y-3">
              {certifications.map((cert) => (
                <li
                  key={cert.id}
                  className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {cert.title}
                      </p>
                      <p className="text-xs text-slate-500">{cert.issuer}</p>
                      {cert.issuedAt && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          Issued{' '}
                          {new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric',
                          })}
                          {cert.expiresAt &&
                            ` · Expires ${new Date(cert.expiresAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })}`}
                        </p>
                      )}
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${cert.title} credential`}
                        className="shrink-0 flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50 transition-colors"
                      >
                        <ExternalLink className="size-3" aria-hidden="true" />
                        View
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Links — website · LinkedIn · portfolio */}
        {(website || linkedinUrl || portfolioUrl) && (
          <section aria-label="Links">
            <SectionHeading>
              <Globe className="size-3.5" aria-hidden="true" />
              Links
            </SectionHeading>
            <div className="flex flex-wrap gap-2">
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <Globe className="size-3.5 text-slate-500" aria-hidden="true" />
                  Website
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <LinkedIn aria-hidden="true" />
                  LinkedIn
                </a>
              )}
              {portfolioUrl && (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100 transition-colors"
                >
                  <FileText className="size-3.5" aria-hidden="true" />
                  Portfolio
                </a>
              )}
            </div>
          </section>
        )}

        {/* Client Reviews */}
        {reviews.length > 0 && (
          <section aria-label="Client reviews">
            <SectionHeading>
              <Star className="size-3.5" aria-hidden="true" />
              Client Reviews
            </SectionHeading>
            <ul className="space-y-3">
              {reviews.slice(0, 3).map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-800">
                      {review.client.fullName}
                    </span>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {review.comment}
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>

      {/* ════════════════════════════════════════
          STICKY FOOTER — fee + CTA
      ════════════════════════════════════════ */}
      <div className="sticky bottom-0 mt-auto border-t border-slate-100 bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="flex items-center gap-0.5 text-base font-bold text-slate-900">
              <IndianRupee className="size-4 text-slate-600" aria-hidden="true" />
              {formattedFee}
            </span>
            <span className="text-[11px] text-slate-400">per session</span>
          </div>

          <button
            type="button"
            id={`book-appointment-${id}`}
            onClick={() => onBookAppointment?.(id)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <CalendarCheck className="size-4" aria-hidden="true" />
            Book Appointment
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ConsultantProfileCard);