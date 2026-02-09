import React, { useEffect, useState, useCallback } from 'react';
import {
    Row, Col, Card, Typography, Table,
    Tag, Space, Button, Statistic,
    message, DatePicker, List,
    Avatar
} from 'antd';
import {
    HistoryOutlined,
    DollarCircleOutlined,
    ShoppingOutlined,
    PercentageOutlined,
    ArrowUpOutlined,
    TrophyOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend
);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReportManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('day'),
        dayjs().endOf('day')
    ]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [start, end] = dateRange;
            const res = await api.get('/reports/stats', {
                params: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                }
            });
            setData(res.data);
        } catch (err: any) {
            console.error('Report fetch error:', err);
            message.error('Không thể tải báo cáo');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Chart Configuration
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#fff' }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                ticks: { color: '#888' },
                grid: { color: '#333' }
            },
            x: {
                ticks: { color: '#888' },
                grid: { display: false }
            }
        }
    };

    const chartData = {
        labels: data?.chartData?.map((d: any) => d.label) || [],
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: data?.chartData?.map((d: any) => d.value) || [],
                borderColor: '#fadb14',
                backgroundColor: 'rgba(250, 219, 20, 0.8)',
                borderRadius: 4,
                barThickness: 'flex' as const,
                maxBarThickness: 40,
            },
        ],
    };

    const itemColumns = [
        {
            title: 'MÓN ĂN',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span style={{ color: '#fff', fontWeight: 600 }}>{text}</span>
        },
        {
            title: 'SỐ LƯỢNG BÁN',
            dataIndex: 'qty',
            key: 'qty',
            align: 'center' as const,
            render: (val: number) => <Tag color="#fff" style={{ color: '#000', fontWeight: 800 }}>{val}</Tag>
        },
        {
            title: 'DOANH THU',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right' as const,
            render: (val: number) => <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{val.toLocaleString()} ₫</span>
        }
    ];

    return (
        <div className="report-management animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ color: 'var(--primary-color)', margin: 0, fontStyle: 'italic', letterSpacing: -1 }}>
                        BÁO CÁO & THỐNG KÊ
                    </Title>
                    <Text style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Phân tích hiệu quả kinh doanh chi tiết</Text>
                </div>
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setDateRange([dates[0], dates[1]]);
                            }
                        }}
                        style={{ background: '#000', border: '1px solid #333', color: '#fff' }}
                        format="DD/MM/YYYY"
                    />
                    <Button
                        icon={<HistoryOutlined />}
                        onClick={fetchData}
                        style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                    >
                        LÀM MỚI
                    </Button>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} sm={8}>
                    <Card className="glass-card stat-card" style={{ background: '#141414', border: '1px solid #222' }}>
                        <Statistic
                            title={<span style={{ color: '#555', fontWeight: 800, fontSize: 12 }}>DOANH THU THỰC TẾ</span>}
                            value={data?.overview?.totalRevenue || 0}
                            precision={0}
                            valueStyle={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: 28 }}
                            prefix={<DollarCircleOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-card stat-card" style={{ background: '#141414', border: '1px solid #222' }}>
                        <Statistic
                            title={<span style={{ color: '#555', fontWeight: 800, fontSize: 12 }}>SỐ LƯỢNG ĐƠN HÀNG</span>}
                            value={data?.overview?.totalOrders || 0}
                            valueStyle={{ color: '#fff', fontWeight: 900, fontSize: 28 }}
                            prefix={<ShoppingOutlined />}
                            suffix="ĐƠN"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-card stat-card" style={{ background: '#141414', border: '1px solid #222' }}>
                        <Statistic
                            title={<span style={{ color: '#555', fontWeight: 800, fontSize: 12 }}>GIẢM GIÁ / KHUYẾN MÃI</span>}
                            value={data?.overview?.totalDiscount || 0}
                            precision={0}
                            valueStyle={{ color: 'var(--accent-color)', fontWeight: 900, fontSize: 28 }}
                            prefix={<PercentageOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col span={16}>
                    <Card className="glass-card" style={{ background: '#141414', border: '1px solid #222', height: '100%' }}>
                        <Title level={5} style={{ color: '#fff', marginBottom: 24, fontStyle: 'italic' }}>
                            <BarChartOutlined /> BIỂU ĐỒ DOANH THU
                        </Title>
                        <div style={{ height: 350 }}>
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="glass-card" style={{ background: '#141414', border: '1px solid #222', height: '100%' }}>
                        <Title level={5} style={{ color: '#fff', marginBottom: 24, fontStyle: 'italic' }}>
                            <TrophyOutlined style={{ color: 'gold' }} /> TOP TRENDING
                        </Title>
                        <List
                            itemLayout="horizontal"
                            dataSource={data?.trending || []}
                            renderItem={(item: any, index) => (
                                <List.Item style={{ borderBottom: '1px solid #222', padding: '12px 0' }}>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                style={{
                                                    backgroundColor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : '#333',
                                                    color: index < 3 ? '#000' : '#fff',
                                                    fontWeight: 800
                                                }}
                                            >
                                                {index + 1}
                                            </Avatar>
                                        }
                                        title={<span style={{ color: '#fff' }}>{item.name}</span>}
                                        description={<span style={{ color: 'var(--primary-color)', fontSize: 12 }}>{item.revenue.toLocaleString()} ₫ ({item.qty} bán)</span>}
                                    />
                                    <div style={{ color: '#444' }}><ArrowUpOutlined /></div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
                <Card className="glass-card" style={{ background: '#141414', border: '1px solid #222' }}>
                    <Title level={5} style={{ color: '#fff', marginBottom: 24, fontStyle: 'italic' }}>CHI TIẾT DOANH SỐ THEO MÓN</Title>
                    <Table
                        loading={loading}
                        dataSource={data?.salesByItem || []}
                        columns={itemColumns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="custom-table"
                    />
                </Card>
            </div>

            <style>{`
                .ant-picker {
                    background: #141414 !important;
                    border: 1px solid #333 !important;
                }
                .ant-picker-input > input {
                    color: #fff !important;
                }
                .ant-picker-suffix {
                    color: #666 !important;
                }
                .custom-table .ant-table {
                    background: transparent !important;
                    color: #fff !important;
                }
                .custom-table .ant-table-thead > tr > th {
                    background: #0d0d0d !important;
                    color: #444 !important;
                    font-size: 11px !important;
                    font-weight: 900 !important;
                    border-bottom: 1px solid #222 !important;
                }
                .custom-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #111 !important;
                }
                .custom-table .ant-table-tbody > tr:hover > td {
                    background: #1a1a1a !important;
                }
            `}</style>
        </div>
    );
};

export default ReportManagement;
