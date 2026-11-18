import { Suspense } from 'react';
import { Outlet } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Loader from '@/components/ui/Loader';

const DashboardLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-8">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Suspense fallback={<Loader label="Loading…" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
    <Footer />
  </div>
);

export default DashboardLayout;
