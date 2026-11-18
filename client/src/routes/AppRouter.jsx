import { lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router';
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import BlogDetails from '@/pages/BlogDetails';
import Search from '@/pages/Search';
import NotFound from '@/pages/NotFound';
import { BLOG_STATUS, ROLES, ROUTES, WRITER_ROLES } from '@/constants';

// Dashboard pages (and the rich-text editor they pull in) load on demand,
// so readers browsing the public site never download them. Suspense lives in DashboardLayout.
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CreateBlog = lazy(() => import('@/pages/CreateBlog'));
const EditBlog = lazy(() => import('@/pages/EditBlog'));
const Profile = lazy(() => import('@/pages/Profile'));
const MyBlogs = lazy(() => import('@/pages/MyBlogs'));
const Activity = lazy(() => import('@/pages/Activity'));
const Bookmarks = lazy(() => import('@/pages/Bookmarks'));
const LikedBlogs = lazy(() => import('@/pages/LikedBlogs'));
const ReadingHistory = lazy(() => import('@/pages/ReadingHistory'));
// Admin panel: its own chunk, only ever downloaded by admins
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminBlogs = lazy(() => import('@/pages/admin/AdminBlogs'));
const AdminComments = lazy(() => import('@/pages/admin/AdminComments'));

const AppRouter = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.BLOG_DETAILS} element={<BlogDetails />} />
      <Route path={ROUTES.SEARCH} element={<Search />} />

      <Route element={<GuestRoute />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
      </Route>

      {/* Old profile URL from before the dashboard reorganisation */}
      <Route path="/profile" element={<Navigate to={ROUTES.PROFILE} replace />} />
      <Route path="*" element={<NotFound />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.MY_BLOGS} element={<MyBlogs />} />
        {/* `key` remounts the page so filters/search don't carry over between the three views */}
        <Route path={ROUTES.DRAFTS} element={<MyBlogs key="drafts" status={BLOG_STATUS.DRAFT} />} />
        <Route
          path={ROUTES.PUBLISHED}
          element={<MyBlogs key="published" status={BLOG_STATUS.PUBLISHED} />}
        />
        <Route path={ROUTES.ACTIVITY} element={<Activity />} />
        <Route path={ROUTES.BOOKMARKS} element={<Bookmarks />} />
        <Route path={ROUTES.LIKED} element={<LikedBlogs />} />
        <Route path={ROUTES.HISTORY} element={<ReadingHistory />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />

        <Route element={<ProtectedRoute roles={WRITER_ROLES} />}>
          <Route path={ROUTES.CREATE_BLOG} element={<CreateBlog />} />
          <Route path={ROUTES.EDIT_BLOG} element={<EditBlog />} />
        </Route>
      </Route>
    </Route>

    {/* The server enforces admin on every /admin API call; this only keeps others off the UI */}
    <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalytics />} />
        <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
        <Route path={ROUTES.ADMIN_BLOGS} element={<AdminBlogs />} />
        <Route path={ROUTES.ADMIN_COMMENTS} element={<AdminComments />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRouter;
