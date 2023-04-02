import {ReasonPhrases, StatusCodes} from 'http-status-codes';
import ServerTracker from 'services/ServerTracker';

export default async function redirect(req, res) {
  if (req.method !== 'GET') {
    res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .send(ReasonPhrases.METHOD_NOT_ALLOWED);
    return;
  }

  if (!req.query.href) {
    res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
    return;
  }

  ServerTracker.trackEvent({
    name: 'partner-referral',
    data: {href: req.query.href, name: 'redirect-6'},
    req
  }).catch((error) => {
    console.error('Failed to track redirect', error);
  });

  res.redirect(req.query.href);
}
