import React from 'react';
import './styles/App.css';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Main from './components/layout/Main';
import { CalendarProvider } from './contexts/CalendarContext';
import { ColorPaletteProvider } from './contexts/ColorPaletteContext';
import usePageTracking from './hooks/usePageTracking';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <SearchParamsWrapper />
      </BrowserRouter>
    </HelmetProvider>
  );
}

// Router配下でuseSearchParamsを呼び出すラッパーコンポーネント
function SearchParamsWrapper() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ページトラッキングを有効化
  usePageTracking();

  return (
    <CalendarProvider searchParams={searchParams} setSearchParams={setSearchParams}>
      <ColorPaletteProvider>
        <div className="app-container">
          <Header />
          <Main />
          <Footer />
        </div>
      </ColorPaletteProvider>
    </CalendarProvider>
  );
}

export default App;
