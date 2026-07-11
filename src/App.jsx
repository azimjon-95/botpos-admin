// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout.jsx'
import { Spinner } from './components/UI.jsx'

// Lazy load pages — tezroq birinchi yuklash
const Login         = lazy(() => import('./pages/Login.jsx'))
const Dashboard     = lazy(() => import('./pages/Dashboard.jsx'))
const Shops         = lazy(() => import('./pages/Shops.jsx'))
const ShopForm      = lazy(() => import('./pages/ShopForm.jsx'))
const ShopView      = lazy(() => import('./pages/ShopView.jsx'))
const Workers       = lazy(() => import('./pages/Workers.jsx'))
const Customers     = lazy(() => import('./pages/Customers.jsx'))
const OpenAICost    = lazy(() => import('./pages/OpenAICost.jsx'))
const AuditLog      = lazy(() => import('./pages/AuditLog.jsx'))
const BackupRestore = lazy(() => import('./pages/BackupRestore.jsx'))

const isAuthed = () => !!localStorage.getItem('bp_token')

function Guard({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner size={32}/>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader/>}>
        <Routes>
          <Route path="/login" element={<Login/>}/>

          <Route path="/" element={<Guard><Layout/></Guard>}>
            <Route index                     element={<Dashboard/>}/>
            <Route path="shops"              element={<Shops/>}/>
            <Route path="shops/new"          element={<ShopForm/>}/>
            <Route path="shops/:id"          element={<ShopView/>}/>
            <Route path="shops/:id/edit"     element={<ShopForm/>}/>
            <Route path="shops/:id/workers"  element={<Workers/>}/>
            <Route path="shops/:id/customers" element={<Customers/>}/>
            <Route path="openai"             element={<OpenAICost/>}/>
            <Route path="audit"              element={<AuditLog/>}/>
            <Route path="backup"             element={<BackupRestore/>}/>
          </Route>

          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
