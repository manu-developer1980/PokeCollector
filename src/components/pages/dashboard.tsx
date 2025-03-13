import React from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />

      <div className="flex pt-16">
        <Sidebar />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-600">Manage your collection efficiently.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
