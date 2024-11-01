import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { fetchDataWithParam } from './Helper/ApiHelper';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorPage from './ErrorPage';
import Feedback from './User/Orders/Feedback';
import Login from './Login/Login';
import Main from './Main';
import AddNewUser from './Login/AddNewUser';

function App() {
  const [uiDetails, setUiDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUIDetails = async () => {
      try {
        const uiData = await fetchDataWithParam('ui-details', 'english');
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
      <>
        <Router>
          <Routes>
            <Route path='/feedback' element={<Feedback />} />
            <Route path='/login' element={<Login setIsAdmin={setIsAdmin} />} />
            <Route path='/adduser' element={<AddNewUser isParent={true} />} />
            <Route path='/error' element={<ErrorPage />} />
            <Route path='/' element={<Main uiDetails={uiDetails} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />} />
          </Routes>
        </Router>
      </>
    )
  }
}

export default App;
