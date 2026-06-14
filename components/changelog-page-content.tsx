import Link from "next/link"
import { CopyEntryLink } from "@/components/copy-entry-link"
import Footer from "@/components/footer"
import Header from "@/components/header"
import {
  CHANGELOG_PAGE_SIZE,
  type ChangelogPage,
  getChangelogPath,
  getPagePath,
  getPaginatedChangelogs,
  getTotalChangelogPages,
} from "@/lib/changelog"
import { siteConfig } from "@/lib/site"
import { cn, formatDateString } from "@/lib/utils"

function getEntryId(url: string) {
  return `release-${url.split("/").filter(Boolean).at(-1) ?? "latest"}`
}

function getCanonicalEntryUrl(changelog: ChangelogPage) {
  return `${siteConfig.url}${getChangelogPath(changelog)}`
}

function getStructuredData(changelogs: ChangelogPage[], page: number) {
  const pagePath = getPagePath(page)

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.links.home}/#organization`,
        name: "Substantive AI, Inc.",
        alternateName: "Punchcard",
        url: siteConfig.links.home,
        logo: `${siteConfig.url}/punchcard-logo-dark.svg`,
      },
      {
        "@type": "WebPage",
        "@id": `${siteConfig.url}${pagePath}`,
        name: page === 1 ? siteConfig.name : `${siteConfig.name} - Page ${page}`,
        url: `${siteConfig.url}${pagePath}`,
        description: siteConfig.description,
        isPartOf: {
          "@id": `${siteConfig.url}/#website`,
        },
        publisher: {
          "@id": `${siteConfig.links.home}/#organization`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        publisher: {
          "@id": `${siteConfig.links.home}/#organization`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteConfig.url}${pagePath}#release-notes`,
        name:
          page === 1
            ? "Punchcard release notes"
            : `Punchcard release notes, page ${page}`,
        description:
          "Recent Punchcard product updates for audit AI, CoAudit, workpapers, request workflows, imports, sampling, and automation.",
        itemListElement: changelogs.map((changelog, index) => ({
          "@type": "ListItem",
          position: (page - 1) * CHANGELOG_PAGE_SIZE + index + 1,
          url: getCanonicalEntryUrl(changelog),
          item: {
            "@type": "TechArticle",
            "@id": getCanonicalEntryUrl(changelog),
            headline: changelog.data.title,
            description: changelog.data.description,
            datePublished: changelog.data.date,
            dateModified: changelog.data.date,
            keywords: changelog.data.tags?.join(", "),
            mainEntityOfPage: getCanonicalEntryUrl(changelog),
            publisher: {
              "@id": `${siteConfig.links.home}/#organization`,
            },
            about: [
              "Punchcard",
              "audit AI",
              "audit automation",
              "workpaper automation",
            ],
          },
        })),
      },
    ],
  }
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const hasNewer = currentPage > 1
  const hasOlder = currentPage < totalPages

  if (!hasNewer && !hasOlder) return null

  return (
    <nav
      aria-label="Changelog pagination"
      className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-8"
    >
      {hasNewer ? (
        <Link
          href={getPagePath(currentPage - 1)}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Newer updates
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {hasOlder ? (
        <Link
          href={getPagePath(currentPage + 1)}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Older updates
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  )
}

export function ChangelogPageContent({ page }: { page: number }) {
  const totalPages = getTotalChangelogPages()
  const changelogs = getPaginatedChangelogs(page)
  const structuredData = getStructuredData(changelogs, page)

  return (
    <div className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Header />

      <main className="mx-auto max-w-6xl px-6 pt-32 lg:px-10">
        <section className="mb-14 max-w-4xl">
          <div className="mb-4 text-sm font-medium text-muted-foreground">
            Changelog
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
            Punchcard product updates
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground text-balance">
            Release notes for Punchcard's audit AI platform, including CoAudit,
            workpaper automation, PBC request workflows, sampling reports, Excel
            imports, authentication, and platform reliability.
          </p>
          {page > 1 && (
            <p className="mt-5 text-sm font-medium text-muted-foreground">
              Page {page}
            </p>
          )}
        </section>

        <div className="relative">
          {changelogs.map((changelog, index) => {
            const MDX = changelog.data.body
            const formattedDate = formatDateString(changelog.data.date)
            const entryId = getEntryId(changelog.url)

            return (
              <article
                key={changelog.url}
                id={entryId}
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

                  <div className="relative z-0 min-w-0 pb-10 pl-0 md:pl-8">
                    <div
                      className={cn(
                        "absolute left-0 z-0 hidden w-px bg-border md:block",
                        index === 0 ? "top-4 h-[calc(100%-1rem)]" : "top-0 h-full"
                      )}
                    />

                    <div className="space-y-6">
                      <div className="relative z-10 flex flex-col gap-2">
                        <h2
                          itemProp="headline"
                          className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-2xl font-semibold leading-8 tracking-tight"
                        >
                          <Link
                            href={getChangelogPath(changelog)}
                            className="min-w-0 transition-colors hover:text-muted-foreground"
                          >
                            {changelog.data.title}
                          </Link>
                          <CopyEntryLink url={getCanonicalEntryUrl(changelog)} />
                        </h2>
                        {changelog.data.description && (
                          <p
                            itemProp="description"
                            className="text-muted-foreground text-balance"
                          >
                            {changelog.data.description}
                          </p>
                        )}

                        {changelog.data.tags &&
                          changelog.data.tags.length > 0 && (
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
            )
          })}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} />
      </main>
      <Footer />
    </div>
  )
}
