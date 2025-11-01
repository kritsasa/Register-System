import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/login'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './ProtectedRoute'
import './App.css'

function App() {

  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Navigate to='/login' />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
