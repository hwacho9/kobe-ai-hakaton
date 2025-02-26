import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const LoginPage = () => {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [formErrors, setFormErrors] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
        clearError();
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = { ...formErrors };

        if (!formData.email) {
            newErrors.email = "이메일을 입력해주세요";
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "유효한 이메일 주소를 입력해주세요";
            valid = false;
        }

        if (!formData.password) {
            newErrors.password = "비밀번호를 입력해주세요";
            valid = false;
        }

        setFormErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await login(formData.email, formData.password);
            router.push("/");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        로그인
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        또는{" "}
                        <Link
                            href="/register"
                            className="font-medium text-blue-600 hover:text-blue-500">
                            새 계정 만들기
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            label="이메일 주소"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={formErrors.email}
                        />

                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            label="비밀번호"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={formErrors.password}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}>
                            로그인
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
