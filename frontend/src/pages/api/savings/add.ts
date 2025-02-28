import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // 요청 메소드가 POST가 아닌 경우 405 에러 반환
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const token = req.headers.authorization;

        // 토큰이 없는 경우
        if (!token) {
            return res.status(401).json({ message: "인증 토큰이 없습니다" });
        }

        const backendUrl =
            process.env.BACKEND_API_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/savings/add`, {
            method: "POST",
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        // 백엔드 API에서 반환한 상태 코드와 데이터를 그대로 반환
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Error proxying to backend:", error);
        return res.status(500).json({ message: "서버 에러가 발생했습니다" });
    }
}
