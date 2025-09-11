// src/types/auth.ts (or wherever your current file lives)

import { jwtDecode } from 'jwt-decode';
import { GradeRange } from './Enums';

// ---------- Existing types ----------
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}

export const getUserRole = (roles: string[]): 'admin' | 'student' | 'unknown' => {
    if (roles.includes('ROLE_ADMIN')) return 'admin';
    if (roles.includes('ROLE_STUDENT')) return 'student';
    return 'unknown';
};

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    fullName: string;
    gradeRange: GradeRange;
    age: number;
    isAdmin: boolean;
}

// ---------- Added: JWT helpers ----------
export type JwtPayload = {
    sub: string;           // email (subject)
    role?: string;         // "STUDENT" | "ADMIN" | "ROLE_STUDENT" | "ROLE_ADMIN"
    exp?: number;          // epoch seconds
    [key: string]: any;    // allow extra claims
};

const TOKEN_KEY = 'token';

// Storage
export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// If you ever need to manually add the header (your axios interceptor already does this)
export function getAuthHeader() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
}

// Decode & checks
export function decodeToken(): JwtPayload | null {
    const token = getToken();
    if (!token) return null;
    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return null;
    }
}

export function isExpired(payload: JwtPayload | null): boolean {
    if (!payload?.exp) return false; // if no exp, treat as non-expiring
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
}

export function isLoggedIn(): boolean {
    const p = decodeToken();
    return !!p && !isExpired(p);
}

export function getEmail(): string | null {
    const p = decodeToken();
    return p?.sub ?? null;
}

/**
 * Normalizes role from JWT claim to 'STUDENT' | 'ADMIN' | null
 * Accepts both 'ROLE_STUDENT' and 'STUDENT' formats.
 */
export function getRole(): 'STUDENT' | 'ADMIN' | null {
    const p = decodeToken();
    if (!p?.role) return null;
    const r = p.role.toUpperCase();
    if (r.endsWith('ADMIN')) return 'ADMIN';
    if (r.endsWith('STUDENT')) return 'STUDENT';
    return null;
}

export function hasRole(role: 'STUDENT' | 'ADMIN'): boolean {
    return getRole() === role;
}

export function isStudent(): boolean {
    return hasRole('STUDENT');
}

export function isAdmin(): boolean {
    return hasRole('ADMIN');
}
