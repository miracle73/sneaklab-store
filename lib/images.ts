// Product imagery is served from size?'s Amplience CDN. Each product has an
// image code like "sz_803965" with per-angle suffixes (_a primary, _b alt).
// We build clean, resized URLs from the code so the DB stays compact.

const CDN = "https://i8.amplience.net/i/jpl";

export function amplienceUrl(
  code: string,
  { w = 700, qlt = 80 }: { w?: number; qlt?: number } = {}
): string {
  return `${CDN}/${code}?w=${w}&qlt=${qlt}&fmt=auto`;
}
