import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "../pages/Dashboard/Dashboard";
import BrandList from "../pages/Brands/BrandList";
import BrandForm from "../pages/Brands/BrandForm";
import BrandCSVImport from "../pages/Brands/BrandCSVImport";
import ModelList from "../pages/Models/ModelList";
import ModelForm from "../pages/Models/ModelForm";
import ModelCSVImport from "../pages/Models/ModelCSVImport";
import VariantList from "../pages/Variants/VariantList";
import VariantForm from "../pages/Variants/VariantForm";
import VariantCSVImport from "../pages/Variants/VariantCSVImport";
import HeroCarouselManager from "../pages/HeroCarousel/HeroCarouselManager";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />

      <Route
        path="/brands"
        element={<ProtectedRoute><BrandList /></ProtectedRoute>}
      />
      <Route
        path="/brands/new"
        element={<ProtectedRoute><BrandForm /></ProtectedRoute>}
      />
      <Route
        path="/brands/edit/:id"
        element={<ProtectedRoute><BrandForm /></ProtectedRoute>}
      />
      <Route
        path="/brands/import"
        element={<ProtectedRoute><BrandCSVImport /></ProtectedRoute>}
      />

      {/* Add Models + Variants Routes Later */}
      <Route
        path="/models"
        element={<ProtectedRoute><ModelList /></ProtectedRoute>}
      />
      <Route
        path="/models/new"
        element={<ProtectedRoute><ModelForm /></ProtectedRoute>}
      />
      <Route
        path="/models/:id/edit"
        element={<ProtectedRoute><ModelForm /></ProtectedRoute>}
      />
      <Route
        path="/models/import"
        element={<ProtectedRoute><ModelCSVImport /></ProtectedRoute>}
      />

      <Route
        path="/variants"
        element={<ProtectedRoute><VariantList /></ProtectedRoute>}
      />
      <Route
        path="/variants/new"
        element={<ProtectedRoute><VariantForm /></ProtectedRoute>}
      />
      <Route
        path="/variants/:id/edit"
        element={<ProtectedRoute><VariantForm /></ProtectedRoute>}
      />
      <Route
        path="/variants/import"
        element={<ProtectedRoute><VariantCSVImport /></ProtectedRoute>}
      />

      <Route
        path="/hero-carousel"
        element={<ProtectedRoute><HeroCarouselManager /></ProtectedRoute>}
      />
    </Routes>
  );
}
