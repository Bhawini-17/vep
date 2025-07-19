import { NextApiRequest, NextApiResponse } from "next";
import { createSuccessResponse, createErrorResponse } from "../../../lib/utils";
import { cors } from '../../../lib/middleware'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
await cors(req, res);
  if (req.method !== "POST") {
    return res.status(405).json(createErrorResponse("Method Not Allowed"));
  }

  const { email, otp } = req.body;

  if (otp === "123456") {
    return res.status(200).json(createSuccessResponse({ user: { name: "Demo User", role: "vendor" }, token: "real-jwt-token" }));
  }

  return res.status(400).json(createErrorResponse("Invalid OTP"));
}