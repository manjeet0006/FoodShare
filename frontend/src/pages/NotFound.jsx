import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-slate-200">404</h1>
        <p className="text-2xl font-bold text-slate-800 -mt-8 mb-8">Page Not Found</p>
        <Button asChild className="rounded-full px-8">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}