import React, { useEffect, useState, useCallback } from 'react';
import {
    Row, Col, Card, Typography, Table, Tag, Button,
    Statistic, message, Modal, List, Collapse, Empty, Spin
} from 'antd';
import {
    MinusCircleOutlined,
    PlusCircleOutlined,
    CalculatorOutlined,
    EyeOutlined,
    DeleteOutlined,
    RiseOutlined,
    FallOutlined,
    ShoppingCartOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;


interface ProfitCycle {
    id: number;
    start_date: string;
    end_date: string;
    revenue: number;
    cost: number;
    profit: number;
    status: string;
    revenue_details: any;
    cost_details: any;
    createdAt: string;
}

const ProfitManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [cycles, setCycles] = useState<ProfitCycle[]>([]);
    const [selectedCycle, setSelectedCycle] = useState<ProfitCycle | null>(null);
    const [detailType, setDetailType] = useState<'revenue' | 'cost' | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const fetchCycles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/profits');
            setCycles(res.data);
        } catch (err: any) {
            message.error('Không thể tải danh sách chu kỳ');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            await api.post('/profits/calculate');
            message.success('Đã tính toán chu kỳ lợi nhuận mới!');
            fetchCycles();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Lỗi khi tính toán');
        } finally {
            setCalculating(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/profits/${id}`);
            message.success('Đã xóa chu kỳ');
            fetchCycles();
        } catch (err: any) {
            message.error('Không thể xóa chu kỳ');
        }
    };

    const showDetails = (cycle: ProfitCycle, type: 'revenue' | 'cost') => {
        setSelectedCycle(cycle);
        setDetailType(type);
        setDetailModalVisible(true);
    };

    const revenueItemColumns = [
        { title: 'TÊN MÓN', dataIndex: 'productName', key: 'productName', render: (t: string) => <span style={{ color: '#fff' }}>{t}</span> },
        { title: 'SỐ LƯỢNG', dataIndex: 'qty', key: 'qty', align: 'center' as const },
        { title: 'ĐƠN GIÁ', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right' as const, render: (v: number) => `${v.toLocaleString()} ₫` },
        { title: 'TỔNG TIỀN', dataIndex: 'total', key: 'total', align: 'right' as const, render: (v: number) => <span style={{ color: 'var(--primary-color)' }}>{v.toLocaleString()} ₫</span> },
    ];

    const costItemColumns = [
        { title: 'NGUYÊN LIỆU', dataIndex: 'ingredientName', key: 'ingredientName', render: (t: string) => <span style={{ color: '#fff' }}>{t}</span> },
        { title: 'ĐÃ TIÊU THỤ', dataIndex: 'consumedQty', key: 'consumedQty', align: 'center' as const },
        { title: 'ĐƠN GIÁ NHẬP', dataIndex: 'costPrice', key: 'costPrice', align: 'right' as const, render: (v: number) => `${v.toLocaleString()} ₫` },
        { title: 'TỔNG CHI PHÍ', dataIndex: 'totalCost', key: 'totalCost', align: 'right' as const, render: (v: number) => <span style={{ color: 'var(--accent-color)' }}>{v.toLocaleString()} ₫</span> },
    ];

    return (
        <div className="profit-management animate-fade-in" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ color: 'var(--primary-color)', margin: 0, fontStyle: 'italic' }}>
                        QUẢN LÝ LỢI NHUẬN
                    </Title>
                    <Text style={{ color: '#666' }}>Theo dõi lãi/lỗ theo từng chu kỳ kinh doanh</Text>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<CalculatorOutlined />}
                    loading={calculating}
                    onClick={handleCalculate}
                    style={{ background: 'var(--primary-color)', color: '#000', fontWeight: 800, borderRadius: 8 }}
                >
                    TÍNH LỢI NHUẬN
                </Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
            ) : cycles.length === 0 ? (
                <Empty description={<span style={{ color: '#666' }}>Chưa có chu kỳ nào. Nhấn "TÍNH LỢI NHUẬN" để bắt đầu.</span>} />
            ) : (
                <Row gutter={[24, 24]}>
                    {cycles.map((cycle) => {
                        const isProfit = Number(cycle.profit) >= 0;
                        return (
                            <Col key={cycle.id} span={24}>
                                <Card
                                    className="glass-card"
                                    style={{
                                        background: '#141414',
                                        border: `1px solid ${isProfit ? '#52c41a' : '#ff4d4f'}`,
                                        borderRadius: 12
                                    }}
                                >
                                    <Row gutter={24} align="middle">
                                        <Col span={6}>
                                            <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>CHU KỲ</div>
                                            <div style={{ color: '#fff', fontWeight: 600 }}>
                                                {dayjs(cycle.start_date).format('DD/MM/YYYY HH:mm')}
                                            </div>
                                            <div style={{ color: '#444' }}>đến</div>
                                            <div style={{ color: '#fff', fontWeight: 600 }}>
                                                {dayjs(cycle.end_date).format('DD/MM/YYYY HH:mm')}
                                            </div>
                                        </Col>
                                        <Col span={5}>
                                            <Statistic
                                                title={<span style={{ color: '#666', fontSize: 11 }}>DOANH THU</span>}
                                                value={Number(cycle.revenue)}
                                                precision={0}
                                                valueStyle={{ color: 'var(--primary-color)', fontSize: 20 }}
                                                prefix={<PlusCircleOutlined />}
                                                suffix="₫"
                                            />
                                            <Button
                                                size="small"
                                                type="link"
                                                icon={<EyeOutlined />}
                                                onClick={() => showDetails(cycle, 'revenue')}
                                                style={{ color: 'var(--primary-color)', padding: 0, marginTop: 8 }}
                                            >
                                                Chi tiết
                                            </Button>
                                        </Col>
                                        <Col span={5}>
                                            <Statistic
                                                title={<span style={{ color: '#666', fontSize: 11 }}>CHI PHÍ</span>}
                                                value={Number(cycle.cost)}
                                                precision={0}
                                                valueStyle={{ color: 'var(--accent-color)', fontSize: 20 }}
                                                prefix={<MinusCircleOutlined />}
                                                suffix="₫"
                                            />
                                            <Button
                                                size="small"
                                                type="link"
                                                icon={<EyeOutlined />}
                                                onClick={() => showDetails(cycle, 'cost')}
                                                style={{ color: 'var(--accent-color)', padding: 0, marginTop: 8 }}
                                            >
                                                Chi tiết
                                            </Button>
                                        </Col>
                                        <Col span={5}>
                                            <Statistic
                                                title={<span style={{ color: '#666', fontSize: 11 }}>{isProfit ? 'LỢI NHUẬN' : 'LỖ'}</span>}
                                                value={Math.abs(Number(cycle.profit))}
                                                precision={0}
                                                valueStyle={{ color: isProfit ? '#52c41a' : '#ff4d4f', fontSize: 24, fontWeight: 900 }}
                                                prefix={isProfit ? <RiseOutlined /> : <FallOutlined />}
                                                suffix="₫"
                                            />
                                            <Tag color={isProfit ? 'green' : 'red'} style={{ marginTop: 8, fontWeight: 800 }}>
                                                {isProfit ? 'CÓ LỜI' : 'THUA LỖ'}
                                            </Tag>
                                        </Col>
                                        <Col span={3} style={{ textAlign: 'right' }}>
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDelete(cycle.id)}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Detail Modal */}
            <Modal
                title={
                    <span style={{ color: '#fff' }}>
                        {detailType === 'revenue' ? (
                            <><ShoppingCartOutlined /> CHI TIẾT DOANH THU</>
                        ) : (
                            <><FileTextOutlined /> CHI TIẾT CHI PHÍ NGUYÊN LIỆU</>
                        )}
                    </span>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
                style={{ top: 20 }}
                className="dark-modal"
            >
                {selectedCycle && detailType === 'revenue' && (
                    <div>
                        <Card style={{ background: '#222', border: 'none', marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title={<span style={{ color: '#666' }}>TỔNG DOANH THU</span>}
                                        value={Number(selectedCycle.revenue)}
                                        valueStyle={{ color: 'var(--primary-color)' }}
                                        suffix="₫"
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title={<span style={{ color: '#666' }}>SỐ ĐƠN HÀNG</span>}
                                        value={selectedCycle.revenue_details?.totalOrders || 0}
                                        valueStyle={{ color: '#fff' }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                        <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>THỐNG KÊ THEO MÓN</Title>
                        <Table
                            dataSource={selectedCycle.revenue_details?.items || []}
                            columns={revenueItemColumns}
                            rowKey="productId"
                            pagination={false}
                            size="small"
                            className="custom-table"
                        />
                        <Collapse
                            style={{ marginTop: 24, background: '#222' }}
                            items={[{
                                key: 'orders',
                                label: <span style={{ color: '#fff' }}>CHI TIẾT TỪNG ĐƠN HÀNG ({selectedCycle.revenue_details?.orders?.length || 0} đơn)</span>,
                                children: (
                                    <List
                                        dataSource={selectedCycle.revenue_details?.orders || []}
                                        renderItem={(order: any) => (
                                            <List.Item style={{ borderBottom: '1px solid #333', padding: '12px 0' }}>
                                                <List.Item.Meta
                                                    title={<span style={{ color: '#fff' }}>Đơn #{order.orderId} - {order.tableName}</span>}
                                                    description={
                                                        <div style={{ color: '#666' }}>
                                                            <div>{dayjs(order.createdAt).format('HH:mm DD/MM/YYYY')}</div>
                                                            <div>{order.items?.map((i: any) => `${i.productName} x${i.qty}`).join(', ')}</div>
                                                        </div>
                                                    }
                                                />
                                                <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{order.total?.toLocaleString()} ₫</span>
                                            </List.Item>
                                        )}
                                    />
                                )
                            }]}
                        />
                    </div>
                )}

                {selectedCycle && detailType === 'cost' && (
                    <div>
                        <Card style={{ background: '#222', border: 'none', marginBottom: 16 }}>
                            <Statistic
                                title={<span style={{ color: '#666' }}>TỔNG CHI PHÍ NGUYÊN LIỆU</span>}
                                value={Number(selectedCycle.cost)}
                                valueStyle={{ color: 'var(--accent-color)' }}
                                suffix="₫"
                            />
                        </Card>
                        <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>CHI TIẾT TIÊU THỤ THEO LÔ HÀNG</Title>
                        <Table
                            dataSource={selectedCycle.cost_details?.items || []}
                            columns={costItemColumns}
                            rowKey="importItemId"
                            pagination={false}
                            size="small"
                            className="custom-table"
                        />
                    </div>
                )}
            </Modal>

            <style>{`
                .custom-table .ant-table {
                    background: transparent !important;
                }
                .custom-table .ant-table-thead > tr > th {
                    background: #0d0d0d !important;
                    color: #444 !important;
                    font-size: 11px !important;
                    font-weight: 900 !important;
                    border-bottom: 1px solid #333 !important;
                }
                .custom-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #222 !important;
                    color: #888;
                }
                .ant-collapse-header {
                    background: #1a1a1a !important;
                    color: #fff !important;
                }
                .ant-collapse-content {
                    background: #111 !important;
                    border-top: 1px solid #333 !important;
                }
                .dark-modal .ant-modal-content {
                    background: #1a1a1a !important;
                }
                .dark-modal .ant-modal-header {
                    background: #1a1a1a !important;
                    border-bottom: 1px solid #333 !important;
                }
            `}</style>
        </div>
    );
};

export default ProfitManagement;
