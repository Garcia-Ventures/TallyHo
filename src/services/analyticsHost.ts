const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

/** True for loopback pages. OpenPanel must not be constructed there. */
export function isLocalAnalyticsHost(hostname: string | null | undefined): boolean {
  if (!hostname) {
    return false;
  }
  const host = hostname
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, '');
  return LOOPBACK_HOSTS.has(host) || host.endsWith('.localhost');
}

/** True when this page is served from a loopback host. Node and native have no page host. */
export function isLocalWebHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return isLocalAnalyticsHost(window.location?.hostname);
}
