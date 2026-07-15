import { Routes, Route, Link } from 'react-router-dom'
import ChatBoard from './pages/ChatBoard'
import Upload from './pages/Upload'
import ProductList from './pages/ProductList'
export default function App() {
   return (
      <>
         <nav>
            <Link to="/">Home</Link> | <Link to="/chatboard"> Chat Board</Link> | <Link to="/upload"> Upload</Link> |
            <Link to="/products"> Products</Link>
         </nav>
         <Routes>
            <Route path="/" element={<ChatBoard />} />
            <Route path="/chatboard" element={<ChatBoard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/products" element={<ProductList />} />
         </Routes>
      </>
   )
}
