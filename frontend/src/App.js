import React from 'react';
import './styles/App.css';
import Header from './components/layout/Header';
import Content from './components/layout/Content';
import { CalendarProvider } from './contexts/CalendarContext';


function App() {
  return (
    <CalendarProvider>
      <div className="">
        <Header />
        <Content />
      </div>
    </CalendarProvider>
  );
}

export default App;
