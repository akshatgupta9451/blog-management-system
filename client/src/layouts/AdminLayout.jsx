import { Suspense } from 'react';
import { Outlet } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Loader from '@/components/ui/Loader';

const AdminLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-8">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <Suspense fallback={<Loader label="Loading…" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  </div>
);

export default AdminLayout;
