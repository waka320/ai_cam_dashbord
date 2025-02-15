import './styles/App.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import theme from './theme/theme';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="">
        <CssBaseline />
        <header className="">
          あああ


        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
