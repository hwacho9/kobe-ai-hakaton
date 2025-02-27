// Mock auth data for testing
import { LoginResponse, User } from "@/types/auth";

// Mock test user
export const testUser: User = {
    userId: "test-user-id",
    username: "testuser",
    email: "test@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: [],
};

// Mock login response
export const mockLoginResponse: LoginResponse = {
    access_token: "mock_access_token",
    token_type: "bearer",
    user: testUser,
};

// Test credentials - these should be used for testing login functionality
export const testCredentials = {
    email: "test@example.com",
    password: "testpassword123",
    description:
        "このテストアカウントはログイン機能をテストするために使用できます。",
};
