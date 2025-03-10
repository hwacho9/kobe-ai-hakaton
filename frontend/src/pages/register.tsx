import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { testCredentials } from "@/utils/mockAuthData";
import Header from "../components/RegisterHeader";

interface FormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const router = useRouter();
  const { register, error, clearError, isLoading } = useAuthStore();
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (field === "username") {
      if (!formValues.username) {
        newErrors.username = "ユーザー名を入力してください";
      } else if (formValues.username.length < 3) {
        newErrors.username = "ユーザー名は3文字以上である必要があります";
      } else {
        newErrors.username = undefined;
      }
    }

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
      } else if (formValues.password.length < 8) {
        newErrors.password = "パスワードは8文字以上である必要があります";
      } else {
        newErrors.password = undefined;
      }
    }

    if (field === "confirmPassword") {
      if (!formValues.confirmPassword) {
        newErrors.confirmPassword = "パスワードを確認してください";
      } else if (formValues.confirmPassword !== formValues.password) {
        newErrors.confirmPassword = "パスワードが一致しません";
      } else {
        newErrors.confirmPassword = undefined;
      }
    }

    setFormErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormValues> = {};
    let isValid = true;

    if (!formValues.username) {
      newErrors.username = "ユーザー名を入力してください";
      isValid = false;
    } else if (formValues.username.length < 3) {
      newErrors.username = "ユーザー名は3文字以上である必要があります";
      isValid = false;
    }

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
    } else if (formValues.password.length < 8) {
      newErrors.password = "パスワードは8文字以上である必要があります";
      isValid = false;
    }

    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = "パスワードを確認してください";
      isValid = false;
    } else if (formValues.confirmPassword !== formValues.password) {
      newErrors.confirmPassword = "パスワードが一致しません";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const isValid = Object.keys(formValues).every((key) => {
      const fieldKey = key as keyof FormValues;
      validateField(fieldKey);
      return !formErrors[fieldKey];
    });

    if (!isValid) {
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(formValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);
      return;
    }

    // Clear any previous errors
    clearError();

    // Submit the form
    const result = await register(
      formValues.username,
      formValues.email,
      formValues.password
    );

    if (result.success) {
      setRegisterSuccess(true);
      // Redirect to next step after registration
      setTimeout(() => {
        router.push("/register-info");
      }, 2000);
    }
  };

  return (
    // 全画面を黒背景＋白文字で
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      {/* アイコンなどを中央上部に配置したければここで <img src="..."/> などを配置 */}
      <div className="w-full max-w-sm">
        {/* タイトル */}
        <Header username="" />
        <h2 className="text-center text-lg font-bold mb-6">
          アカウントを作成する
        </h2>

        {/* 登録成功メッセージ */}
        {registerSuccess && (
          <div className="mb-4 rounded bg-green-600 p-3 text-center text-sm">
            登録成功！リダイレクト中...
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 rounded bg-red-600 p-3 text-center text-sm">
            {error}
            <button
              className="ml-2 text-red-200 underline"
              onClick={clearError}
            >
              クリア
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ユーザー名 */}
          <Input
            id="username"
            name="username"
            type="text"
            label="ユーザー名"
            placeholder="ユーザー名を入力してください"
            onChange={handleChange}
            onBlur={handleBlur}
            value={formValues.username}
            error={touched.username ? formErrors.username : undefined}
            className="bg-[#1E1E1E] text-white placeholder-gray-400"
            labelClassName="text-sm mb-1 block"
          />

          {/* メールアドレス */}
          <Input
            id="email"
            name="email"
            type="email"
            label="メールアドレス"
            placeholder="メールアドレスを入力してください"
            onChange={handleChange}
            onBlur={handleBlur}
            value={formValues.email}
            error={touched.email ? formErrors.email : undefined}
            className="bg-[#1E1E1E] text-white placeholder-gray-400"
            labelClassName="text-sm mb-1 block"
          />

          {/* パスワード */}
          <Input
            id="password"
            name="password"
            type="password"
            label="パスワード"
            placeholder="パスワードを入力してください"
            onChange={handleChange}
            onBlur={handleBlur}
            value={formValues.password}
            error={touched.password ? formErrors.password : undefined}
            className="bg-[#1E1E1E] text-white placeholder-gray-400"
            labelClassName="text-sm mb-1 block"
          />

          {/* パスワード(確認) */}
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="パスワード(確認用)"
            placeholder="パスワードを再入力してください"
            onChange={handleChange}
            onBlur={handleBlur}
            value={formValues.confirmPassword}
            error={
              touched.confirmPassword ? formErrors.confirmPassword : undefined
            }
            className="bg-[#1E1E1E] text-white placeholder-gray-400"
            labelClassName="text-sm mb-1 block"
          />

          <Button
            type="submit"
            variant="default"
            className="w-full bg-white text-black mt-4 py-2 hover:bg-gray-200 transition-colors font-bold"
            isLoading={isLoading}
          >
            Sign up
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-pink-400 underline">
            ログイン
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          テスト用にログインページのテストアカウントを使用できます。
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
