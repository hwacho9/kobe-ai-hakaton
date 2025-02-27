import React from "react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "default" | "outline";
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { variant = "default", isLoading, children, className, ...props },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium";
        const variantStyles = {
            primary: "bg-pink-600 text-white hover:bg-pink-700",
            default: "bg-gray-200 text-gray-800 hover:bg-gray-300",
            outline:
                "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    isLoading && "opacity-50 cursor-not-allowed",
                    className
                )}
                disabled={isLoading}
                {...props}>
                {isLoading && (
                    <span className="mr-2">
                        {/* ローディングスピナーなど */}
                        <svg className="animate-spin h-4 w-4" /* ...略 */ />
                    </span>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
