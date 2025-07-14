"use client";

import { useFormStatus } from "react-dom";

interface CommentActionButtonProps {
  type: "approve" | "delete";
  children: React.ReactNode;
  className?: string;
}

export function CommentActionButton({
  type,
  children,
  className,
}: CommentActionButtonProps) {
  const { pending } = useFormStatus();

  const baseClassName =
    "px-3 py-1 text-xs rounded hover:opacity-80 disabled:opacity-50";
  const typeClassName =
    type === "approve" ? "bg-green-600 text-white" : "bg-red-600 text-white";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${baseClassName} ${typeClassName} ${className || ""}`}
    >
      {pending ? "处理中..." : children}
    </button>
  );
}
