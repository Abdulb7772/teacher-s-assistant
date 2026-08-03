"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items = [] }: { items?: BreadcrumbItem[] }) {
  if (!items.length) return null;
  return (
    <nav className="flex items-center gap-1.5 text-xs text-white/45" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className="text-white/25" />}
          {item.to ? (
            <Link href={item.to} className="transition-colors hover:text-gold">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gold/80">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="mt-2 font-display text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/45">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </motion.div>
  );
}
