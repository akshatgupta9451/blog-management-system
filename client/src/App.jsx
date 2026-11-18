import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/context/AuthProvider';
import AppRouter from '@/routes/AppRouter';

const App = () => (
  <AuthProvider>
    <AppRouter />
    <ToastContainer position="top-right" autoClose={3000} newestOnTop pauseOnHover />
  </AuthProvider>
);

export default App;
