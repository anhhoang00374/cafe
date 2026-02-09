import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Card, Row, Col, DatePicker, message, Divider } from 'antd';
import { PlusOutlined, ShoppingCartOutlined, HistoryOutlined, SaveOutlined, DeleteOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const StockImport: React.FC = () => {
    const [imports, setImports] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isStockModalVisible, setIsStockModalVisible] = useState(false);
    const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false);
    const [selectedImport, setSelectedImport] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [form] = Form.useForm();
    const [stockForm] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchIngredients();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/imports');
            setImports(res.data);
        } catch (err) {
            message.error('Failed to load imports');
        }
    };

    const fetchIngredients = async () => {
        try {
            const res = await api.get('/ingredients');
            setIngredients(res.data || []);
        } catch (err) {
            console.error('Failed to load ingredients');
        }
    };

    const handleAdd = () => {
        form.resetFields();
        form.setFieldsValue({
            date: dayjs(),
            items: [{}]
        });
        setIsAddModalVisible(true);
    };

    const onFinish = async (values: any) => {
        try {
            const payload = {
                date: values.date.format('YYYY-MM-DD HH:mm:ss'),
                supplier: values.supplier,
                items: values.items
            };
            await api.post('/imports', payload);
            message.success('Stock import created successfully');
            setIsAddModalVisible(false);
            fetchData();
        } catch (err) {
            message.error('Operation failed');
        }
    };

    const handleShowDetails = (record: any) => {
        setSelectedImport(record);
        setIsDetailModalVisible(true);
    };

    const handleUpdateStock = (item: any) => {
        setSelectedItem(item);
        stockForm.setFieldsValue({
            remaining_qty: item.remaining_qty,
            cost_price: item.cost_price
        });
        setIsStockModalVisible(true);
    };

    const onUpdateStockFinish = async (values: any) => {
        try {
            await api.patch(`/imports/items/${selectedItem.id}/stock`, values);
            message.success('Cập nhật lô hàng thành công');
            setIsStockModalVisible(false);

            // Refresh data
            const res = await api.get('/imports');
            const data = res.data;
            setImports(data);

            // Also update the detail modal if it's open
            if (selectedImport) {
                const found = data.find((i: any) => i.id === selectedImport.id);
                setSelectedImport(found);
            }
        } catch (err) {
            message.error('Cập nhật thất bại');
        }
    };

    return (
        <div className="animate-fade-in" style={{ color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ color: 'var(--primary-color)', margin: 0, fontStyle: 'italic', textTransform: 'uppercase' }}>Quản lý Nhập Kho</Title>
                    <Text style={{ color: 'var(--text-secondary)' }}>Theo dõi lô hàng và quản lý nhập kho</Text>
                </div>
                <Space>
                    <Button
                        icon={<HistoryOutlined />}
                        onClick={() => setIsInventoryModalVisible(true)}
                        style={{ height: 50, padding: '0 24px', fontSize: 16, fontWeight: 700, background: 'transparent', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}
                    >
                        QUẢN LÝ HÀNG TỒN KHO
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        style={{ height: 50, padding: '0 32px', fontSize: 16, fontWeight: 700 }}
                    >
                        NHẬP HÀNG MỚI
                    </Button>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                {imports.map((item) => {
                    const totalAmount = item.items?.reduce((sum: number, i: any) => {
                        const price = parseFloat(i.cost_price || 0);
                        return sum + (isNaN(price) ? 0 : price * (i.qty || 0));
                    }, 0) || 0;
                    return (
                        <Col xs={24} md={12} lg={8} key={item.id}>
                            <Card
                                className="glass-card"
                                style={{
                                    background: '#141414',
                                    border: '2px solid var(--glass-border)',
                                    overflow: 'hidden',
                                    padding: '12px'
                                }}
                                bodyStyle={{ padding: 12 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: 12, marginBottom: 16 }}>
                                    <Space direction="vertical" size={0}>
                                        <Text style={{ color: 'var(--primary-color)', fontWeight: 800 }}>MÃ ĐƠN: #{item.id.toString().padStart(4, '0')}</Text>
                                        <Text style={{ color: '#999', fontSize: 12 }}>{dayjs(item.date).format('DD/MM/YYYY HH:mm')}</Text>
                                    </Space>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>{totalAmount.toLocaleString()} đ</div>
                                        <Text style={{ color: 'var(--text-secondary)', fontSize: 10 }}>TỔNG GIÁ TRỊ</Text>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                        <ShoppingCartOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                                        <Text style={{ color: '#fff' }}>{item.items?.length || 0} Sản phẩm nguyên liệu</Text>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <UserOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                                        <Text style={{ color: '#fff' }}>NCC: {item.supplier || 'N/A'}</Text>
                                    </div>
                                </div>

                                <Button
                                    block
                                    icon={<InfoCircleOutlined />}
                                    onClick={() => handleShowDetails(item)}
                                    style={{ background: 'transparent', border: '1px solid #333', color: '#fff', borderRadius: 0, fontWeight: 700 }}
                                >
                                    CHI TIẾT ĐƠN HÀNG
                                </Button>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* ADD IMPORT MODAL */}
            <Modal
                title="TẠO ĐƠN NHẬP KHO MỚI"
                open={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                footer={null}
                width={800}
                className="anime-modal"
                styles={{ body: { background: '#141414', border: '3px solid var(--primary-color)', borderRadius: '0 0 8px 8px' } }}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 20 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="date" label={<span style={{ color: '#fff' }}>THỜI GIAN NHẬP</span>} rules={[{ required: true }]}>
                                <DatePicker showTime style={{ width: '100%', background: '#000', border: '2px solid #333', color: '#fff' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="supplier" label={<span style={{ color: '#fff' }}>NHÀ CUNG CẤP / NỘI NHẬP</span>}>
                                <Input style={{ background: '#000', border: '2px solid #333', color: '#fff' }} placeholder="Tên NCC hoặc nguồn nhập..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation={"left" as any} style={{ borderColor: '#333' }}><span style={{ color: 'var(--primary-color)' }}>DANH SÁCH CHI TIẾT</span></Divider>

                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row key={key} gutter={12} align="bottom" style={{ marginBottom: 16 }}>
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'ingredient_id']}
                                                label={name === 0 ? <span style={{ color: '#aaa', fontSize: 11 }}>NGUYÊN LIỆU</span> : ""}
                                                rules={[{ required: true, message: 'Chọn n.liệu' }]}
                                            >
                                                <Select
                                                    placeholder="Chọn nguyên liệu"
                                                    style={{ width: '100%' }}
                                                    dropdownStyle={{ background: '#141414' }}
                                                >
                                                    {ingredients.map(ing => (
                                                        <Option key={ing.id} value={ing.id}>{ing.name} ({ing.unit?.name})</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'qty']}
                                                label={name === 0 ? <span style={{ color: '#aaa', fontSize: 11 }}>SỐ LƯỢNG</span> : ""}
                                                rules={[{ required: true }]}
                                            >
                                                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'cost_price']}
                                                label={name === 0 ? <span style={{ color: '#aaa', fontSize: 11 }}>ĐƠN GIÁ (đ)</span> : ""}
                                                rules={[{ required: true }]}
                                            >
                                                <InputNumber min={0} style={{ width: '100%' }}
                                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} style={{ marginBottom: 8 }} />
                                        </Col>
                                    </Row>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)', marginBottom: 24, height: 45 }}>
                                    THÊM DÒNG NGUYÊN LIỆU
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setIsAddModalVisible(false)} style={{ borderRadius: 0 }}>HỦY BỎ</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ borderRadius: 0 }}>LƯU ĐƠN NHẬP</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* DETAIL MODAL */}
            <Modal
                title={`CHI TIẾT ĐƠN NHẬP #${selectedImport?.id.toString().padStart(4, '0')}`}
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
                width={900}
                className="anime-modal"
                styles={{ body: { background: '#141414', border: '3px solid var(--primary-color)', borderRadius: '0 0 8px 8px' } }}
            >
                {selectedImport && (
                    <div style={{ color: '#fff', paddingTop: 10 }}>
                        <Row gutter={24} style={{ marginBottom: 24, padding: '0 10px' }}>
                            <Col span={8}>
                                <Text style={{ color: '#999', fontSize: 12 }}>THỜI GIAN NHẬP:</Text>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{dayjs(selectedImport.date).format('DD/MM/YYYY HH:mm')}</div>
                            </Col>
                            <Col span={8}>
                                <Text style={{ color: '#999', fontSize: 12 }}>NHÀ CUNG CẤP:</Text>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedImport.supplier || 'N/A'}</div>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <Text style={{ color: '#999', fontSize: 12 }}>TỔNG GIÁ TRỊ:</Text>
                                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary-color)' }}>
                                    {(selectedImport.items?.reduce((sum: number, i: any) => {
                                        const price = parseFloat(i.cost_price || 0);
                                        return sum + (isNaN(price) ? 0 : price * (i.qty || 0));
                                    }, 0) || 0).toLocaleString()} đ
                                </div>
                            </Col>
                        </Row>

                        <Table
                            dataSource={selectedImport.items}
                            pagination={false}
                            className="anime-table"
                            rowKey="id"
                            style={{ background: 'transparent' }}
                            columns={[
                                {
                                    title: <span style={{ color: '#aaa', fontSize: 12 }}>NGUYÊN LIỆU</span>,
                                    dataIndex: ['ingredient', 'name'],
                                    key: 'name',
                                    render: (text: string, record: any) => <b style={{ color: 'var(--primary-color)', fontSize: 14 }}>{record.ingredient?.name?.toUpperCase() || text?.toUpperCase()}</b>
                                },
                                {
                                    title: <span style={{ color: '#aaa', fontSize: 12 }}>SỐ LƯỢNG</span>,
                                    dataIndex: 'qty',
                                    key: 'qty',
                                    render: (val, record: any) => <span style={{ color: '#fff' }}>{val} {record.ingredient?.unit?.name || ''}</span>
                                },
                                {
                                    title: <span style={{ color: '#aaa', fontSize: 12 }}>ĐƠN GIÁ</span>,
                                    dataIndex: 'cost_price',
                                    key: 'price',
                                    render: (val) => <span style={{ color: '#fff' }}>{parseFloat(val).toLocaleString()} đ</span>
                                },
                                {
                                    title: <span style={{ color: '#aaa', fontSize: 12 }}>THÀNH TIỀN</span>,
                                    key: 'total',
                                    render: (_, record: any) => {
                                        const price = parseFloat(record.cost_price || 0);
                                        const total = isNaN(price) ? 0 : price * (record.qty || 0);
                                        return <b style={{ color: '#fff' }}>{total.toLocaleString()} đ</b>
                                    }
                                },
                                {
                                    title: <span style={{ color: '#aaa', fontSize: 12 }}>TỒN LÔ HÀNG</span>,
                                    key: 'remaining',
                                    render: (_, record: any) => (
                                        <Space>
                                            <b style={{ color: record.remaining_qty < 5 ? 'var(--accent-color)' : '#52c41a', fontSize: 16 }}>{record.remaining_qty}</b>
                                            <Button
                                                size="small"
                                                icon={<HistoryOutlined />}
                                                onClick={() => handleUpdateStock(record)}
                                                style={{ fontSize: 11, background: '#333', border: 'none', color: '#fff' }}
                                            >
                                                CẬP NHẬT
                                            </Button>
                                        </Space>
                                    )
                                }
                            ]}
                        />
                    </div>
                )}
            </Modal>

            {/* UPDATE STOCK MODAL */}
            <Modal
                title={<span style={{ color: 'var(--primary-color)' }}>CẬP NHẬT TỒN KHO LÔ HÀNG</span>}
                open={isStockModalVisible}
                onCancel={() => setIsStockModalVisible(false)}
                footer={null}
                width={400}
                centered
                className="anime-modal"
                styles={{ body: { background: '#141414', border: '3px solid var(--primary-color)', borderRadius: '0 0 8px 8px', padding: 24 } }}
            >
                <Form form={stockForm} layout="vertical" onFinish={onUpdateStockFinish}>
                    <div style={{ marginBottom: 20 }}>
                        <Text style={{ color: '#ccc' }}>Nguyên liệu:</Text>
                        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{selectedItem?.ingredient?.name.toUpperCase()}</div>
                    </div>
                    <Form.Item
                        name="remaining_qty"
                        label={<span style={{ color: '#fff' }}>SỐ LƯỢNG CÒN LẠI HIỆN TẠI</span>}
                        rules={[
                            { required: true, message: 'Nhập số lượng tồn' },
                            {
                                validator: (_, value) => {
                                    if (value < 0) return Promise.reject('Không thể nhỏ hơn 0');
                                    if (selectedItem && value > (selectedItem.qty || 999999)) {
                                        return Promise.reject(`Không thể vượt quá số lượng nhập (${selectedItem.qty})`);
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%', height: 45, display: 'flex', alignItems: 'center', background: '#000', border: '2px solid #333', color: '#fff' }}
                            min={0}
                            step={0.01}
                        />
                    </Form.Item>

                    <Form.Item
                        name="cost_price"
                        label={<span style={{ color: '#fff' }}>ĐƠN GIÁ NHẬP (đ)</span>}
                        rules={[{ required: true, message: 'Nhập đơn giá' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%', height: 45, display: 'flex', alignItems: 'center', background: '#000', border: '2px solid #333', color: '#fff' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                        />
                    </Form.Item>

                    <Button type="primary" block htmlType="submit" style={{ height: 45, fontWeight: 800, borderRadius: 0 }}>
                        XÁC NHẬN CẬP NHẬT
                    </Button>
                </Form>
            </Modal>
            {/* INVENTORY MANAGEMENT MODAL (MATRIX) */}
            <Modal
                title="THỐNG KÊ TỒN KHO CHI TIẾT THEO LÔ"
                open={isInventoryModalVisible}
                onCancel={() => setIsInventoryModalVisible(false)}
                footer={null}
                width="95%"
                className="anime-modal"
                styles={{ body: { background: '#141414', border: '3px solid var(--primary-color)', borderRadius: '0 0 8px 8px', padding: 0 } }}
            >
                <div style={{ padding: 20 }}>
                    <Row gutter={24} align="middle" style={{ marginBottom: 20, borderBottom: '1px solid #333', paddingBottom: 15 }}>
                        <Col span={8}>
                            <div style={{ background: 'rgba(250, 219, 20, 0.05)', padding: '15px 20px', borderLeft: '4px solid var(--primary-color)' }}>
                                <Text style={{ color: '#aaa', fontSize: 12, display: 'block' }}>TỔNG GIÁ TRỊ HÀNG TỒN HIỆN TẠI</Text>
                                <span style={{ color: 'var(--primary-color)', fontSize: 28, fontWeight: 900 }}>
                                    {imports.reduce((acc, imp) => {
                                        return acc + (imp.items?.reduce((sum: number, i: any) => {
                                            const price = parseFloat(i.cost_price || 0);
                                            const qty = parseFloat(i.remaining_qty || 0);
                                            return sum + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
                                        }, 0) || 0);
                                    }, 0).toLocaleString()} đ
                                </span>
                            </div>
                        </Col>
                        <Col span={16} style={{ textAlign: 'right' }}>
                            <Title level={4} style={{ color: '#fff', margin: 0, fontStyle: 'italic' }}>MA TRẬN HÀNG TỒN</Title>
                        </Col>
                    </Row>

                    <Table
                        dataSource={imports.filter(imp => imp.items?.some((i: any) => parseFloat(i.remaining_qty) > 0))}
                        pagination={false}
                        scroll={{ x: 'max-content', y: 500 }}
                        className="anime-table inventory-matrix"
                        rowKey="id"
                        columns={[
                            {
                                title: <span style={{ color: '#aaa' }}>LÔ HÀNG</span>,
                                key: 'batch_info',
                                fixed: 'left',
                                width: 150,
                                render: (_, record) => (
                                    <div style={{ color: '#fff' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--primary-color)' }}>#{record.id.toString().padStart(4, '0')}</div>
                                        <div style={{ fontSize: 11, color: '#999' }}>{dayjs(record.date).format('DD/MM/YY HH:mm')}</div>
                                    </div>
                                )
                            },
                            ...ingredients.map(ing => ({
                                title: (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#fff', fontSize: 12 }}>{ing.name.toUpperCase()}</div>
                                        <div style={{ color: '#999', fontSize: 10 }}>({ing.unit?.name})</div>
                                    </div>
                                ),
                                key: `ing_${ing.id}`,
                                align: 'center' as const,
                                width: 140,
                                children: [
                                    {
                                        title: (() => {
                                            const stats = (imports || []).reduce((acc, imp) => {
                                                const item = imp.items?.find((i: any) => i.ingredient_id === ing.id);
                                                const qty = parseFloat(item?.remaining_qty || 0);
                                                const price = parseFloat(item?.cost_price || 0);
                                                acc.totalQty += isNaN(qty) ? 0 : qty;
                                                acc.totalValue += (isNaN(qty) || isNaN(price)) ? 0 : qty * price;
                                                return acc;
                                            }, { totalQty: 0, totalValue: 0 });

                                            return (
                                                <div style={{ textAlign: 'center', borderTop: '2px solid #333', paddingTop: 10 }}>
                                                    <div style={{ color: 'var(--accent-color)', fontWeight: 900, fontSize: 20 }}>{stats.totalQty}</div>
                                                    <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>
                                                        {stats.totalValue.toLocaleString()} đ
                                                    </div>
                                                </div>
                                            );
                                        })(),
                                        key: `stats_${ing.id}`,
                                        align: 'center' as const,
                                        width: 140,
                                        render: (_: any, record: any) => {
                                            const item = record.items?.find((i: any) => i.ingredient_id === ing.id);
                                            const qty = parseFloat(item?.remaining_qty || 0);
                                            const price = parseFloat(item?.cost_price || 0);
                                            if (qty <= 0) return <span style={{ color: '#333' }}>-</span>;
                                            return (
                                                <div
                                                    onClick={() => qty > 0 && handleUpdateStock(item)}
                                                    style={{
                                                        color: qty < 5 ? 'var(--accent-color)' : '#52c41a',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        background: 'rgba(255,255,255,0.03)'
                                                    }}
                                                >
                                                    <div style={{ fontSize: 16 }}>{qty}</div>
                                                    <div style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>
                                                        {(qty * price).toLocaleString()} đ
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }
                                ]
                            }))
                        ]}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default StockImport;
