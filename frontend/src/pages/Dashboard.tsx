import React from 'react';
import { Layout, Menu, Button, Space, Typography, Grid } from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    FileOutlined,
    UserOutlined,
    LogoutOutlined,
    DatabaseOutlined,
    ImportOutlined,
    DollarOutlined,
    MenuOutlined
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

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const role = user.role;

    // Redirect 'user' role to sales page if they land on dashboard root
    React.useEffect(() => {
        if (role === 'user' && pathname === '/dashboard') {
            navigate('/dashboard/sales');
        }
    }, [role, pathname, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const allMenuItems = [
        // { key: '/dashboard', icon: <PieChartOutlined />, label: 'Tổng quan' },
        { key: '/dashboard/sales', icon: <DesktopOutlined />, label: 'Quản lý Bán Hàng' },
        { key: '/dashboard/datamaster', icon: <DatabaseOutlined />, label: 'Dữ liệu nguồn' },
        { key: '/dashboard/imports', icon: <ImportOutlined />, label: 'Nhập Kho' },
        { key: '/dashboard/reports', icon: <FileOutlined />, label: 'Lịch sử & Báo cáo' },
        { key: '/dashboard/profits', icon: <DollarOutlined />, label: 'Quản lý Lợi nhuận' },
    ];

    const menuItems = role === 'user'
        ? allMenuItems.filter(item => item.key === '/dashboard/sales')
        : allMenuItems;

    const screens = Grid.useBreakpoint(); // { xs, sm, md, lg, xl, xxl }
    const [collapsed, setCollapsed] = React.useState(false);

    // Initial check for mobile to collapse sidebar by default
    React.useEffect(() => {
        if (!screens.md) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
    }, [screens.md]);

    return (
        <Layout style={{ minHeight: '100vh', background: '#000' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                collapsedWidth="0"
                className="glass-panel"
                width={260}
                style={{
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1000,
                    borderRight: '2px solid var(--glass-border)',
                }}
            >
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <h2 className="gradient-text" style={{ fontSize: '32px', letterSpacing: '-2px', fontStyle: 'italic' }}>MUỐI COFFEE</h2>
                    <div style={{ height: '2px', background: 'var(--primary-color)', margin: '8px 20px' }}></div>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    onClick={({ key }) => {
                        navigate(key);
                        if (!screens.md) setCollapsed(true);
                    }}
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
            {/* Overlay for mobile when menu is open */}
            {!collapsed && !screens.md && (
                <div
                    onClick={() => setCollapsed(true)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}
            <Layout style={{ background: '#000', marginLeft: screens.md ? 260 : 0, transition: 'all 0.2s' }}>
                <Header style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: screens.md ? 'calc(100% - 260px)' : '100%',
                    zIndex: 998,
                    background: '#141414',
                    padding: screens.md ? '0 32px' : '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #333',
                    height: '80px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {!screens.md && (
                            <Button
                                type="text"
                                icon={<MenuOutlined style={{ fontSize: 20, color: '#fadb14' }} />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{ color: '#fff' }}
                            />
                        )}
                        <Title level={3} style={{ margin: 0, color: '#fadb14', fontSize: screens.md ? '24px' : '18px', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic' }}>{getPageTitle()}</Title>
                    </div>
                    <Space size={screens.md ? "large" : "small"}>
                        <div style={{ textAlign: 'right', display: screens.md ? 'block' : 'none' }}>
                            <div style={{ color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>{user.username || 'User'}</div>
                            <div style={{ color: '#fadb14', fontSize: '12px', fontWeight: 600 }}>{user.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'NHÂN VIÊN'} // {user.id || 'N/A'}</div>
                        </div>
                        <Button shape="circle" size="large" icon={<UserOutlined />} style={{ border: '2px solid #000', background: 'var(--primary-color)', color: '#000' }} />
                    </Space>
                </Header>
                <Content style={{ margin: screens.md ? '32px' : '16px', marginTop: screens.md ? 112 : 96, overflow: 'initial', minHeight: 'calc(100vh - 112px)' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
