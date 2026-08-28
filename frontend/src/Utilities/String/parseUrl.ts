import qs, { ParsedQs } from 'qs';

export interface ParsedUrl {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  isAbsolute: boolean;
  params: ParsedQs;
}

// See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils
const anchor = document.createElement('a');

export default function parseUrl(url: string): ParsedUrl {
  anchor.href = url;

  // The `origin`, `password`, and `username` properties are unavailable in
  // Opera Presto. We synthesize `origin` if it's not present. While `password`
  // and `username` are ignored intentionally.
  return {
    hash: anchor.hash,
    host: anchor.host,
    hostname: anchor.hostname,
    href: anchor.href,
    origin: anchor.origin,
    pathname: anchor.pathname,
    port: anchor.port,
    protocol: anchor.protocol,
    search: anchor.search,
    isAbsolute: /^[\w:]*\/\//.test(url),

    // Remove leading ? from querystring before parsing.
    params: anchor.search ? qs.parse(anchor.search.substring(1)) : {},
  };
}
