import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import Link from 'next/link';
import React from 'react';

export const dynamic = 'force-dynamic';

export default function Index(): React.ReactNode {
  const cookieStore: ReadonlyRequestCookies = cookies();
  const token = cookieStore.get('_k') as RequestCookie;

  return (
    <div>
      <Link href={`http://localhost:3000/k/${token && token.value}`}>TOKEN: {token && token.value}</Link>
    </div>
  );
}
