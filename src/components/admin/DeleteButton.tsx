"use client";

import { useRef } from "react";

interface DeleteButtonProps {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
}

export default function DeleteButton({ action, id, label = "Delete" }: DeleteButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (window.confirm("Are you sure you want to delete this item?")) {
            formRef.current?.requestSubmit();
          }
        }}
        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
      >
        {label}
      </button>
    </form>
  );
}
