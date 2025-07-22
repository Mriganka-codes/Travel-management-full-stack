import React, { useState, useContext } from 'react'
import { Mail, Lock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

axios.defaults.withCredentials = true;

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, googleLogin } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('credentials')
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const success = await login(formData.emailOrPhone, formData.password)
      if (success) {
        navigate('/#')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred')
    }
  }

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const success = await googleLogin(credentialResponse.credential);
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Google login failed. Please try again.')
      }
    } catch (error) {
      console.error('Google login error:', error)
      setError('An unexpected error occurred during Google login')
    }
  }

  const handleGoogleLoginError = () => {
    setError('Google login failed. Please try again.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="mb-6">
              <div className="grid w-full grid-cols-2 mb-4">
                <button
                  onClick={() => setActiveTab('credentials')}
                  className={`py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'credentials' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
                >
                  Email/Phone
                </button>
                <button
                  onClick={() => setActiveTab('google')}
                  className={`py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'google' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
                >
                  Google
                </button>
              </div>
              {activeTab === 'credentials' ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <input
                        id="emailOrPhone"
                        name="emailOrPhone"
                        type="text"
                        placeholder="Enter your email or phone number"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={formData.emailOrPhone}
                        onChange={handleInputChange}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className="font-medium text-green-600 hover:text-green-500">
                        Forgot your password?
                      </a>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                  >
                    Sign in
                  </button>
                </form>
              ) : (
                <div className="mt-4">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    useOneTap
                    theme="outline"
                    size="large"
                    width="100%"
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="left"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              New here?{' '}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}