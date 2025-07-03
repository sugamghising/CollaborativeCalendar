import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage />}></Route>
            </Routes>
        </Router>
    )
}

export default AppRoutes;