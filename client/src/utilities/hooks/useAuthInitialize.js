import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuthThunk } from '../../store/auth';

export const useAuthInitialize = () => {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(initializeAuthThunk());
  }, [dispatch]);

  return { isLoading, isAuthenticated };
};