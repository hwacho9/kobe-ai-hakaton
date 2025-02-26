import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const RegisterPage = () => {
    const router = useRouter();
    const { register } = useAuthStore();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = { ...errors };

        // Validate username
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
            valid = false;
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
            valid = false;
        }

        // Validate email
        if (!formData.email) {
            newErrors.email = "Email is required";
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
            valid = false;
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = "Password is required";
            valid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            valid = false;
        }

        // Validate confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await register(
                formData.username,
                formData.email,
                formData.password
            );

            if (result.success) {
                router.push("/");
            } else {
                // Handle server-side validation errors
                if (result.message) {
                    if (result.message.includes("email")) {
                        setErrors((prev) => ({
                            ...prev,
                            email: result.message,
                        }));
                    } else if (result.message.includes("username")) {
                        setErrors((prev) => ({
                            ...prev,
                            username: result.message,
                        }));
                    } else {
                        alert(result.message);
                    }
                }
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{" "}
                        <Link
                            href="/login"
                            className="font-medium text-blue-600 hover:text-blue-500">
                            sign in to your account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <Input
                            label="Username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            error={errors.username}
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}>
                            Register
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
