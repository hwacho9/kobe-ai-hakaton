# Fan Event Prediction Frontend

## Authentication System

This frontend application includes a complete authentication system with the following features:

-   User Registration
-   User Login
-   Authentication state persistence
-   Protected routes for authenticated users

## Testing Authentication

### Test Credentials

To test the login functionality, use the following credentials:

-   **Email**: test@example.com
-   **Password**: testpassword123

### Known Issues

1. The backend registration API currently returns a 500 Internal Server Error when attempting to register new users. This is likely due to Cosmos DB configuration issues.

2. The backend login API returns a JWT token but does not return user information. The frontend creates mock user data when a user logs in successfully.

3. The API response format differs from what the frontend initially expected. The following changes were made to accommodate this:
    - The frontend now expects `access_token` instead of `token`
    - Error messages are read from `detail` instead of `message`
    - Mock user data is generated since the backend doesn't provide it

## Development Notes

### Error Handling

-   The application now handles non-JSON responses better
-   Authentication error messages are displayed to the user

### Data Flow

1. User submits login/register form
2. Frontend validates input data
3. Request is sent to backend API
4. On success, token is stored and user is redirected to home page
5. On failure, error message is displayed

### Future Improvements

-   Modify backend to return user information with token
-   Implement password reset functionality
-   Add email verification process
-   Implement social login options
-   Add user profile page

## Running the Application

The application is containerized with Docker. Use the following commands to run it:

```bash
docker-compose up -d
```

The frontend will be available at http://localhost:3000.
