import { useAuth } from '@/context/AuthContext'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import ChatBoard from '@/pages/ChatBoard'
import PdfRag from '@/pages/PdfRag'
import Upload from '@/pages/Upload'
import ProductList from '@/pages/ProductList'

export default function AppRoutes() {
   const { isAuthenticated, logout } = useAuth()

   return (
      <>
         <nav className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm">
            <Link to="/" className="hover:text-blue-600">
               Home
            </Link>
            <Link to="/chatboard" className="hover:text-blue-600">
               Chat Board
            </Link>
            <Link to="/pdf-rag" className="hover:text-blue-600">
               PDF Rag
            </Link>
            <Link to="/upload" className="hover:text-blue-600">
               Upload
            </Link>
            <Link to="/products" className="hover:text-blue-600">
               Products
            </Link>
            <div className="ml-auto">
               {isAuthenticated ? (
                  <button onClick={logout} className="rounded-md bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100">
                     Logout
                  </button>
               ) : (
                  <Link to="/login" className="rounded-md bg-blue-50 px-3 py-1.5 text-blue-600 hover:bg-blue-100">
                     Login
                  </Link>
               )}
            </div>
         </nav>

         <Routes>
            <Route path="/login" element={<Login />} />
            <Route
               path="/"
               element={
                  <ProtectedRoute>
                     <ChatBoard />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/chatboard"
               element={
                  <ProtectedRoute>
                     <ChatBoard />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/pdf-rag"
               element={
                  <ProtectedRoute>
                     <PdfRag />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/upload"
               element={
                  <ProtectedRoute>
                     <Upload />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/products"
               element={
                  <ProtectedRoute>
                     <ProductList />
                  </ProtectedRoute>
               }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
      </>
   )
}
