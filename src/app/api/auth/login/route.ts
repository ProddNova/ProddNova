import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/server/session';
import { createToken, isPasswordValid } from '@/lib/server/auth';
import { extractId, findUserByUsername } from '@/lib/server/mongodb-data-api';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = (await request.json()) as { username?: string; password?: string };
    if (!username || !password) {
      return NextResponse.json({ error: 'username and password are required' }, { status: 400 });
    }

    const user = await findUserByUsername(username);
    if (!user || !isPasswordValid(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Login failed' }, { status: 500 });
  }
}
