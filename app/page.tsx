import type { Metadata } from "next"
import { ChangelogPageContent } from "@/components/changelog-page-content"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Punchcard Changelog - Audit AI Product Updates",
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return <ChangelogPageContent page={1} />
}
