"use client"
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
  ActivityLogIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import SectionNav from "../../../../../components/ui/SectionNav";
import DashboardClient from "@/components/ui/DashboardClient";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { differenceInDays, formatDistanceToNow, format } from "date-fns";



function SectionHeader({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2 sm:mb-2.5">
      <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <Link
        href={href}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
      >
        View all
        <ArrowRightIcon className="w-3 h-3" />
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/user/login");

  return (
    <div className="pb-32 space-y-8">
      <DashboardClient />
    </div>

  )

}