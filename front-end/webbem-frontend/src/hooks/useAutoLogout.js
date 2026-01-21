import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAutoLogout = (timeoutInMinutes = 30) => {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    const timeout = timeoutInMinutes * 60 * 1000;

    const logout = () => {
      const role = localStorage.getItem('role');
      if (role) {
        localStorage.clear();
        alert("Sesi berakhir karena tidak ada aktivitas. Silakan login kembali.");
        navigate('/login');
      }
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logout, timeout);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timer) clearTimeout(timer);
    };
  }, [navigate, timeoutInMinutes]);
};