import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CityProvider } from "@/contexts/CityContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import Brands from "./pages/Brands";
import BrandModels from "./pages/BrandModels";
import ModelOverview from "./pages/ModelOverview";
import VariantDetail from "./pages/VariantDetail";
import Compare from "./pages/Compare";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Tools from "./pages/Tools";
import NewCars from "./pages/NewCars";
import UsedCars from "./pages/UsedCars";
import UsedCarsCity from "./pages/UsedCarsCity";
import UsedCarsSearch from "./pages/UsedCarsSearch";
import UsedCarsDetail from "./pages/UsedCarsDetail";
import NotFound from "./pages/NotFound";
import AdminQA from "./pages/AdminQA";
import Body from "./pages/Body";
import BodyType from "./pages/BodyType";
import Fuel from "./pages/Fuel";
import FuelType from "./pages/FuelType";
import UpcomingCars from "./pages/UpcomingCars";
import Dealers from "./pages/Dealers";
import DealerDetail from "./pages/DealerDetail";
import DynamicPage from "./pages/DynamicPage";
import AdminBuilder from "./pages/AdminBuilder";
import AdminChangeReport from "./pages/AdminChangeReport";
import AdminVariantSync from "./pages/AdminVariantSync";
import AdminImportReport from "./pages/AdminImportReport";
import AdminContentGuide from "./pages/AdminContentGuide";
import DataLoader from "./components/DataLoader";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen overflow-x-hidden">
              <DataLoader />
              <Header />
              <main className="flex-1 overflow-x-hidden pt-24">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/new-cars" element={<NewCars />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/used-cars" element={<UsedCars />} />
                  <Route path="/used-cars/search" element={<UsedCarsSearch />} />
                  <Route path="/used-cars/:city" element={<UsedCarsCity />} />
                  <Route path="/used-cars/:city/:id" element={<UsedCarsDetail />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:slug" element={<NewsArticle />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/admin/qa" element={<AdminQA />} />
                  <Route path="/admin/builder" element={<AdminBuilder />} />
                  <Route path="/admin/change-report" element={<AdminChangeReport />} />
                  <Route path="/admin/variant-sync" element={<AdminVariantSync />} />
                  <Route path="/admin/import-report" element={<AdminImportReport />} />
                  <Route path="/admin/content-guide" element={<AdminContentGuide />} />
                  <Route path="/fuel" element={<Fuel />} />
                  <Route path="/fuel/:type" element={<FuelType />} />
                  <Route path="/body" element={<Body />} />
                  <Route path="/body/:type" element={<BodyType />} />
                  <Route path="/upcoming-cars" element={<UpcomingCars />} />
                  <Route path="/dealers" element={<Dealers />} />
                  <Route path="/dealers/:id" element={<DealerDetail />} />
                  <Route path="/pages/*" element={<DynamicPage />} />
                  <Route path="/:brand" element={<BrandModels />} />
                  <Route path="/:brand/:model" element={<ModelOverview />} />
                  <Route path="/:brand/:model/:variant" element={<VariantDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </CityProvider>
  </QueryClientProvider>
);

export default App;
