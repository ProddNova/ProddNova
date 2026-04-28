import { cookies } from 'next/headers';
import { verifyToken } from './auth';

export const AUTH_COOKIE_NAME = 'urbex_auth';

export const getSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
};
