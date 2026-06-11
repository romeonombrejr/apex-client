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
