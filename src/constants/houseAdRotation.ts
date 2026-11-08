/**
 * Session rotation for house ads.
 * The first impression starts at a random slot. Each later impression
 * advances one step so a visit walks the portfolio instead of redrawing
 * the same card.
 */
let cursor = 0;
let started = false;

export function resetHouseAdRotation(): void {
  cursor = 0;
  started = false;
}

export function nextHouseAd<T>(ads: readonly T[], randomIndex: (length: number) => number): T {
  if (ads.length === 0) {
    throw new Error('House ad rotation requires at least one ad');
  }

  if (!started) {
    const index = randomIndex(ads.length);
    cursor = ((index % ads.length) + ads.length) % ads.length;
    started = true;
  } else {
    cursor = (cursor + 1) % ads.length;
  }

  return ads[cursor];
}
