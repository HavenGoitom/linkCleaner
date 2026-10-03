import React from 'react'
import { Toaster } from 'react-hot-toast'
import BackgroundCanvas from './components/BackgroundCanvas'
import Header from './components/Header'
import LinkCleanerEngine from './components/LinkCleanerEngine'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app-root">
      <BackgroundCanvas />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(8, 20, 60, 0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(80, 130, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            fontFamily: "'Outfit', sans-serif",
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#020818' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#020818' },
          },
        }}
      />
      <Header />
      <main className="main-content">
        <LinkCleanerEngine />
      </main>
      <Footer />
    </div>
  )
}

export default App
