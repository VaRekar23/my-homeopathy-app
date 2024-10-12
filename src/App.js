import { useEffect, useState } from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import Header from './Header/Header';
import Home from './User/Home/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Consultation from './User/Consultation/Consultation';
import About from './User/About/About';
import { fetchDataWithParam } from './Helper/ApiHelper';
import CircularProgress from '@mui/material/CircularProgress';
import Footer from './Header/Footer';
import HomeAdmin from './Admin/Home/HomeAdmin';
import AboutAdmin from './Admin/About/AboutAdmin';
import ConsultationAdmin from './Admin/Consultation/ConsultationAdmin';
import ErrorPage from './ErrorPage';
import Dashboard from './Admin/Dashboard/Dashboard';

function App() {
  const [uiDetails, setUiDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState('Home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [consultationData, setConsultationData] = useState({ treatmentId: '', subTreatmentId: '' });

  useEffect(() => {
    const getUIDetails = async () => {
      try {
        const uiData = await fetchDataWithParam('ui-details', 'english');
        setUiDetails(uiData);
      } catch(error) {
        console.log('Error fetching documents', error);
        return (<ErrorPage />);
      } finally {
        setIsLoading(false);
      }
    };

    getUIDetails();
    if (sessionStorage.getItem('user')!==null) {
      setUser(sessionStorage.getItem('user'));
    } else {
      
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      renderAdminComponent();
    } else {
      renderComponent();
    }
    
  }, [activeComponent, isAdmin]);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Home':
        return <Home uiDetails={uiDetails.home} setActiveComponent={setActiveComponent} setConsultationData={setConsultationData} />;
      case 'Consultation':
        return <Consultation consultationData={consultationData}/>;
      case 'About':
        return <About uiDetails={uiDetails.about} />;
      default:
        return <Home uiDetails={uiDetails.home} />;
    }
  }

  const renderAdminComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <Dashboard userDetails={user} />;
      case 'Home':
        return <HomeAdmin uiDetails={uiDetails.home} />;
      case 'Consultation':
        return <ConsultationAdmin />;
      case 'About':
        return <AboutAdmin uiDetails={uiDetails.about} />;
      default:
        return <Dashboard userDetails={user} />;
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
          <Header userDetails={user} menuDetails={uiDetails.menu} setActiveComponent={setActiveComponent} setIsAdmin={setIsAdmin} />
          <Toolbar />
    
          <Container>
            <Box sx={{ my: 2 }}>
              {isAdmin ? renderAdminComponent() : renderComponent()}
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
