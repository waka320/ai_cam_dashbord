import './styles/App.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import theme from './theme/theme';
import ThemeTest from './components/layout/ThemeTest';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="">
        <CssBaseline />
        <ThemeTest />
      </div>
    </ThemeProvider>
  );
}

export default App;
