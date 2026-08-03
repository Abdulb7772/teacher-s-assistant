"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Home } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy bg-hero-radial px-4 text-center">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="animate-float font-display text-8xl font-bold text-gradient-gold"
      >
        404
      </motion.p>
      <h1 className="mt-4 font-display text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-white/50">
        The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button icon={Home}>Back to Home</Button>
        </Link>
        <Link href="/course-outline">
          <Button variant="secondary" icon={BookOpen}>
            Visit Course Outline
          </Button>
        </Link>
      </div>
    </div>
  );
}
