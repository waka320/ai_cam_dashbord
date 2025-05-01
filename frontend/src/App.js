import React from 'react';
import './styles/App.css';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import Header from './components/layout/Header';
import Content from './components/layout/Content';
import { CalendarProvider } from './contexts/CalendarContext';
import { ColorPaletteProvider } from './contexts/ColorPaletteContext';

function App() {
  return (
    <BrowserRouter>
      <SearchParamsWrapper />
    </BrowserRouter>
  );
}

// Router配下でuseSearchParamsを呼び出すラッパーコンポーネント
function SearchParamsWrapper() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <CalendarProvider searchParams={searchParams} setSearchParams={setSearchParams}>
      <ColorPaletteProvider>
        <div className="app-container">
          <Header />
          <Content />
        </div>
      </ColorPaletteProvider>
    </CalendarProvider>
  );
}

export default App;
