import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

// Brand Pages
import BrandList from "./pages/Brands/BrandList";
import BrandForm from "./pages/Brands/BrandForm";
import BrandCSVImport from "./pages/Brands/BrandCSVImport";
import DashboardLayout from "./components/layout/DashboardLayout";
import ImportIndex from "./pages/Import/ImportIndex";

// Model Pages
import ModelList from "./pages/Models/ModelList";
import ModelForm from "./pages/Models/ModelForm";
import ModelCSVImport from "./pages/Models/ModelCSVImport";
import VariantCSVImport from "./pages/Variants/VariantCSVImport";
import VariantList from "./pages/Variants/VariantList";
import VariantForm from "./pages/Variants/VariantForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DealerList from "./pages/Dealers/DealerList";
import DealerForm from "./pages/Dealers/DealerForm";
import SpecList from "./pages/Specs/SpecList";
import SpecForm from "./pages/Specs/SpecForm";
import SpecCSVImport from "./pages/Specs/SpecCSVImport";
import Settings from "./pages/Settings/Settings";
import PricingManagement from "./pages/Pricing/PricingManagement";
import HeroCarouselManager from "./pages/HeroCarousel/HeroCarouselManager";

const queryClient = new QueryClient();


export default function App() {



  return (
   <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Brands Routes */}
          <Route
            path="/brands"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BrandList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/brands/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BrandForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/brands/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BrandForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/brands/import"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BrandCSVImport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/import"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ImportIndex />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Models Routes */}
          <Route
            path="/models"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModelList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/models/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModelForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/models/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModelForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Dealers Routes */}
          <Route
            path="/dealers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DealerList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dealers/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DealerForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dealers/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DealerForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Specs routes */}
          <Route
            path="/specs"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SpecList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/specs/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SpecForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/specs/:variantId/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SpecForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/specs/import"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SpecCSVImport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/models/import"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ModelCSVImport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Variants Routes */}
          <Route
            path="/variants"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VariantList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/variants/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VariantForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/variants/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VariantForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/variants/import"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VariantCSVImport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Pricing & Tax Management Route */}
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PricingManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Hero Carousel Management Route */}
          <Route
            path="/hero-carousel"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <HeroCarouselManager />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
  );
}
