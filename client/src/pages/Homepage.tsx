import React from 'react'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Siderbar'
import Main from '../components/layout/Main'
import SignUp from './SignUp'
import Login from './Login'

const Homepage = () => {
  return (
     <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Login />
        {/* <Main /> */}
      </div>
    </div>
  )
}

export default Homepage