'use client';

import {redirect} from 'next-intl/server';

export default function ClientRedirectPage() {
  redirect('/client');
}
