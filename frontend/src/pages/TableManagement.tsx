import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Typography, Space, message, Spin, Empty } from 'antd';

import api from '../api';

const { Title, Text } = Typography;

const TableManagement: React.FC = () => {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await api.get('/tables');
            setTables(res.data);
        } catch (err) {
            message.error('Lỗi tải danh sách bàn');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return '#22c55e';
            case 'occupied': return '#ef4444';
            case 'reserved': return '#eab308';
            default: return '#94a3b8';
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>SƠ ĐỒ BÀN</Title>
                    <Text style={{ color: '#94a3b8' }}>Theo dõi trạng thái bàn theo thời gian thực</Text>
                </div>
                <Space size="large" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 24px', borderRadius: '12px' }}>
                    <Badge color="#22c55e" text={<span style={{ color: '#94a3b8' }}>Trống</span>} />
                    <Badge color="#ef4444" text={<span style={{ color: '#94a3b8' }}>Có khách</span>} />
                    <Badge color="#eab308" text={<span style={{ color: '#94a3b8' }}>Đã đặt</span>} />
                </Space>
            </div>

            {tables.length === 0 ? (
                <Empty description={<span style={{ color: '#94a3b8' }}>Chưa có dữ liệu bàn.</span>} />
            ) : (
                <Row gutter={[24, 24]}>
                    {tables.map(table => (
                        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={table.id}>
                            <Card
                                hoverable
                                className="glass-card"
                                style={{
                                    textAlign: 'center',
                                    borderTop: `4px solid ${getStatusColor(table.status)}`,
                                    transition: 'var(--transition)'
                                }}
                            >
                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                                    {table.table_number}
                                </div>
                                <Text style={{ color: '#94a3b8', display: 'block', marginBottom: '16px' }}>
                                    {table.name} ({table.capacity} Ghế)
                                </Text>
                                <Badge
                                    count={table.status === 'available' ? 'TRỐNG' : table.status === 'occupied' ? 'CÓ KHÁCH' : 'ĐÃ ĐẶT'}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: getStatusColor(table.status),
                                        borderColor: getStatusColor(table.status),
                                        fontSize: '10px'
                                    }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default TableManagement;
