// src/components/LoginForm.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, LogIn, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

interface Props {
  onLogin: (user: any, role: string) => void;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const LoginForm = ({ onLogin }: Props) => {
  /* ─────────────────────────── state ─────────────────────────── */
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [registerData, setRegisterData] = useState({
    companyName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    pan: "",
    gstin: "",
    legalStructure: "",
  });
  const [show2FA, setShow2FA] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  /* ───────────────────────── mutations ───────────────────────── */
  /* 1) Login → /auth/login */
  const loginMutation = useMutation({
    mutationFn: () =>
      api.post("/auth/login", {
        email: loginData.email,
        password: loginData.password,
      }),
    onSuccess: ({ data }) => {
  const otp = generateOTP();
  localStorage.setItem("tempToken", data.data.token); // pre-OTP token
  localStorage.setItem("otp", otp); // save OTP temporarily
  setShow2FA(true);
  toast({
    title: "OTP Sent",
    description: `Your OTP is: ${otp}`,
  });
},
    onError: (err: any) =>
      toast({
        title: "Invalid Credentials",
        description:
          err.response?.data?.message ?? "Please check email & password",
        variant: "destructive",
      }),
  });

  /* 2) Verify OTP → /auth/verify-otp */
  const verifyOtpMutation = useMutation({
  mutationFn: () => {
    const storedOtp = localStorage.getItem("otp");
    if (loginData.otp === storedOtp) {
      return Promise.resolve({
        data: {
          user: {
            name: "Demo User",
            email: loginData.email,
            role: "vendor",
          },
          token: "mocked-jwt-token"
        }
      });
    } else {
      return Promise.reject(new Error("Invalid OTP"));
    }
  },
  onSuccess: ({ data }) => {
    const { user, token } = data;
    localStorage.setItem("token", token); // real JWT
    toast({
      title: "Login Successful",
      description: `Welcome ${user.name}!`,
    });
    onLogin(user, user.role);
  },
  onError: (err: any) =>
    toast({
      title: "Invalid OTP",
      description: err.message ?? "Please enter correct OTP",
      variant: "destructive",
    }),
});

  /* 3) Register → /auth/register */
  const registerMutation = useMutation({
    mutationFn: () =>
      api.post("/auth/register", {
        email: registerData.email,
        password: registerData.password,
        name: registerData.companyName,
        company_name: registerData.companyName,
        mobile: registerData.mobile,
        pan: registerData.pan,
        gstin: registerData.gstin,
        legal_structure: registerData.legalStructure,
      }),
    onSuccess: ({ data }) => {
      toast({
        title: "Registration Successful",
        description: data.message,
      });
      // Move to login tab with email pre‑filled
      setActiveTab("login");
      setLoginData({ ...loginData, email: registerData.email });
    },
    onError: (err: any) =>
      toast({
        title: "Registration Failed",
        description: err.response?.data?.message ?? "Please check inputs",
        variant: "destructive",
      }),
  });

  /* ────────────────────────── helpers ────────────────────────── */
  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    show2FA ? verifyOtpMutation.mutate() : loginMutation.mutate();
  };

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate();
  };

  /* ───────────────────────────  UI  ──────────────────────────── */
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Secure Access</CardTitle>
        <CardDescription>
          Login or Register for Vendor Empanelment Portal
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* ─────────────── LOGIN TAB ─────────────── */}
          <TabsContent value="login">
  <form onSubmit={submitLogin} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={loginData.email}
        onChange={(e) =>
          setLoginData({ ...loginData, email: e.target.value })
        }
        required
      />
    </div>

    {!show2FA && (
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={loginData.password}
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
          required
        />
      </div>
    )}

    {show2FA && (
      <div className="space-y-2">
        <Label htmlFor="otp">Enter OTP</Label>
        <Input
          id="otp"
          placeholder="6-digit OTP"
          value={loginData.otp}
          onChange={(e) =>
            setLoginData({ ...loginData, otp: e.target.value })
          }
          required
        />
      </div>
    )}

    <Button
      type="submit"
      className="w-full"
      disabled={
        show2FA
          ? verifyOtpMutation.isPending
          : loginMutation.isPending
      }
    >
      <LogIn className="w-4 h-4 mr-2" />
      {show2FA ? "Verify OTP" : "Login"}
    </Button>
  </form>

    {/* Demo credentials block */}
    {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
      <h4 className="font-semibold mb-2">Demo Credentials:</h4>
      <p><strong>Vendor:</strong> vendor@demo.com / 123456</p>
      <p><strong>HOD Civil:</strong> hod.civil@dmrc.com / 123456</p>
      <p><strong>HOD Electrical:</strong> hod.electrical@dmrc.com / 123456</p>
      <p><strong>Admin:</strong> admin@dmrc.com / 123456</p>
    </div> */}
  </TabsContent>

          {/* ─────────────── REGISTER TAB ─────────────── */}
          <TabsContent value="register">
            <form onSubmit={submitRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={registerData.companyName}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      companyName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regEmail">Email</Label>
                <Input
                  id="regEmail"
                  type="email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={registerData.mobile}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, mobile: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalStructure">Legal Structure</Label>
                <Select
                  onValueChange={(val) =>
                    setRegisterData({
                      ...registerData,
                      legalStructure: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select legal structure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proprietorship">
                      Sole Proprietorship
                    </SelectItem>
                    <SelectItem value="llp">
                      Limited Liability Partnership
                    </SelectItem>
                    <SelectItem value="private">Private Limited</SelectItem>
                    <SelectItem value="public">Public Limited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    value={registerData.pan}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, pan: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={registerData.gstin}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, gstin: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regPassword">Password</Label>
                <Input
                  id="regPassword"
                  type="password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
