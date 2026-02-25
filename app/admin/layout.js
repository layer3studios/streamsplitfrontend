'use client';
import AdminLayout from '../../components/admin/AdminLayout';
import AuthModal from '../../components/ui/AuthModal';

export default function AdminLayoutWrapper({ children }) {
    return (
        <>
            <AuthModal />
            <AdminLayout>{children}</AdminLayout>
        </>
    );
}
