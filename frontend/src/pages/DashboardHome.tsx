import React, { useEffect } from 'react';
import { Card, Statistic, Row, Col, Typography, Table, Tag } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, AppstoreOutlined, WarningOutlined } from '@ant-design/icons';


const { Title } = Typography;

const DashboardHome: React.FC = () => {
    useEffect(() => {
        // Fetch stats in real app
        // api.get('/reports/dashboard').then(res => setStats(res.data));
    }, []);

    return (
        <div className="animate-fade-in">
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="glass-card">
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={1250000}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            valueStyle={{ color: '#6366f1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="glass-card">
                        <Statistic
                            title="Tổng đơn hàng"
                            value={42}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#a855f7' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="glass-card">
                        <Statistic
                            title="Bàn đang mở"
                            value={5}
                            prefix={<AppstoreOutlined />}
                            valueStyle={{ color: '#22c55e' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="glass-card">
                        <Statistic
                            title="Cảnh báo tồn kho"
                            value={3}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#ef4444' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="glass-card" style={{ marginTop: '24px' }}>
                <Title level={5} style={{ color: '#fff', marginBottom: '20px' }}>Giao dịch gần đây</Title>
                <Table
                    pagination={false}
                    dataSource={[
                        { key: '1', id: 'ORD-001', table: 'T01', total: '45,000₫', status: 'completed' },
                        { key: '2', id: 'ORD-002', table: 'T05', total: '120,000₫', status: 'pending' },
                    ]}
                    columns={[
                        { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: text => <span style={{ color: '#94a3b8' }}>{text}</span> },
                        { title: 'Bàn', dataIndex: 'table', key: 'table' },
                        { title: 'Tổng cộng', dataIndex: 'total', key: 'total' },
                        {
                            title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => (
                                <Tag color={s === 'completed' ? 'green' : 'gold'}>{s === 'completed' ? 'HOÀN THÀNH' : 'CHỜ'}</Tag>
                            )
                        },
                    ]}
                    style={{ background: 'transparent' }}
                />
            </Card>
        </div>
    );
};

export default DashboardHome;
