import type { NextFunction, Request, Response } from 'express';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../api/auth';

let auth: typeof import('../api/auth');

beforeAll(async () => {
  vi.stubEnv('JWT_SECRET', 'test-secret-that-is-at-least-32-characters');
  auth = await import('../api/auth');
});

const user: AuthUser = { id: 'EMP-1', name: 'Asha', email: 'asha@example.com', role: 'EMPLOYEE' };

function mockResponse() {
  const res = { statusCode: 200, body: undefined as unknown } as Response & { body: unknown };
  res.status = vi.fn((code: number) => Object.assign(res, { statusCode: code })) as never;
  res.json = vi.fn((body: unknown) => Object.assign(res, { body })) as never;
  return res;
}

describe('password verification', () => {
  it('accepts the right password for a bcrypt hash and rejects others', async () => {
    const hash = await auth.hashPassword('correct horse');
    expect(await auth.verifyPassword('correct horse', hash)).toEqual({ ok: true, needsRehash: false });
    expect(await auth.verifyPassword('wrong', hash)).toEqual({ ok: false, needsRehash: false });
  });

  it('accepts a legacy plaintext password once and flags it for re-hashing', async () => {
    expect(await auth.verifyPassword('password123', 'password123')).toEqual({ ok: true, needsRehash: true });
    expect(await auth.verifyPassword('password12', 'password123')).toEqual({ ok: false, needsRehash: false });
  });

  it('rejects missing passwords', async () => {
    expect((await auth.verifyPassword('', 'x')).ok).toBe(false);
    expect((await auth.verifyPassword('x', undefined)).ok).toBe(false);
  });
});

describe('toPublicUser', () => {
  it('drops the password field', () => {
    expect(auth.toPublicUser({ ...user, password: 'hash' })).toEqual(user);
  });
});

describe('requireAuth', () => {
  it('attaches the user for a valid token', () => {
    const req = { headers: { authorization: `Bearer ${auth.signToken(user)}` } } as Request;
    const next = vi.fn() as NextFunction;
    auth.requireAuth(req, mockResponse(), next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(user);
  });

  it.each([
    ['no header', undefined],
    ['legacy fake token', 'Bearer jwt_session_123'],
    ['wrong scheme', 'Basic abc'],
  ])('rejects %s with 401', (_label, authorization) => {
    const res = mockResponse();
    const next = vi.fn() as NextFunction;
    auth.requireAuth({ headers: { authorization } } as Request, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
});

describe('requireRole', () => {
  it('lets listed roles through and blocks others with 403', () => {
    const guard = auth.requireRole(...auth.MANAGEMENT_ROLES);

    const allowed = vi.fn() as NextFunction;
    guard({ user: { ...user, role: 'MANAGER' } } as Request, mockResponse(), allowed);
    expect(allowed).toHaveBeenCalled();

    const blocked = vi.fn() as NextFunction;
    const res = mockResponse();
    guard({ user } as Request, res, blocked);
    expect(blocked).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });
});
