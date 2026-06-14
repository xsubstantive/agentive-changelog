import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { CopyEntryLink } from "@/components/copy-entry-link"
import Footer from "@/components/footer"
import Header from "@/components/header"
import {
  getAllChangelogs,
  getChangelogBySlug,
  getChangelogPath,
  getChangelogSlug,
} from "@/lib/changelog"
import { siteConfig } from "@/lib/site"
import { cn, formatDateString } from "@/lib/utils"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

function getCanonicalEntryUrl(slug: string) {
  return `${siteConfig.url}/${slug}`
}

function getStructuredData(slug: string, changelog: NonNullable<ReturnType<typeof getChangelogBySlug>>) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": getCanonicalEntryUrl(slug),
    headline: changelog.data.title,
    description: changelog.data.description,
    datePublished: changelog.data.date,
    dateModified: changelog.data.date,
    keywords: changelog.data.tags?.join(", "),
    mainEntityOfPage: getCanonicalEntryUrl(slug),
    publisher: {
      "@type": "Organization",
      name: "Substantive AI, Inc.",
      alternateName: "Punchcard",
      url: siteConfig.links.home,
      logo: `${siteConfig.url}/punchcard-logo-dark.svg`,
    },
    about: ["Punchcard", "audit AI", "audit automation", "workpaper automation"],
  }
}

export function generateStaticParams() {
  return getAllChangelogs().map((changelog) => ({
    slug: getChangelogSlug(changelog),
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = (await params).slug
  const changelog = getChangelogBySlug(slug)

  if (!changelog) return {}

  return {
    title: changelog.data.title,
    description: changelog.data.description ?? siteConfig.description,
    alternates: {
      canonical: getChangelogPath(changelog),
    },
    openGraph: {
      title: changelog.data.title,
      description: changelog.data.description ?? siteConfig.description,
      url: getChangelogPath(changelog),
      type: "article",
      publishedTime: changelog.data.date,
      modifiedTime: changelog.data.date,
      tags: changelog.data.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: changelog.data.title,
      description: changelog.data.description ?? siteConfig.description,
    },
  }
}

export default async function ChangelogEntryPage({ params }: PageProps) {
  const slug = (await params).slug
  const changelog = getChangelogBySlug(slug)

  if (!changelog) {
    notFound()
  }

  const MDX = changelog.data.body
  const formattedDate = formatDateString(changelog.data.date)
  const canonicalUrl = getCanonicalEntryUrl(slug)
  const structuredData = getStructuredData(slug, changelog)

  return (
    <div className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <main className="mx-auto max-w-6xl px-6 pt-32 lg:px-10">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to changelog
          </Link>
        </div>

        <article
          className="relative scroll-mt-28"
          itemScope
          itemType="https://schema.org/TechArticle"
        >
          <div className="grid gap-y-6 md:grid-cols-[12rem_minmax(0,1fr)]">
            <div className="relative z-20 pb-10 pr-8">
              <div className="relative h-8 md:sticky md:top-28">
                <time
                  dateTime={changelog.data.date}
                  itemProp="datePublished"
                  className="flex h-8 items-center whitespace-nowrap text-sm font-medium text-muted-foreground"
                >
                  {formattedDate}
                </time>
                <div
                  aria-hidden="true"
                  className="absolute right-[-2rem] top-1/2 z-30 hidden size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.62_0_0)] md:block dark:bg-[oklch(0.64_0_0)]"
                />
              </div>
            </div>

            <div className="relative z-0 min-w-0 pb-10 md:pl-8">
              <div className="absolute left-0 top-4 z-0 hidden h-[calc(100%-1rem)] w-px bg-border md:block" />

              <div className="space-y-6">
                <div className="relative z-10 flex flex-col gap-2">
                  <h1
                    itemProp="headline"
                    className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-3xl font-semibold leading-8 tracking-tight"
                  >
                    <span className="min-w-0">{changelog.data.title}</span>
                    <CopyEntryLink url={canonicalUrl} />
                  </h1>
                  {changelog.data.description && (
                    <p
                      itemProp="description"
                      className="text-muted-foreground text-balance"
                    >
                      {changelog.data.description}
                    </p>
                  )}

                  {changelog.data.tags && changelog.data.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {changelog.data.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className={cn(
                            "flex h-6 w-fit items-center justify-center rounded-full border bg-muted px-2",
                            "text-xs font-medium text-muted-foreground"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="prose max-w-none prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-a:no-underline dark:prose-invert">
                  <MDX />
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
