import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes cleanly (handles conflicts)
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Format currency with brand symbol
export function formatCurrency(amount, symbol = '₹') {
    if (amount === null || amount === undefined) return `${symbol}0`;
    return `${symbol}${Number(amount).toLocaleString('en-IN')}`;
}

// Relative time
export function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

// Truncate text
export function truncate(str, len = 50) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
}
