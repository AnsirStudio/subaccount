import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 rounded-lg border border-zinc-200 bg-white px-3 text-right text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 disabled:bg-zinc-100 disabled:text-zinc-500",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 rounded-lg border border-zinc-200 bg-white px-3 text-right text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 disabled:bg-zinc-100 disabled:text-zinc-500",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70",
        className,
      )}
      {...props}
    />
  );
}

type RowProps = {
  label: string;
  children: React.ReactNode;
};

export function FieldRow({ label, children }: RowProps) {
  return (
    <div className="grid min-h-14 grid-cols-[140px_1fr] items-center gap-4 border-b border-zinc-200 last:border-b-0">
      <div className="text-sm font-semibold text-zinc-700">{label}</div>
      <div className="flex justify-end">{children}</div>
    </div>
  );
}
