import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDatetime(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getPriorityColor(priority: string): {
  bg: string;
  text: string;
} {
  const colors: Record<string, { bg: string; text: string }> = {
    critical: { bg: "bg-red-50", text: "text-red-600" },
    high: { bg: "bg-orange-50", text: "text-orange-600" },
    medium: { bg: "bg-amber-50", text: "text-amber-600" },
    low: { bg: "bg-blue-50", text: "text-blue-600" },
  };
  return colors[priority] || colors.low;
}

export function getStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    todo: { bg: "bg-gray-50", text: "text-gray-600" },
    in_progress: { bg: "bg-blue-50", text: "text-blue-600" },
    review: { bg: "bg-purple-50", text: "text-purple-600" },
    completed: { bg: "bg-green-50", text: "text-green-600" },
    draft: { bg: "bg-gray-50", text: "text-gray-600" },
    pending_approval: { bg: "bg-yellow-50", text: "text-yellow-600" },
    active: { bg: "bg-green-50", text: "text-green-600" },
    archived: { bg: "bg-gray-50", text: "text-gray-600" },
  };
  return colors[status] || colors.draft;
}
