import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MapPage from './pages/MapPage';
import HomePage from './pages/HomePage';
import PropertyDetailPage from './pages/PropertyDetailPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
      </Route>
    </Routes>
  );
}
