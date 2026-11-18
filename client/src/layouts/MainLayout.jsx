import { Outlet } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
