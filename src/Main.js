import React, { useEffect, useState } from "react";
import Header from "./Header/Header";
import { Box, Container, Toolbar } from "@mui/material";
import Footer from "./Header/Footer";
import Consultation from "./User/Consultation/Consultation";
import About from "./User/About/About";
import Orders from "./User/Orders/Orders";
import HomeAdmin from "./Admin/Home/HomeAdmin";
import ConsultationAdmin from "./Admin/Consultation/ConsultationAdmin";
import AboutAdmin from "./Admin/About/AboutAdmin";
import OrdersAdmin from "./Admin/Orders/OrdersAdmin";
import { useLocation } from "react-router-dom";
import Home from "./User/Home/Home";
import Dashboard from "./Admin/Dashboard/Dashboard";
import Account from "./User/Account/Account";

function Main({uiDetails, isAdmin, setIsAdmin}) {
    const [activeComponent, setActiveComponent] = useState('');
    const location = useLocation();
    const { user } = location.state || {};
    const [userData, setUserData] = useState(user ? user.encryptedData : null);
    const [consultationData, setConsultationData] = useState({ treatmentId: '', subTreatmentId: '' });

    useEffect(() => {
        if (sessionStorage.getItem('user')!==null) {
            setUserData(sessionStorage.getItem('user'));
        }
    }, [])

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
          case 'My Orders':
            return <Orders />;
          case 'Account':
            return <Account />;
          default:
            return <Home uiDetails={uiDetails.home} setActiveComponent={setActiveComponent} setConsultationData={setConsultationData} />;
        }
      }
    
      const renderAdminComponent = () => {
        switch (activeComponent) {
          case 'Dashboard':
            return <Dashboard />;
          case 'Home':
            return <HomeAdmin uiDetails={uiDetails.home} />;
          case 'Consultation':
            return <ConsultationAdmin />;
          case 'About':
            return <AboutAdmin uiDetails={uiDetails.about} />;
          case 'Orders':
            return <OrdersAdmin />;
          case 'Account':
              return <Account />;
          default:
            return <Dashboard />;
        }
      }

    return (
        <>
            <Header userDetails={userData} menuDetails={uiDetails.menu} setActiveComponent={setActiveComponent} setIsAdmin={setIsAdmin} />
            <Toolbar />
    
            <Container>
                <Box sx={{ my: 2 }}>
                    {isAdmin ? renderAdminComponent() : renderComponent()} 
                </Box>
            </Container>

            <Footer footerDetails={uiDetails.footer}/>
      </>
    );
}

export default Main;