import {StatusCodes} from 'http-status-codes';
import {NextResponse} from 'next/server';
import ServerTracker from 'services/ServerTracker';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const href = searchParams.get('href');

  if (!href) {
    return new NextResponse(null, {status: StatusCodes.BAD_REQUEST});
  }

  // Ideally we'd do this in parallel, but the serverless function would
  // exit too early and the tracking therefore doesn't succeed.
  await ServerTracker.trackEvent({
    name: 'partner-referral',
    data: {href, name: 'redirect'},
    request
  }).catch((error) => {
    console.error('Failed to track redirect', error);
  });

  return NextResponse.redirect(href);
}
