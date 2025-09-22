import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  redirectPath?: string;
}

/**
 * 受保护的路由组件，只允许已认证用户访问
 * @param redirectPath 未认证时重定向的路径，默认为/login
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectPath = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();

  // 加载中显示加载状态
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  // 如果已认证，显示子组件；否则重定向到登录页
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default PrivateRoute;
