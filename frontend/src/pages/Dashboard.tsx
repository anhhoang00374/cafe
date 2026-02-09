import React from 'react';
import { Layout, Menu, Button, Space, Typography } from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    FileOutlined,
    UserOutlined,
    LogoutOutlined,
    DatabaseOutlined,
    ImportOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = window.location;

    // Determine title based on path
    const getPageTitle = () => {
        if (pathname.includes('/dashboard/sales')) return 'Quản Lý Bán Hàng';
        if (pathname.includes('/dashboard/tables')) return 'Quản Lý Bàn';
        if (pathname.includes('/dashboard/datamaster')) return 'Quản Lý Dữ Liệu Chuyên Sâu';
        if (pathname.includes('/dashboard/imports')) return 'Quản Lý Nhập Kho';
        if (pathname.includes('/dashboard/staff')) return 'Quản Lý Nhân Sự';
        if (pathname.includes('/dashboard/reports')) return 'Báo Cáo & Thống Kê';
        if (pathname.includes('/dashboard/profits')) return 'Quản Lý Lợi Nhuận';
        return 'Tổng Quan';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { key: '/dashboard', icon: <PieChartOutlined />, label: 'Tổng quan' },
        { key: '/dashboard/sales', icon: <DesktopOutlined />, label: 'Quản lý Bán Hàng' },
        { key: '/dashboard/datamaster', icon: <DatabaseOutlined />, label: 'Dữ liệu nguồn' },
        { key: '/dashboard/imports', icon: <ImportOutlined />, label: 'Nhập Kho' },
        { key: '/dashboard/reports', icon: <FileOutlined />, label: 'Lịch sử & Báo cáo' },
        { key: '/dashboard/profits', icon: <DollarOutlined />, label: 'Quản lý Lợi nhuận' },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#000' }}>
            <Sider breakpoint="lg" collapsedWidth="0" className="glass-panel" width={260} style={{ borderRight: '2px solid var(--glass-border)' }}>
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <h2 className="gradient-text" style={{ fontSize: '32px', letterSpacing: '-2px', fontStyle: 'italic' }}>CAFE POS</h2>
                    <div style={{ height: '2px', background: 'var(--primary-color)', margin: '8px 20px' }}></div>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ border: 'none', padding: '0 12px', background: 'transparent' }}
                />
                <div style={{ position: 'absolute', bottom: 32, width: '100%', padding: '0 24px' }}>
                    <Button
                        danger
                        block
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{ height: '48px', borderRadius: '8px', fontWeight: 700, border: '2px solid var(--accent-color)', background: 'transparent', color: 'var(--accent-color)', boxShadow: '4px 4px 0px var(--accent-color)' }}
                    >
                        ĐĂNG XUẤT
                    </Button>
                </div>
            </Sider>
            <Layout style={{ background: '#000' }}>
                <Header style={{
                    background: '#141414',
                    padding: '0 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #333',
                    height: '80px'
                }}>
                    <Title level={3} style={{ margin: 0, color: '#fadb14', fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic' }}>{getPageTitle()}</Title>
                    <Space size="large">
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>Quản trị viên</div>
                            <div style={{ color: '#fadb14', fontSize: '12px', fontWeight: 600 }}>NHÂN VIÊN // ST-01</div>
                        </div>
                        <Button shape="circle" size="large" icon={<UserOutlined />} style={{ border: '2px solid #000', background: 'var(--primary-color)', color: '#000' }} />
                    </Space>
                </Header>
                <Content style={{ margin: '32px', overflow: 'initial' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
