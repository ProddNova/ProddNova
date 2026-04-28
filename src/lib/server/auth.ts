import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

type AuthPayload = {
  sub: string;
  username: string;
  exp: number;
};

const toBase64Url = (value: string) => Buffer.from(value).toString('base64url');
const fromBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const getSecret = () => process.env.AUTH_SECRET ?? 'dev-super-secret-change-me';

const sign = (payload: string) => createHmac('sha256', getSecret()).update(payload).digest('base64url');

export const createToken = ({ sub, username }: { sub: string; username: string }) => {
  const payload: AuthPayload = {
    sub,
    username,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyToken = (token: string): AuthPayload | null => {
  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AuthPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

export const hashPassword = (password: string) => createHmac('sha256', getSecret()).update(password).digest('hex');

export const isPasswordValid = (password: string, storedHash: string) => {
  const computed = hashPassword(password);
  const computedBuffer = Buffer.from(computed);
  const storedBuffer = Buffer.from(storedHash);
  return computedBuffer.length === storedBuffer.length && timingSafeEqual(computedBuffer, storedBuffer);
};

export const defaultUserCredentials = {
  username: 'jack',
  password: 'Giacomo090665'
};
