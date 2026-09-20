import { defineEventHandler, getRequestURL, sendRedirect } from 'h3';
import deployment from '../../vercel.json';

// Vercel handles production redirects; mirror the same explicit map in dev/SSR.
const redirects = new Map(deployment.redirects.map(({ source, destination }) => [source, destination]));
export default defineEventHandler(event => {
  const url = getRequestURL(event);
  const destination = redirects.get(url.pathname.replace(/\/$/, ''));
  if (destination) return sendRedirect(event, destination + url.search, 308);
});
