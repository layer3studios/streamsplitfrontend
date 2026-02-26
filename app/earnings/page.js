'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /earnings to the unified Payments page with Earnings tab
export default function EarningsRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace('/wallet'); }, []);
    return null;
}
