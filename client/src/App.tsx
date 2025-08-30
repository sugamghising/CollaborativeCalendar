import React from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import AppRoutes from './route';

// Main layout component that includes the Navbar and content
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <main className="py-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
