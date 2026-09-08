import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import Register from './components/Register';
import Login from './components/Login';
import PetDashboard from './components/petDashboard';
import VeterinarianDashboard from './components/VeterinarianDashboard';
import Users from './components/UserDashboard';
import Appointment from './components/AppointmentDashboard';
import Adoption from './components/AdoptionDashboard';
import ChangePassword from './components/ChangePassword';
import ResetPassword from './components/ResetPassword';
import RecordDashboard from './components/RecordDashboard';
import ProductDashboard from './components/ProductDashboard';
import OrderDashboard from './components/OrderDashboard';
import Home from './components/Home';
import UserDash from './RolesDashboard/UserDash';
import UserSidebar from './RolesDashboard/UserSidebar';
import ProductList from './components/ProductList';
import VetDash from './RolesDashboard/VetDash';
import CheckoutPage from './components/CheckoutPage';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';
import PetAdoption from './components/PetAdoption';
import ReviewDashboard from './components/ReviewDashboard';
import MeetOurVeterinarians from './components/MeetOurVeterinarians';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import ContactDashboard from './components/ContactDashboard';
import Shelters from './components/Shelters';



function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/petDashboard" element={<PetDashboard />} />
          <Route path="/vets" element={<VeterinarianDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/adoption" element={<Adoption />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/change-pass" element={<ChangePassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/records" element={<RecordDashboard />} />
          <Route path="/product" element={<ProductDashboard />} />
          <Route path="/order" element={<OrderDashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<UserDash />} />
          <Route path="/productlist" element={<ProductList />} />
          <Route path="/vetsDash" element={<VetDash />} />
          <Route path="/checkout" element={<CheckoutPage />} /> 
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/adopt" element={<PetAdoption />} />
          <Route path="/reviews" element={<ReviewDashboard />} />
           <Route path="/meetvets" element={<MeetOurVeterinarians />} />
           <Route path="/AboutUs" element={<AboutUs />} />
           <Route path="/contact" element={<Contact />} />
           <Route path="/contactDash" element={<ContactDashboard />} />
            <Route path="/Shelters" element={<Shelters />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;