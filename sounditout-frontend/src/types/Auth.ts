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

import { GradeRange } from './Enums';

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    fullName: string;
    gradeRange: GradeRange;
    age: number;
    isAdmin: boolean;
}