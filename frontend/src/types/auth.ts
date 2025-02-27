export interface User {
    userId: string;
    username: string;
    email: string;
    fullName?: string | null;
    profileImage?: string | null;
    createdAt: string;
    updatedAt: string;
    preferences?: string[];
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface RegisterResponse {
    email: string;
    username: string;
    userId: string;
    fullName: string | null;
    profileImage: string | null;
    createdAt: string;
    updatedAt: string;
    preferences: string[];
    access_token: string;
    token_type: string;
}

export interface UserAdditionalInfo {
    area: string;
    content_interests: string[];
    preferred_artists: string[];
}
