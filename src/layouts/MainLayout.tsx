import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <div className="mx-auto max-w-5xl px-8 py-10 md:px-12 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}