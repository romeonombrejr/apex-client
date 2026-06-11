export type Role = 'admin' | 'staff' | 'client';

export type UserRow = {
    id: number;
    name: string;
    email: string;
    role: Role | null;
    created_at: string;
};

export type UserFormData = {
    id: number;
    name: string;
    email: string;
    role: Role | null;
};

export type RoleRow = {
    id: number;
    name: string;
    users_count: number;
    created_at: string;
};

export type RoleFormData = {
    id: number;
    name: string;
};
