import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'https://engine.fusionauth.io/oauth2/authorize?client_id=5ac0e32d-5fb9-4c5e-90cf-3a635d841ef0&response_type=code&redirect_uri=https://app.enginelabs.ai';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in using FusionAuth</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} className="w-full">
            Login with FusionAuth
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;