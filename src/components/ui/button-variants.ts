import { cva } from "class-variance-authority"

export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground",
                destructive: "bg-red-500 text-white",
                outline: "border border-gray-300 bg-white text-black hover:bg-gray-100", // 👈 Tambahkan ini

            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 px-3",
                lg: "h-10 px-6",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)
