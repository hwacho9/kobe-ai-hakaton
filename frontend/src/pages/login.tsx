import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/utils/stores/authStore";
import { testCredentials } from "@/utils/mockAuthData";

interface FormValues {
    email: string;
    password: string;
}

const LoginPage = () => {
    const router = useRouter();
    const { login, error, clearError, isLoading } = useAuthStore();
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [formValues, setFormValues] = useState<FormValues>({
        email: "",
        password: "",
    });
    const [formErrors, setFormErrors] = useState<Partial<FormValues>>({});
    const [touched, setTouched] = useState<
        Partial<Record<keyof FormValues, boolean>>
    >({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        // Clear errors when typing
        if (formErrors[name as keyof FormValues]) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name as keyof FormValues);
    };

    const validateField = (field: keyof FormValues) => {
        const newErrors = { ...formErrors };

        if (field === "email") {
            if (!formValues.email) {
                newErrors.email = "メールアドレスを入力してください";
            } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
                newErrors.email = "無効なメール形式です";
            } else {
                newErrors.email = undefined;
            }
        }

        if (field === "password") {
            if (!formValues.password) {
                newErrors.password = "パスワードを入力してください";
            } else {
                newErrors.password = undefined;
            }
        }

        setFormErrors(newErrors);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormValues> = {};
        let isValid = true;

        if (!formValues.email) {
            newErrors.email = "メールアドレスを入力してください";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
            newErrors.email = "無効なメール形式です";
            isValid = false;
        }

        if (!formValues.password) {
            newErrors.password = "パスワードを入力してください";
            isValid = false;
        }

        setFormErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const { success } = await login(formValues.email, formValues.password);
        if (success) {
            setLoginSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 2000);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    ログイン
                </h2>

                {loginSuccess && (
                    <div className="mb-4 rounded-md bg-green-100 p-4 text-green-700">
                        ログイン成功！リダイレクト中...
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
                        {error}
                        <button
                            className="ml-2 text-red-500 underline"
                            onClick={clearError}>
                            クリア
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            label="メール"
                            placeholder="メールアドレスを入力してください"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={formValues.email}
                            error={touched.email ? formErrors.email : undefined}
                        />
                    </div>

                    <div className="mb-6">
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            label="パスワード"
                            placeholder="パスワードを入力してください"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={formValues.password}
                            error={
                                touched.password
                                    ? formErrors.password
                                    : undefined
                            }
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isLoading}>
                        ログイン
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-gray-600">
                        アカウントをお持ちでない方は{" "}
                        <Link
                            href="/register"
                            className="text-blue-600 hover:underline">
                            会員登録
                        </Link>
                    </p>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <p className="text-center text-sm text-gray-600">
                        このテストアカウントはログイン機能をテストするために使用できます
                        <br />
                        メール: {testCredentials.email}
                        <br />
                        パスワード: {testCredentials.password}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
