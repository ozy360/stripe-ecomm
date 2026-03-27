import { cookies } from 'next/headers';
import NavClient from './navClient';

export default async function Nav() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get('usersessionId')?.value;

  return <NavClient isLoggedIn={isLoggedIn} />;
}
