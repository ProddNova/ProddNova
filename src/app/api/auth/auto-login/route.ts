import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/server/session';
import { createToken, defaultUserCredentials, hashPassword } from '@/lib/server/auth';
import { extractId, findUserByUsername, insertUser } from '@/lib/server/mongodb-data-api';

export async function POST() {
  try {
    let user = await findUserByUsername(defaultUserCredentials.username);

    if (!user) {
      const insertedId = await insertUser({
        username: defaultUserCredentials.username,
        passwordHash: hashPassword(defaultUserCredentials.password),
        createdAt: new Date().toISOString(),
      });

      user = {
        _id: insertedId,
        username: defaultUserCredentials.username,
        passwordHash: hashPassword(defaultUserCredentials.password),
        createdAt: new Date().toISOString()
      };
    }

    const token = createToken({ sub: extractId(user._id), username: user.username });
    const response = NextResponse.json({ ok: true, user: { id: extractId(user._id), username: user.username } });
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Auto login failed' }, { status: 500 });
  }
}
