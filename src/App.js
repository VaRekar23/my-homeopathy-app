import { useEffect, useState } from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import Header from './Header/Header';
import Home from './Home/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Consultation from './Consultation/Consultation';
import About from './About/About';
import { fetchDataWithParam } from './Helper/ApiHelper';
import CircularProgress from '@mui/material/CircularProgress';
import Footer from './Header/Footer';
import HomeAdmin from './Admin/Home/HomeAdmin';

function App() {
  const [uiDetails, setUiDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState('Home');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUIDetails = async () => {
      try {
        const uiData = await fetchDataWithParam('ui-details', 'english');
        setUiDetails(uiData);
      } catch(error) {
        console.error('Error fetching documents', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUIDetails();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      renderAdminComponent();
    } else {
      renderComponent();
    }
    
  }, [activeComponent]);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Home':
        return <Home uiDetails={uiDetails.home} />;
      case 'Consultation':
        return <Consultation />;
      case 'About':
        return <About uiDetails={uiDetails.about} />;
      default:
        return <Home uiDetails={uiDetails.home} />;
    }
  }

  const renderAdminComponent = () => {
    switch (activeComponent) {
      case 'Home':
        return <HomeAdmin uiDetails={uiDetails.home} />;
      case 'Consultation':
        return <Consultation />;
      case 'About':
        return <About uiDetails={uiDetails.about} />;
      default:
        return <HomeAdmin uiDetails={uiDetails.home} />;
    }
  }
  
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
      <>
        {uiDetails ? (
          <Router>
          <Header menuDetails={uiDetails.menu} setActiveComponent={setActiveComponent} setIsAdmin={setIsAdmin} />
          <Toolbar />
    
          <Container>
            <Box sx={{ my: 2 }}>
              {isAdmin ? (renderAdminComponent) : (renderComponent())}
            </Box>
          </Container>

          <Footer footerDetails={uiDetails.footer}/>
        </Router>
        ):(
          <>
          <p>We are working on to fix the issue...</p>
          </>
        )}
      </>
    );
  }
}

export default App;
