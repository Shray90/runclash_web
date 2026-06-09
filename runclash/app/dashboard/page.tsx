//simple dashboard page with some stats and charts
import React from 'react';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Total Users</h2>
                    <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Active Clashes</h2>
                    <p className="text-2xl font-bold">567</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Total Distance</h2>
                    <p className="text-2xl font-bold">12,345 km</p>
                </div>
            </div>
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">Monthly Active Users</h2>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">[Chart Placeholder]</p>
                </div>
                </div>
            <div className="mt-6 bg-white p-4 rounded-lg shadow">

                <h2 className="text-xl font-semibold mb-2">Clash Outcomes</h2>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">[Chart Placeholder]</p>
                </div>
             </div>
        </div>
    );
}