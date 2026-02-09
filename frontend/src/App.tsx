import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import TableManagement from './pages/TableManagement';
import DataMaster from './pages/DataMaster';
import StockImport from './pages/StockImport';
import SalesManagement from './pages/SalesManagement';
import ReportManagement from './pages/ReportManagement';
import ProfitManagement from './pages/ProfitManagement';

const Placeholder = ({ title }: { title: string }) => (
  <div className="animate-fade-in glass-card" style={{ padding: '40px', textAlign: 'center' }}>
    <h2 style={{ color: '#fff' }}>{title} Module</h2>
    <p style={{ color: '#94a3b8' }}>This feature is currently being implemented with premium aesthetics.</p>
  </div>
);

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Layout style={{ minHeight: '100vh', background: '#0f172a' }}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}>
            <Route index element={<DashboardHome />} />
            <Route path="sales" element={<SalesManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="datamaster" element={<DataMaster />} />
            <Route path="imports" element={<StockImport />} />
            <Route path="products" element={<Placeholder title="Product Management" />} />
            <Route path="staff" element={<Placeholder title="Staff Management" />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="profits" element={<ProfitManagement />} />
          </Route>

          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
