export const SITE_NAME = "Who Owns Your DNA?";
export const SITE_SUBTITLE = "U.S. Genetics & Genomics Law and Policy Tracker";
export const REVIEW_DATE = "2026-08-31";
export const PUBLIC_SITE_URL = "https://whoownsyourdna.org";
export const REPOSITORY_URL = "https://github.com/sdhutchins/who-owns-your-dna";

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}` || "/";
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return "Not recorded";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function formatDateTime(value: string): string {
  const formattedDateTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
  return `${formattedDateTime} UTC`;
}

export function humanizeStatus(status: string): string {
  return status
    .split("-")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
