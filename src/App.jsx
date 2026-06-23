import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Page imports
import Layout from './components/Layout';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import MisMascotas from './pages/MisMascotas';
import BuscarCuidadores from './pages/BuscarCuidadores';
import PerfilCuidadorPage from './pages/PerfilCuidadorPage';
import MisServicios from './pages/MisServicios';
import DetalleServicio from './pages/DetalleServicio';
import Perfil from './pages/Perfil';
import AdminPanel from './pages/AdminPanel';
import ServiciosAliados from './pages/ServiciosAliados';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F9F7F4]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#F97316] rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white font-black text-xl">M</span>
          </div>
          <div className="w-8 h-8 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<BuscarCuidadores />} />
          <Route path="/cuidador/:id" element={<PerfilCuidadorPage />} />
          <Route path="/mis-mascotas" element={<MisMascotas />} />
          <Route path="/mis-servicios" element={<MisServicios />} />
          <Route path="/servicio/:id" element={<DetalleServicio />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/servicios-aliados" element={<ServiciosAliados />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;