import { useEffect, useState } from 'react';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { fetchDataWithParam } from './Helper/ApiHelper';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorPage from './ErrorPage';
import Feedback from './User/Orders/Feedback';
import Login from './Login/Login';
import Main from './Main';
import AddNewUser from './Login/AddNewUser';

const generateTheme = (myColor) => {
  return createTheme({
    palette: {
      primary: {
        main: myColor ? myColor.primary : '#1976d2', // Default primary color
        contrastText: myColor ? myColor.primaryText : '#ffffff',
      },
      secondary: {
        main: myColor ? myColor.secondary : '#ff4081', // Default secondary color
        contrastText: myColor ? myColor.secondaryText : '#ffffff',
      },
      background: {
        default: myColor ? myColor.background : '#ffffff',
      },
      custom : {
        background: myColor ? myColor.background : '#ffffff',
        blue : myColor ? myColor.blue : '#0000ff',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },
  });
};

function App() {
  const [uiDetails, setUiDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState(generateTheme());

  useEffect(() => {
    const getUIDetails = async () => {
      try {
        const uiData = await fetchDataWithParam('ui-details', 'english');
        console.log('App', uiData);
        const newTheme = generateTheme(uiData.color);
        setTheme(newTheme);
        setUiDetails(uiData);
      } catch(error) {
        console.log('Error App', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUIDetails();
  }, []);
  
  if (isLoading) {
    return (
      <>
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'  // Makes the Box take up the full viewport height
          }}
        >
          <CircularProgress color="primary" size={50} />
        </Box>
      </>)
  } else {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <style>
          {`:root {
            --primary-color: ${theme.palette.primary.main};
            --primary-text-color: ${theme.palette.primary.contrastText};
            --secondary-color: ${theme.palette.secondary.main};
            --secondary-text-color: ${theme.palette.secondary.contrastText};
            --background-color: ${theme.palette.custom.background};
            --custom-blue: ${theme.palette.custom.blue};
          }`}
        </style>
        <Router>
          <Routes>
            <Route path='/feedback' element={<Feedback />} />
            <Route path='/login' element={<Login setIsAdmin={setIsAdmin} />} />
            <Route path='/adduser' element={<AddNewUser isParent={true} isEdit={false}/>} />
            <Route path='/error' element={<ErrorPage />} />
            <Route path='/' element={<Main uiDetails={uiDetails} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />} />
          </Routes>
        </Router>
      </ThemeProvider>
    )
  }
}

export default App;
