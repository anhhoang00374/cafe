import React, { useEffect, useState } from 'react';
import { Tabs, Button, Row, Col, Card, Modal, Form, Input, Select, Upload, message, Typography, Space, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DatabaseOutlined, CoffeeOutlined, TagsOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;
const { Option } = Select;

interface IngredientTabProps {
    ingredients: any[];
    units: any[];
    onRefresh: () => void;
}

const IngredientTab: React.FC<IngredientTabProps> = ({ ingredients, units, onRefresh }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<any>(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);

    const handleAdd = () => {
        setEditingIngredient(null);
        setFileList([]);
        setIsModalVisible(true);
        setTimeout(() => form.resetFields(), 0);
    };

    const handleEdit = (ingredient: any) => {
        setEditingIngredient(ingredient);
        setIsModalVisible(true);
        setTimeout(() => {
            form.setFieldsValue({
                name: ingredient.name,
                unit_id: ingredient.unit_id
            });
            if (ingredient.image) {
                setFileList([{
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: `http://localhost:5000${ingredient.image}`
                }]);
            } else {
                setFileList([]);
            }
        }, 0);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = async (values: any) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('unit_id', values.unit_id);
        if (fileList[0]?.originFileObj) {
            formData.append('image', fileList[0].originFileObj);
        }

        try {
            if (editingIngredient) {
                await api.put(`/ingredients/${editingIngredient.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                message.success('Cập nhật nguyên liệu thành công');
            } else {
                await api.post('/ingredients', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                message.success('Thêm nguyên liệu thành công');
            }
            setIsModalVisible(false);
            onRefresh();
        } catch (err) {
            message.error('Thao tác thất bại');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ color: 'var(--primary-color)', margin: 0, fontStyle: 'italic' }}>NGUYÊN LIỆU</Title>
                    <Text style={{ color: 'var(--text-secondary)' }}>Quản lý nguyên vật liệu đầu vào</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    style={{ height: 45, padding: '0 24px' }}
                >
                    THÊM MỚI
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {ingredients.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                        <Card
                            className="glass-card"
                            cover={
                                <div style={{ height: 180, overflow: 'hidden', borderBottom: '2px solid var(--glass-border)', background: '#000' }}>
                                    {item.image ? (
                                        <img
                                            alt={item.name}
                                            src={`http://localhost:5000${item.image}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            className="hover-zoom"
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#333' }}>
                                            <DatabaseOutlined style={{ fontSize: 48 }} />
                                        </div>
                                    )}
                                </div>
                            }
                            actions={[
                                <Button type="text" key="edit" icon={<EditOutlined />} onClick={() => handleEdit(item)} style={{ color: 'var(--primary-color)' }}>SỬA</Button>
                            ]}
                            style={{ background: '#141414', border: '2px solid var(--glass-border)' }}
                        >
                            <Card.Meta
                                title={<span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{item.name.toUpperCase()}</span>}
                                description={
                                    <Space direction="vertical" size={0}>
                                        <Text style={{ color: 'var(--primary-color)', fontWeight: 600 }}>ĐVT: {item.unit?.name}</Text>
                                        <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>ID: #{item.id.toString().padStart(4, '0')}</Text>
                                    </Space>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={editingIngredient ? "CẬP NHẬT NGUYÊN LIỆU" : "THÊM NGUYÊN LIỆU MỚI"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                className="anime-modal"
                styles={{ body: { background: '#141414', border: '3px solid var(--primary-color)', borderRadius: '0 0 8px 8px' } }}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 20 }}>
                    <Form.Item name="name" label={<span style={{ color: '#fff' }}>TÊN NGUYÊN LIỆU</span>} rules={[{ required: true }]}>
                        <Input style={{ background: '#000', border: '2px solid #333', color: '#fff' }} />
                    </Form.Item>
                    <Form.Item name="unit_id" label={<span style={{ color: '#fff' }}>ĐƠN VỊ TÍNH</span>} rules={[{ required: true }]}>
                        <Select style={{ background: '#000', border: '2px solid #333', color: '#fff' }} dropdownStyle={{ background: '#141414' }}>
                            {units.map(u => <Option key={u.id} value={u.id}>{u.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label={<span style={{ color: '#fff' }}>HÌNH ẢNH</span>}>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            {fileList.length < 1 && (
                                <div style={{ color: '#fff' }}>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>HỦY</Button>
                            <Button type="primary" htmlType="submit">XÁC NHẬN</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

interface CategoryTabProps {
    categories: any[];
    onRefresh: () => void;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ categories, onRefresh }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [form] = Form.useForm();

    const handleAdd = () => {
        setEditingCategory(null);
        setIsModalVisible(true);
        setTimeout(() => form.resetFields(), 0);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setIsModalVisible(true);
        setTimeout(() => form.setFieldsValue({ name: category.name }), 0);
    };

    const onFinish = async (values: any) => {
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, values);
                message.success('Cập nhật danh mục thành công');
            } else {
                await api.post('/categories', values);
                message.success('Thêm danh mục thành công');
            }
            setIsModalVisible(false);
            onRefresh();
        } catch (err) {
            message.error('Thao tác thất bại');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ color: 'var(--primary-color)', margin: 0, fontStyle: 'italic' }}>QUẢN LÝ DANH MỤC</Title>
                    <Text style={{ color: 'var(--text-secondary)' }}>Phân nhóm sản phẩm</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>THÊM DANH MỤC</Button>
            </div>

            <Row gutter={[16, 16]}>
                {categories.map((cat) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={cat.id}>
                        <Card
                            className="glass-card"
                            style={{ background: '#141414', border: '2px solid var(--glass-border)' }}
                            actions={[
                                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(cat)} style={{ color: 'var(--primary-color)' }}>SỬA</Button>
                            ]}
                        >
                            <Card.Meta
                                avatar={<TagsOutlined style={{ color: 'var(--primary-color)', fontSize: 24 }} />}
                                title={<span style={{ color: '#fff' }}>{cat.name.toUpperCase()}</span>}
                                description={<span style={{ color: '#666' }}>ID: #{cat.id}</span>}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={editingCategory ? "CẬP NHẬT DANH MỤC" : "THÊM DANH MỤC MỚI"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                className="anime-modal"
                styles={{ body: { background: '#141414', border: '3px solid var(--primary-color)', borderRadius: '0 0 8px 8px' } }}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 20 }}>
                    <Form.Item name="name" label={<span style={{ color: '#fff' }}>TÊN DANH MỤC</span>} rules={[{ required: true }]}>
                        <Input style={{ background: '#000', border: '2px solid #333', color: '#fff' }} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>HỦY</Button>
                            <Button type="primary" htmlType="submit">XÁC NHẬN</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

interface ProductTabProps {
    products: any[];
    categories: any[];
    units: any[];
    loading: boolean;
    onRefresh: () => void;
}

const ProductTab: React.FC<ProductTabProps> = ({ products, categories, units, loading, onRefresh }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);

    const handleAdd = () => {
        setEditingProduct(null);
        setFileList([]);
        setIsModalVisible(true);
        setTimeout(() => form.resetFields(), 0);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsModalVisible(true);
        setTimeout(() => {
            form.setFieldsValue({
                name: product.name,
                category_id: product.category_id,
                unit_id: product.unit_id,
                price: product.price,
                promo_price: product.promo_price,
                active: product.active
            });
            if (product.image) {
                setFileList([{
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: `http://localhost:5000${product.image}`
                }]);
            } else {
                setFileList([]);
            }
        }, 0);
    };

    const onFinish = async (values: any) => {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (values[key] !== undefined && values[key] !== null) {
                formData.append(key, values[key]);
            }
        });

        if (fileList[0]?.originFileObj) {
            formData.append('image', fileList[0].originFileObj);
        }

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                message.success('Cập nhật món ăn thành công');
            } else {
                await api.post('/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                message.success('Thêm món ăn thành công');
            }
            setIsModalVisible(false);
            onRefresh();
        } catch (err) {
            message.error('Thao tác thất bại');
        }
    };

    const getCategoryColor = (name: string) => {
        const n = (name || '').toLowerCase();
        if (n.includes('nước') || n.includes('uống')) return '#1890ff';
        if (n.includes('sáng')) return '#52c41a';
        if (n.includes('vặt')) return '#faad14';
        return 'var(--primary-color)';
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ color: 'var(--primary-color)', margin: 0, fontStyle: 'italic' }}>DANH SÁCH MÓN ĂN</Title>
                    <Text style={{ color: 'var(--text-secondary)' }}>Thiết lập menu và chính sách giá</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ height: 45, padding: '0 24px' }}>
                    THÊM MÓN MỚI
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {products.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                        <Card
                            className="glass-card"
                            loading={loading}
                            cover={
                                <div style={{ height: 200, overflow: 'hidden', borderBottom: '2px solid var(--glass-border)', background: '#000', position: 'relative' }}>
                                    {item.image ? (
                                        <img
                                            alt={item.name}
                                            src={`http://localhost:5000${item.image}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            className="hover-zoom"
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#333' }}>
                                            <CoffeeOutlined style={{ fontSize: 64 }} />
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        background: getCategoryColor(item.category?.name),
                                        color: '#000',
                                        padding: '2px 8px',
                                        fontSize: 10,
                                        fontWeight: 800,
                                        borderRadius: 4
                                    }}>
                                        {item.category?.name?.toUpperCase() || 'KHÁC'}
                                    </div>
                                </div>
                            }
                            actions={[
                                <Button type="text" key="edit" icon={<EditOutlined />} onClick={() => handleEdit(item)} style={{ color: 'var(--primary-color)' }}>SỬA</Button>
                            ]}
                            style={{ background: '#141414', border: '2px solid var(--glass-border)' }}
                        >
                            <Card.Meta
                                title={<div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.name.toUpperCase()}</div>}
                                description={
                                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Text style={{ color: 'var(--primary-color)', fontSize: 20, fontWeight: 900 }}>
                                                {parseFloat(item.promo_price || item.price).toLocaleString()} đ
                                            </Text>
                                            <Text style={{ color: '#666', fontSize: 12 }}>/ {item.unit?.name}</Text>
                                        </div>
                                        {item.promo_price && (
                                            <Text delete style={{ color: '#666', fontSize: 12 }}>
                                                {parseFloat(item.price).toLocaleString()} đ
                                            </Text>
                                        )}
                                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.active ? '#52c41a' : '#ff4d4f' }}></div>
                                            <Text style={{ color: '#999', fontSize: 11 }}>{item.active ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}</Text>
                                        </div>
                                    </Space>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={editingProduct ? "CẬP NHẬT MÓN ĂN" : "THÊM MÓN ĂN MỚI"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                className="anime-modal"
                styles={{ body: { background: '#141414', border: '3px solid var(--primary-color)', borderRadius: '0 0 8px 8px' } }}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 20 }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="name" label={<span style={{ color: '#fff' }}>TÊN MÓN</span>} rules={[{ required: true }]}>
                                <Input style={{ background: '#000', border: '2px solid #333', color: '#fff' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="category_id" label={<span style={{ color: '#fff' }}>PHÂN NHÓM</span>} rules={[{ required: true }]}>
                                <Select style={{ width: '100%' }} dropdownStyle={{ background: '#141414' }}>
                                    {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="unit_id" label={<span style={{ color: '#fff' }}>ĐƠN VỊ TÍNH</span>} rules={[{ required: true }]}>
                                <Select style={{ width: '100%' }} dropdownStyle={{ background: '#141414' }}>
                                    {units.map(u => <Option key={u.id} value={u.id}>{u.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="price" label={<span style={{ color: '#fff' }}>GIÁ BÁN (đ)</span>} rules={[{ required: true }]}>
                                <InputNumber
                                    style={{ width: '100%', background: '#000', border: '2px solid #333', color: '#fff' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="promo_price" label={<span style={{ color: '#fff' }}>GIÁ KHUYẾN MÃI (đ)</span>}>
                                <InputNumber
                                    style={{ width: '100%', background: '#000', border: '2px solid #333', color: '#fff' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label={<span style={{ color: '#fff' }}>HÌNH ẢNH MÓN ĂN</span>}>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            {fileList.length < 1 && (
                                <div style={{ color: '#fff' }}>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>HỦY</Button>
                            <Button type="primary" htmlType="submit">XÁC NHẬN</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

const DataMaster: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, unitRes, ingRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories'),
                api.get('/units'),
                api.get('/ingredients')
            ]);

            // Sort products by newest first
            const sortedProducts = (prodRes.data || []).sort((a: any, b: any) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );

            setProducts(sortedProducts);
            setCategories(catRes.data || []);
            setUnits(unitRes.data || []);
            setIngredients(ingRes.data || []);
        } catch (err) {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: 24, minHeight: '80vh', border: '2px solid var(--glass-border)' }}>
            <Tabs
                defaultActiveKey="1"
                type="card"
                className="anime-tabs"
                items={[
                    {
                        key: '1',
                        label: 'DANH SÁCH MÓN ĂN',
                        children: <ProductTab products={products} categories={categories} units={units} loading={loading} onRefresh={fetchData} />,
                    },
                    {
                        key: '2',
                        label: 'QUẢN LÝ NGUYÊN LIỆU',
                        children: <IngredientTab ingredients={ingredients} units={units} onRefresh={fetchData} />,
                    },
                    {
                        key: '3',
                        label: 'QUẢN LÝ DANH MỤC',
                        children: <CategoryTab categories={categories} onRefresh={fetchData} />,
                    },
                    {
                        key: '4',
                        label: 'QUẢN LÝ BÀN',
                        children: <div style={{ color: '#fff', padding: 40 }}>Chức năng đang phát triển...</div>,
                    },
                ]}
            />
        </div>
    );
};

export default DataMaster;
