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
    permissions_count: number;
    created_at: string;
};

export type RoleFormData = {
    id: number;
    name: string;
    permissions: string[];
};

export type GroupedPermissions = Record<string, { id: number; name: string }[]>;

export type PermissionRow = {
    id: number;
    name: string;
    group: string | null;
    roles_count: number;
    created_at: string;
};

export type PermissionFormData = {
    id: number;
    name: string;
    group: string | null;
};

export type SettingFormData = {
    app_name: string;
    logo_path: string | null;
    favicon_path: string | null;
    primary_color: string | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string | null;
};

export type BackupRow = {
    name: string;
    path: string;
    size: string;
    date: string;
};

export type MediaFolderRow = {
    id: number;
    name: string;
};

export type MediaFileRow = {
    id: number;
    name: string;
    size: string;
    mime_type: string | null;
    url: string;
    created_at: string;
};

export type AuditLogRow = {
    id: number;
    description: string;
    causer: string | null;
    subject_type: string | null;
    created_at: string;
};

export type PaginatedData<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
};
