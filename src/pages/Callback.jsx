import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');

    if (code) {
      // Exchange the code for an access token
      fetch('https://backengine-of3g.fly.dev/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            toast({
              title: "Login Successful",
              description: "You have been successfully logged in.",
            });
            navigate('/');
          } else {
            throw new Error('Failed to get access token');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          toast({
            title: "Login Failed",
            description: "An error occurred during login. Please try again.",
            variant: "destructive",
          });
          navigate('/login');
        });
    } else {
      toast({
        title: "Login Failed",
        description: "No authorization code received. Please try again.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [location, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p>Processing login...</p>
    </div>
  );
};

export default Callback;