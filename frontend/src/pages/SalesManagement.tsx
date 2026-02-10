import React, { useEffect, useState, useCallback } from 'react';
import {
    Row, Col, Card, Button, Modal, Form,
    Input, Space, Typography, Tag, message,
    Empty, Spin, InputNumber, Divider, Grid, Select
} from 'antd';
import {
    PlusOutlined,
    ClockCircleOutlined,

    EyeOutlined,
    CheckCircleOutlined,
    TeamOutlined,
    DeleteOutlined,
    UserOutlined,
    DatabaseOutlined,
    ShoppingOutlined,
    DollarOutlined
} from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SalesManagement: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<any>(null);
    const [form] = Form.useForm();
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const screens = Grid.useBreakpoint();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [orderRes, prodRes, catRes] = await Promise.all([
                api.get('/orders'),
                api.get('/products'),
                api.get('/categories')
            ]);

            const rawOrders = Array.isArray(orderRes.data) ? orderRes.data : [];
            // Sort: unpaid (pending/served) first, then paid/cancelled; oldest first within group
            const isUnpaid = (s: string) => s === 'pending' || s === 'served';
            const sorted = [...rawOrders].sort((a, b) => {
                const aUp = isUnpaid(a.status) ? 0 : 1;
                const bUp = isUnpaid(b.status) ? 0 : 1;
                if (aUp !== bUp) return aUp - bUp;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            setOrders(sorted);
            setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
            setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || 'Unknown Network Error';
            message.error(`Lỗi hệ thống: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleAddOrder = () => {
        const nextSeq = orders.length > 0 ? Math.max(...orders.map(o => o.daily_seq || 0)) + 1 : 1;
        setCurrentOrder(null);
        setOrderItems([]);
        setIsAddModalVisible(true);
        form.resetFields();
        form.setFieldsValue({ daily_seq: nextSeq });
    };

    const handleViewDetail = (order: any) => {
        setCurrentOrder(order);
        setOrderItems(order.items || []);
        setIsDetailModalVisible(true);
    };

    const handleCancelOrder = async (orderId: number) => {
        Modal.confirm({
            title: 'Hủy đơn hàng',
            content: 'Dữ liệu sẽ không được tính vào doanh thu. Tiếp tục?',
            okText: 'HỦY ĐƠN',
            okType: 'danger',
            cancelText: 'QUAY LẠI',
            onOk: async () => {
                try {
                    await api.post(`/orders/${orderId}/cancel`);
                    message.success('Đã hủy đơn hàng');
                    fetchData();
                    setIsDetailModalVisible(false);
                } catch (err) {
                    message.error('Lỗi khi hủy đơn');
                }
            }
        });
    };

    const handleMarkServed = async (orderId: number) => {
        Modal.confirm({
            title: 'Xác nhận hoàn thành món',
            content: 'Bạn xác nhận đã ra hết món cho đơn hàng này?',
            okText: 'XÁC NHẬN',
            cancelText: 'HỦY',
            onOk: async () => {
                try {
                    await api.post(`/orders/${orderId}/served`);
                    message.success('Đã đánh dấu hoàn thành món');
                    fetchData();
                } catch (err) {
                    message.error('Lỗi thao tác');
                }
            }
        });
    };

    const handlePayment = async (orderId: number) => {
        Modal.confirm({
            title: 'Xác nhận thanh toán',
            content: 'Giao dịch này đã hoàn tất?',
            okText: 'XÁC NHẬN',
            cancelText: 'HỦY',
            onOk: async () => {
                try {
                    await api.post(`/orders/${orderId}/complete`, { discount: 0 });
                    message.success('Thanh toán thành công');
                    fetchData();
                    setIsDetailModalVisible(false);
                } catch (err) {
                    message.error('Thanh toán thất bại');
                }
            }
        });
    };

    const handleCreateOrder = async (values: any) => {
        if (orderItems.length === 0) {
            return message.warning('Vui lòng chọn ít nhất một món ăn');
        }
        try {
            const orderRes = await api.post('/orders', {
                table_name: values.table_name,
                customer_name: values.customer_name,
                guest_count: values.guest_count || 1
            });
            const newOrderId = orderRes.data.id;

            // Add selected items
            for (const item of orderItems) {
                await api.post(`/orders/${newOrderId}/items`, {
                    product_id: item.product_id,
                    qty: item.qty
                });
            }

            message.success('Mở bàn thành công');
            setIsAddModalVisible(false);
            fetchData();
        } catch (err) {
            console.error('Create order error:', err);
            message.error('Lỗi khi khởi tạo đơn hàng');
        }
    };

    const addProductToOrder = (product: any) => {
        if (currentOrder && (currentOrder.status === 'completed' || currentOrder.status === 'cancelled')) {
            return message.warning('Không thể chỉnh sửa đơn hàng đã khóa');
        }
        setOrderItems(prev => {
            const existing = prev.find(i => i.product_id === product.id);
            if (existing) {
                return prev.map(i => i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, {
                product_id: product.id,
                product: product,
                qty: 1,
                price_snapshot: product.price
            }];
        });
    };

    const removeProductFromOrder = (productId: number) => {
        if (currentOrder && (currentOrder.status === 'completed' || currentOrder.status === 'cancelled')) return;
        setOrderItems(prev => prev.filter(i => i.product_id !== productId));
    };

    const calculateSubtotal = () => orderItems.reduce((sum, i) => sum + (Number(i.product?.price || 0) * i.qty), 0);
    const calculatePromo = () => orderItems.reduce((sum, i) => {
        const price = Number(i.product?.price || 0);
        const promo = Number(i.product?.promo_price || price);
        return sum + (price - promo) * i.qty;
    }, 0);
    const calculateTotal = () => calculateSubtotal() - calculatePromo();

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'pending': return <Tag color="gold" style={{ borderRadius: 4, fontWeight: 800, border: 'none' }}>ĐANG PHỤC VỤ</Tag>;
            case 'served': return <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 800, border: 'none', color: '#000' }}>ĐÃ RA MÓN</Tag>;
            case 'completed': return <Tag color="#52c41a" style={{ borderRadius: 4, fontWeight: 800, border: 'none', color: '#000' }}>HOÀN TẤT</Tag>;
            case 'cancelled': return <Tag color="#ff4d4f" style={{ borderRadius: 4, fontWeight: 800, border: 'none', color: '#fff' }}>HỦY BỎ</Tag>;
            default: return <Tag color="default">{status?.toUpperCase()}</Tag>;
        }
    };

    return (
        <div className="sales-management animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: screens.md ? 'row' : 'column', justifyContent: 'space-between', alignItems: screens.md ? 'center' : 'flex-start', marginBottom: 32, gap: 16 }}>
                <div>
                    <Title level={2} style={{ color: 'var(--primary-color)', margin: 0, fontStyle: 'italic', letterSpacing: -1, fontSize: screens.md ? 24 : 20 }}>
                        QUẢN LÝ BÁN HÀNG
                    </Title>
                    <Text style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: screens.md ? 14 : 12 }}>Theo dõi và xử lý đơn hàng theo thời gian thực</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddOrder}
                    style={{
                        height: 54,
                        padding: screens.md ? '0 40px' : '0 20px',
                        width: screens.md ? 'auto' : '100%',
                        fontSize: 18,
                        fontWeight: 900,
                        borderRadius: 8,
                        boxShadow: '0 4px 15px rgba(250, 219, 20, 0.3)'
                    }}
                >
                    MỞ BÀN MỚI
                </Button>
            </div>

            {loading && orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 100 }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, color: 'var(--primary-color)', fontWeight: 700 }}>ĐANG ĐỒNG BỘ DỮ LIỆU...</div>
                </div>
            ) : orders.length === 0 ? (
                <div className="glass-card" style={{ padding: 80, textAlign: 'center' }}>
                    <Empty description={<span style={{ color: '#666', fontSize: 16 }}>CHƯA CÓ GIAO DỊCH</span>} />
                </div>
            ) : (
                <Row gutter={[24, 24]}>
                    {orders.map(order => (
                        <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
                            <Card
                                className={`glass-card order-card ${(order.status === 'completed' || order.status === 'cancelled') ? 'paid-card' : ''}`}
                                style={{
                                    background: '#141414',
                                    borderWidth: '2px',
                                    borderStyle: 'solid',
                                    borderColor: order.status === 'pending' ? 'var(--primary-color)'
                                        : order.status === 'served' ? '#13c2c2'
                                            : order.status === 'cancelled' ? '#ff4d4f'
                                                : '#222',
                                    opacity: (order.status === 'completed' || order.status === 'cancelled') ? 0.55 : 1,
                                    borderRadius: 12,
                                    overflow: 'hidden'
                                }}
                                hoverable
                                onClick={() => handleViewDetail(order)}
                            >
                                <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            background: 'var(--primary-color)',
                                            color: '#000',
                                            width: 36,
                                            height: 36,
                                            borderRadius: 8,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontWeight: 900,
                                            fontSize: 16,
                                            transform: 'rotate(-5deg)'
                                        }}>
                                            {order.daily_seq}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, color: '#444', fontWeight: 900, letterSpacing: 1 }}>MÃ ĐƠN</div>
                                            <div style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>#{order.id?.toString().padStart(4, '0')}</div>
                                        </div>
                                    </div>
                                    {order.status === 'pending' ? (
                                        <Button
                                            size="small"
                                            style={{
                                                borderRadius: 4,
                                                fontWeight: 900,
                                                background: '#13c2c2',
                                                color: '#000',
                                                border: 'none',
                                                fontSize: 10
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkServed(order.id);
                                            }}
                                        >
                                            HOÀN THÀNH
                                        </Button>
                                    ) : getStatusTag(order.status)}
                                </div>

                                <Title level={4} style={{ color: '#fff', margin: '0 0 4px 0', textTransform: 'uppercase', fontSize: 18, fontWeight: 800 }}>
                                    {order.customer_name || 'KHÁCH VÃNG LAI'}
                                </Title>
                                <div style={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: 13, marginBottom: 16 }}>
                                    VỊ TRÍ: {order.table_name || order.table?.name || 'MANG VỀ'}
                                </div>

                                <Space direction="vertical" size={10} style={{ width: '100%', marginBottom: 24, padding: '12px', background: '#0a0a0a', borderRadius: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#888', fontSize: 13 }}>
                                        <ClockCircleOutlined />
                                        <span>{dayjs(order.createdAt).format('HH:mm | DD.MM')}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#888', fontSize: 13 }}>
                                        <TeamOutlined />
                                        <span>Số lượng: <b style={{ color: '#fff' }}>{order.guest_count} KHÁCH</b></span>
                                    </div>
                                    <Divider style={{ margin: '8px 0', borderColor: '#222' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                        <Text style={{ color: '#555' }}>TỔNG GỐC</Text>
                                        <Text style={{ color: '#888' }}>{Number(order.total || 0).toLocaleString()} ₫</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                        <Text style={{ color: '#555' }}>GIẢM GIÁ</Text>
                                        <Text style={{ color: 'var(--accent-color)' }}>-{Number(order.discount || 0).toLocaleString()} ₫</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        <Text style={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: 10 }}>THÀNH TIỀN</Text>
                                        <Text style={{ color: 'var(--primary-color)', fontSize: 24, fontWeight: 900 }}>
                                            {Number(order.final_total || 0).toLocaleString()} ₫
                                        </Text>
                                    </div>
                                </Space>

                                <Row gutter={8}>
                                    <Col span={10}>
                                        <Button
                                            block
                                            size="large"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewDetail(order)}
                                            style={{ background: 'transparent', border: '2px solid #333', color: '#fff', fontWeight: 700 }}
                                        >
                                            CHI TIẾT
                                        </Button>
                                    </Col>
                                    <Col span={14}>
                                        {(order.status === 'pending' || order.status === 'served') ? (
                                            <Button
                                                block
                                                size="large"
                                                type="primary"
                                                icon={<DollarOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePayment(order.id);
                                                }}
                                                style={{ fontWeight: 800 }}
                                            >
                                                THANH TOÁN
                                            </Button>
                                        ) : order.status === 'cancelled' ? (
                                            <Button
                                                block
                                                size="large"
                                                disabled
                                                style={{ background: '#2a1215', color: '#ff4d4f', border: '1px solid #ff4d4f33', fontWeight: 800 }}
                                            >
                                                ĐÃ HỦY
                                            </Button>
                                        ) : (
                                            <Button
                                                block
                                                size="large"
                                                disabled
                                                icon={<CheckCircleOutlined />}
                                                style={{ background: '#162312', color: '#52c41a', border: '1px solid #52c41a33', fontWeight: 800 }}
                                            >
                                                ĐÃ THANH TOÁN
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Modal ADD NEW ORDER */}
            <Modal
                title={<span style={{ fontStyle: 'italic', fontWeight: 900, fontSize: 20, color: 'var(--primary-color)' }}>KHỞI TẠO ĐƠN HÀNG</span>}
                open={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                onOk={() => form.submit()}
                width={screens.md ? 1100 : '100%'}
                okText="XÁC NHẬN MỞ BÀN"
                cancelText="HỦY"
                className="anime-modal"
                style={{ top: screens.md ? 100 : 0, padding: 0 }}
                styles={{ body: { background: '#141414', padding: screens.md ? 24 : 12, borderTop: '2px solid #333' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateOrder}>
                    <Row gutter={[32, 24]}>
                        <Col xs={24} lg={9}>
                            <Title level={5} style={{ color: 'var(--primary-color)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ShoppingOutlined /> THÔNG TIN
                            </Title>

                            <Form.Item label={<span style={{ color: '#aaa', fontWeight: 800, fontSize: 12 }}>TÊN KHÁCH HÀNG</span>} name="customer_name">
                                <Input placeholder="Tên khách / Mã thẻ" style={{ background: '#000', border: '2px solid #333', color: '#fff', height: 45 }} prefix={<UserOutlined style={{ color: '#444' }} />} />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={15}>
                                    <Form.Item label={<span style={{ color: '#aaa', fontWeight: 800, fontSize: 12 }}>SỐ BÀN / VỊ TRÍ</span>} name="table_name" rules={[{ required: true, message: 'Nhập số bàn/vị trí' }]}>
                                        <Input placeholder="Ví dụ: Bàn 05" style={{ background: '#000', border: '2px solid #333', color: '#fff', height: 45 }} />
                                    </Form.Item>
                                </Col>
                                <Col span={9}>
                                    <Form.Item label={<span style={{ color: '#aaa', fontWeight: 800, fontSize: 12 }}>SỐ KHÁCH</span>} name="guest_count" initialValue={1}>
                                        <InputNumber min={1} style={{ width: '100%', background: '#000', border: '2px solid #333', color: '#fff', height: 45, display: 'flex', alignItems: 'center' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="order-summary-box" style={{ background: '#000', padding: 24, borderRadius: 12, marginTop: 30, border: '2px solid #222', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text style={{ color: '#555', fontWeight: 800, fontSize: 12 }}>TẠM TÍNH</Text>
                                    <Text style={{ color: '#fff', fontWeight: 700 }}>{calculateSubtotal().toLocaleString()} ₫</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text style={{ color: '#555', fontWeight: 800, fontSize: 12 }}>KHUYẾN MÃI</Text>
                                    <Text style={{ color: 'var(--accent-color)', fontWeight: 700 }}>-{calculatePromo().toLocaleString()} ₫</Text>
                                </div>
                                <Divider style={{ margin: '16px 0', borderColor: '#222' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: 12 }}>TỔNG CỘNG</Text>
                                    <Text style={{ color: 'var(--primary-color)', fontSize: 32, fontWeight: 900 }}>{calculateTotal().toLocaleString()} ₫</Text>
                                </div>
                            </div>
                        </Col>



                        <Col xs={24} lg={15}>
                            <Title level={5} style={{ color: 'var(--primary-color)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <DatabaseOutlined /> DANH SÁCH MÓN
                            </Title>

                            <Space wrap style={{ marginBottom: 20 }}>
                                <Button
                                    className={selectedCategory === null ? 'anime-btn-active' : 'anime-btn'}
                                    onClick={() => setSelectedCategory(null)}
                                    style={{ background: selectedCategory === null ? 'var(--primary-color)' : '#222', color: selectedCategory === null ? '#000' : '#fff', border: 'none', fontWeight: 800, borderRadius: 4 }}
                                >
                                    TẤT CẢ
                                </Button>
                                {categories.map(cat => (
                                    <Button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        style={{ background: selectedCategory === cat.id ? 'var(--primary-color)' : '#1a1a1a', color: selectedCategory === cat.id ? '#000' : '#888', border: 'none', fontWeight: 800, borderRadius: 4 }}
                                    >
                                        {cat.name?.toUpperCase()}
                                    </Button>
                                ))}
                            </Space>

                            <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 24, padding: 12, background: '#0a0a0a', borderRadius: 12, border: '1px solid #222' }} className="custom-scroll">
                                <Row gutter={[12, 12]}>
                                    {products
                                        .filter(p => selectedCategory === null || p.category_id === selectedCategory)
                                        .map(p => (
                                            <Col xs={12} sm={8} md={6} lg={8} key={p.id}>
                                                <Card
                                                    size="small"
                                                    hoverable
                                                    style={{ background: '#141414', border: '1px solid #222', borderRadius: 8 }}
                                                    onClick={() => addProductToOrder(p)}
                                                >
                                                    <div style={{ fontWeight: 800, color: '#fff', fontSize: 12, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name?.toUpperCase()}</div>
                                                    <div style={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: 14 }}>{Number(p.promo_price || p.price).toLocaleString()} <span style={{ fontSize: 10 }}>₫</span></div>
                                                </Card>
                                            </Col>
                                        ))}
                                    {products.length === 0 && <div style={{ width: '100%', padding: 40, textAlign: 'center', color: '#444' }}>KHÔNG CÓ DỮ LIỆU</div>}
                                </Row>
                            </div>

                            <Title level={5} style={{ color: 'var(--primary-color)', marginBottom: 16 }}>GIỎ HÀNG</Title>
                            <div style={{ background: '#000', borderRadius: 12, overflowX: 'auto', border: '1px solid #222' }}>
                                <table style={{ width: '100%', color: '#fff' }} className="items-table">
                                    <thead style={{ background: '#141414' }}>
                                        <tr>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#444', fontSize: 10 }}>TÊN MÓN</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', color: '#444', fontSize: 10 }}>SL</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right', color: '#444', fontSize: 10 }}>THÀNH TIỀN</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', color: '#444', fontSize: 10 }}>TÁC VỤ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map(item => (
                                            <tr key={item.product_id} style={{ borderBottom: '1px solid #111' }}>
                                                <td style={{ padding: '14px 16px', fontWeight: 700 }}>{item.product?.name}</td>
                                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                    <Space style={{ background: '#141414', padding: '2px 8px', borderRadius: 6 }}>
                                                        <Button
                                                            size="small"
                                                            type="text"
                                                            style={{ color: 'var(--primary-color)', fontWeight: 900 }}
                                                            disabled={currentOrder?.status === 'completed'}
                                                            onClick={() => {
                                                                const newQty = Math.max(1, item.qty - 1);
                                                                setOrderItems(orderItems.map(i => i.product_id === item.product_id ? { ...i, qty: newQty } : i));
                                                            }}
                                                        >-</Button>
                                                        <span style={{ minWidth: 20, display: 'inline-block', fontWeight: 900, color: 'var(--primary-color)' }}>{item.qty}</span>
                                                        <Button
                                                            size="small"
                                                            type="text"
                                                            style={{ color: 'var(--primary-color)', fontWeight: 900 }}
                                                            disabled={currentOrder?.status === 'completed'}
                                                            onClick={() => {
                                                                setOrderItems(orderItems.map(i => i.product_id === item.product_id ? { ...i, qty: item.qty + 1 } : i));
                                                            }}
                                                        >+</Button>
                                                    </Space>
                                                </td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800 }}>
                                                    {(item.qty * Number(item.product?.promo_price || item.product?.price)).toLocaleString()} ₫
                                                </td>
                                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        disabled={currentOrder?.status === 'completed'}
                                                        onClick={() => removeProductFromOrder(item.product_id)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        {orderItems.length === 0 && (
                                            <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#333', fontStyle: 'italic' }}>CHỌN MÓN TỪ DANH SÁCH</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* DETAIL MODAL */}
            <Modal
                title={<span style={{ fontStyle: 'italic', fontWeight: 900, color: 'var(--primary-color)' }}>CHI TIẾT ĐƠN HÀNG #{(currentOrder?.id || 0).toString().padStart(4, '0')}</span>}
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}

                footer={[
                    <Button
                        key="close"
                        style={{ borderRadius: 4, fontWeight: 700, marginRight: 'auto' }}
                        onClick={() => setIsDetailModalVisible(false)}
                    >
                        ĐÓNG
                    </Button>,
                    currentOrder?.status === 'pending' && (
                        <Button
                            key="cancel_order"
                            danger
                            style={{ borderRadius: 4, fontWeight: 700 }}
                            onClick={() => handleCancelOrder(currentOrder.id)}
                        >
                            HỦY ĐƠN
                        </Button>
                    ),

                    (currentOrder?.status === 'pending' || currentOrder?.status === 'served') && (
                        <Button
                            key="pay"
                            type="primary"
                            style={{ borderRadius: 4, fontWeight: 900 }}
                            icon={<DollarOutlined />}
                            onClick={() => handlePayment(currentOrder.id)}
                        >
                            THANH TOÁN
                        </Button>
                    )
                ].filter(Boolean)}
                width={screens.md ? 750 : '100%'}
                className="anime-modal"
                style={{ top: screens.md ? 100 : 0, padding: 0 }}
                styles={{ body: { background: '#141414', padding: screens.md ? 32 : 16 } }}
            >
                {currentOrder && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: screens.md ? '1fr 1fr' : '1fr', gap: screens.md ? 32 : 16, marginBottom: 40 }}>
                            <div style={{ borderLeft: '4px solid var(--primary-color)', paddingLeft: 16 }}>
                                <div style={{ color: '#444', fontSize: 10, fontWeight: 900 }}>KHÁCH HÀNG</div>
                                <Title level={3} style={{ color: '#fff', margin: 0, textTransform: 'uppercase' }}>{currentOrder.customer_name || 'KHÁCH VÃNG LAI'}</Title>
                            </div>
                            <div style={{ borderLeft: '4px solid var(--primary-color)', paddingLeft: 16 }}>
                                <div style={{ color: '#444', fontSize: 10, fontWeight: 900 }}>VỊ TRÍ</div>
                                <Title level={3} style={{ color: 'var(--primary-color)', margin: 0 }}>{currentOrder.table_name || currentOrder.table?.name || 'MANG VỀ'}</Title>
                            </div>
                        </div>

                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Title level={5} style={{ color: '#555', margin: 0 }}>CHI TIẾT MÓN</Title>
                            <span style={{ color: '#333', fontSize: 10 }}>Thời gian: {dayjs(currentOrder.createdAt).format('HH:mm DD/MM/YYYY')}</span>
                        </div>
                        <table style={{ width: '100%', color: '#fff', marginBottom: 40, borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#111', borderBottom: '2px solid #222' }}>
                                <tr>
                                    <th style={{ padding: 16, textAlign: 'left', color: '#444', fontSize: 10 }}>TÊN MÓN</th>
                                    <th style={{ padding: 16, textAlign: 'center', color: '#444', fontSize: 10 }}>ĐVT/SL</th>
                                    <th style={{ padding: 16, textAlign: 'right', color: '#444', fontSize: 10 }}>ĐƠN GIÁ</th>
                                    <th style={{ padding: 16, textAlign: 'right', color: '#444', fontSize: 10 }}>THÀNH TIỀN</th>
                                    {(currentOrder.status === 'pending' || currentOrder.status === 'served') && (
                                        <th style={{ padding: 16, textAlign: 'center', color: '#444', fontSize: 10, width: 50 }}>XÓA</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrder.items?.map((item: any) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                                        <td style={{ padding: 16, fontWeight: 700 }}>{item.product?.name}</td>
                                        <td style={{ padding: 16, textAlign: 'center', color: '#888' }}>
                                            {(currentOrder.status === 'completed' || currentOrder.status === 'cancelled') ? (
                                                <span>{item.qty} {item.product?.unit?.name}</span>
                                            ) : (
                                                <Space>
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        style={{ color: 'var(--primary-color)', fontWeight: 900, background: '#1a1a1a', border: '1px solid #333' }}
                                                        onClick={() => {
                                                            const newQty = Math.max(1, item.qty - 1);
                                                            if (newQty === item.qty) return;
                                                            api.put(`/orders/items/${item.id}`, { qty: newQty }).then(res => {
                                                                if (res.data) {
                                                                    setCurrentOrder(res.data);
                                                                    fetchData();
                                                                }
                                                            });
                                                        }}
                                                    >-</Button>
                                                    <span style={{ minWidth: 20, display: 'inline-block', fontWeight: 900, color: '#fff' }}>{item.qty}</span>
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        style={{ color: 'var(--primary-color)', fontWeight: 900, background: '#1a1a1a', border: '1px solid #333' }}
                                                        onClick={() => {
                                                            api.put(`/orders/items/${item.id}`, { qty: item.qty + 1 }).then(res => {
                                                                if (res.data) {
                                                                    setCurrentOrder(res.data);
                                                                    fetchData();
                                                                }
                                                            });
                                                        }}
                                                    >+</Button>
                                                </Space>
                                            )}
                                        </td>
                                        <td style={{ padding: 16, textAlign: 'right', color: '#888' }}>
                                            {Number(item.price_original || item.price_snapshot).toLocaleString()} ₫
                                            {item.price_original && Number(item.price_original) > Number(item.price_snapshot) && (
                                                <div style={{ fontSize: 10, color: 'var(--accent-color)', textDecoration: 'line-through' }}>
                                                    {Number(item.price_snapshot).toLocaleString()} ₫
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: 16, textAlign: 'right', fontWeight: 800 }}>{(item.qty * Number(item.price_snapshot)).toLocaleString()} ₫</td>
                                        {(currentOrder.status === 'pending' || currentOrder.status === 'served') && (
                                            <td style={{ padding: 16, textAlign: 'center' }}>
                                                <Button
                                                    type="text"
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => {
                                                        api.put(`/orders/items/${item.id}`, { qty: 0 }).then(res => {
                                                            if (res.data) {
                                                                setCurrentOrder(res.data);
                                                                fetchData();
                                                                message.success('Đã xóa món');
                                                            }
                                                        });
                                                    }}
                                                />
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ADD ITEM SECTION - only for editable orders */}
                        {(currentOrder.status === 'pending' || currentOrder.status === 'served') && (
                            <div style={{ marginBottom: 32, background: '#0d0d0d', padding: 16, borderRadius: 12, border: '1px dashed #333' }}>
                                <div style={{ color: '#555', fontSize: 10, fontWeight: 900, marginBottom: 10, letterSpacing: 1 }}>THÊM MÓN MỚI</div>
                                <Select
                                    showSearch
                                    style={{ width: '100%' }}
                                    placeholder="Tìm và chọn món để thêm..."
                                    optionFilterProp="label"
                                    filterOption={(input, option) =>
                                        (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    onSelect={(productId: number) => {
                                        api.post(`/orders/${currentOrder.id}/items`, { product_id: productId, qty: 1 }).then(res => {
                                            if (res.data) {
                                                setCurrentOrder(res.data);
                                                fetchData();
                                                message.success('Đã thêm món');
                                            }
                                        }).catch(() => message.error('Lỗi thêm món'));
                                    }}
                                    value={null as any}
                                    options={products.map((p: any) => ({
                                        value: p.id,
                                        label: `${p.name} — ${Number(p.promo_price || p.price).toLocaleString()}₫`
                                    }))}
                                    dropdownStyle={{ background: '#1a1a1a' }}
                                />
                            </div>
                        )}


                        <div style={{ background: '#000', padding: 32, borderRadius: 16, border: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at top right, rgba(250,219,20,0.05), transparent)' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <Text style={{ color: '#444', fontWeight: 900, fontSize: 12 }}>TỔNG TIỀN HÀNG</Text>
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{Number(currentOrder.total).toLocaleString()} ₫</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <Text style={{ color: '#444', fontWeight: 900, fontSize: 12 }}>KHUYẾN MÃI</Text>
                                <Text style={{ color: 'var(--accent-color)', fontSize: 18, fontWeight: 700 }}>-{Number(currentOrder.discount).toLocaleString()} ₫</Text>
                            </div>
                            <Divider style={{ margin: '24px 0', borderColor: '#222' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: 'var(--primary-color)', fontSize: 16, fontWeight: 900 }}>TỔNG THANH TOÁN</Text>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--primary-color)', fontSize: 42, fontWeight: 900, lineHeight: 1 }}>{Number(currentOrder.final_total).toLocaleString()} ₫</div>
                                    <div style={{ color: '#222', fontSize: 10, fontWeight: 900, marginTop: 10 }}>ĐÃ BAO GỒM THUẾ</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Modal>

            <style>{`
                .order-card {
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .order-card:hover {
                    transform: translateY(-12px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(250,219,20,0.1);
                }
                .paid-card {
                    background: #0a0a0a !important;
                    border-color: #111 !important;
                }
                .custom-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: #111;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
                .anime-btn {
                    transition: all 0.3s;
                }
                .anime-btn:hover {
                    background: #333 !important;
                    color: var(--primary-color) !important;
                }
            `}</style>
        </div >
    );
};

export default SalesManagement;
