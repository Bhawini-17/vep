import { NextApiRequest, NextApiResponse } from "next";

const otpStore: Record<string, string> = {}; // Shared in-memory (but better use Redis or DB in prod)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { email, enteredOtp } = req.body;

  if (otpStore[email] && otpStore[email] === enteredOtp) {
    delete otpStore[email]; // Invalidate OTP after use
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: "mocked-token"
    });
  } else {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }
}