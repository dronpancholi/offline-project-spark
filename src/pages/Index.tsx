
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the welcome page
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-xl text-muted-foreground">Loading...</p>
    </div>
  );
};

export default Index;
