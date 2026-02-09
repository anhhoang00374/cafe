import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', values);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            message.success('Chào mừng trở lại, ' + user.username);
            navigate('/dashboard');
            window.location.reload(); // Quick refresh to update state
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#000',
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(250, 219, 20, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(250, 219, 20, 0.05) 0%, transparent 50%)'
        }}>
            <Card className="glass-card" style={{ width: 400, background: '#141414' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 className="gradient-text" style={{ fontSize: 42, marginBottom: 8, letterSpacing: '-2px', fontStyle: 'italic' }}>CAFÉ POS</h1>
                    <p style={{ color: '#fadb14', fontWeight: 600, textTransform: 'uppercase' }}>Hệ thống quản lý</p>
                </div>

                <Form
                    name="login"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#fadb14' }} />}
                            placeholder="TÊN ĐĂNG NHẬP"
                            size="large"
                            style={{ background: '#000', border: '2px solid #333', color: '#fff' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#fadb14' }} />}
                            placeholder="MẬT KHẨU"
                            size="large"
                            style={{ background: '#000', border: '2px solid #333', color: '#fff' }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ height: 50 }}>
                            ĐĂNG NHẬP
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
