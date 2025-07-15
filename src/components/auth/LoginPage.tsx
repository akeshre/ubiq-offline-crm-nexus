
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const LoginPage = () => {
  const { login, loginWithGoogle, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const demoCredentials = [
    { email: "founder@ubiq.com", password: "founder123", role: "Founder" },
    { email: "ceo@ubiq.com", password: "ceo123", role: "CEO" },
    { email: "cto1@ubiq.com", password: "cto123", role: "CTO" },
    { email: "cto2@ubiq.com", password: "cto123", role: "CTO" },
    { email: "dev1@ubiq.com", password: "dev123", role: "Developer" },
    { email: "dev2@ubiq.com", password: "dev123", role: "Developer" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Form submission:', { isSignup, email, name: isSignup ? name : 'N/A' });
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (isSignup && !name) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let result;
      if (isSignup) {
        result = await signup(email, password, name);
      } else {
        result = await login(email, password);
      }
      
      if (!result.success) {
        setError(result.error || `${isSignup ? 'Signup' : 'Login'} failed`);
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('🔐 Google Sign-In button clicked');
    setLoading(true);
    setError("");

    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error || 'Google Sign-In failed');
      }
    } catch (err) {
      console.error('❌ Google Sign-In error:', err);
      setError("Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (cred: { email: string; password: string }) => {
    console.log('🔐 Demo login selected:', cred.email);
    setEmail(cred.email);
    setPassword(cred.password);
    setIsSignup(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">U</span>
          </div>
          <CardTitle className="text-2xl">UBIQ CRM</CardTitle>
          <CardDescription>
            {isSignup ? "Create your account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Google Sign-In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required={isSignup}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              {!isSignup && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (isSignup ? "Creating account..." : "Signing in...") : (isSignup ? "Create Account" : "Sign in")}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                  setName("");
                }}
                disabled={loading}
              >
                {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </Button>
            </div>

            {!isSignup && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Demo Login Credentials
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      {demoCredentials.map((cred) => (
                        <DropdownMenuItem
                          key={cred.email}
                          onClick={() => handleDemoLogin(cred)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{cred.email}</span>
                            <span className="text-sm text-gray-500">{cred.role}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
              UBIQ CRM System - {isSignup ? "Join Today" : "Secure Access Required"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
