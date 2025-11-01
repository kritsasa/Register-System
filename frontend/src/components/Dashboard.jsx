import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {

    const navigate = useNavigate()
    const [message, setMessage] = useState('Loading dashboard...')

    useEffect(() => {
        const fetchDashboard = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                navigate('/Login')
                return
            }

            try {
                const response = await axios.get('http://localhost:3001/api/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                setMessage(response.data.message)

            } catch (error) {
                console.error("Authentication error:", error)
                handleLogout()
            }
        }

        fetchDashboard()
    }, [navigate]) // Put it in for core React Hook correctness.

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/Login')
    }

  return (
    <div className='container mt-5'>
        <div className='row justify-content-center'>
            <div className='col-md-8'>
                <div className='card'>
                    <div className='card-body text-center'>
                        <h2 className='card-title'>{message}</h2>
                        <p>This page is protected and you are seeing this because your JWT is valid.</p>
                        <button className='btn btn-danger' onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </div>

        </div>

    </div>
  )
}

export default Dashboard