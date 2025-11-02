import { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';

export const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const { properties } = await propertyService.getProperties();
      setProperties(properties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadProperties();
  };

  return {
    properties,
    loading,
    error,
    refresh
  };
};