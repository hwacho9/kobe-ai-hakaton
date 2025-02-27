import { NextApiRequest, NextApiResponse } from "next";

// Use the service name as the hostname when running in Docker
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // Get token from request cookies or headers
        const authHeader = req.headers.authorization;
        const token =
            authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : null;

        if (!token) {
            console.error("API Route: No token provided");
            return res.status(401).json({ message: "Authentication required" });
        }

        console.log("API Route: Making request to backend with token");
        console.log("API Route: API_URL =", API_URL);

        // Call the backend API with the token
        const response = await fetch(`${API_URL}/api/events/upcoming`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        // Get the response data
        const data = await response.json();

        console.log("API Route: Backend response status:", response.status);

        // If the response is not ok, return the error
        if (!response.ok) {
            console.error("API Route: Backend error:", data);
            return res.status(response.status).json({
                message: "Backend API error",
                backendError: data,
            });
        }

        // Return the data
        return res.status(200).json(data);
    } catch (error) {
        console.error("API Route: Error fetching upcoming events:", error);
        return res.status(500).json({
            message: "Failed to fetch upcoming events",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
    }
}
