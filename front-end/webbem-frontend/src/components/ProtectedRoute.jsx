import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // 1. Get user data from localStorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 2. If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. If roles are specified, check if user has permission
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user role is not allowed, redirect to home or a "Not Authorized" page
    // Here we redirect to the root ("/") as a safe default
    return <Navigate to="/" replace />;
  }

  // 4. If all checks pass, render the child components (the protected page)
  return children;
};

export default ProtectedRoute;