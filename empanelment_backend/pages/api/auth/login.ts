import { NextApiRequest, NextApiResponse } from "next";
import { createSuccessResponse, createErrorResponse } from "../../../lib/utils";
import { cors } from '../../../lib/middleware'; 

const demoUsers = [
  {
    email: "vendor@demo.com",
    password: "123456",
    role: "vendor",
    name: "Vendor User"
  },
  {
    email: "hod.civil@dmrc.com",
    password: "123456",
    role: "hod_civil",
    name: "Civil HOD"
  },
  {
    email: "hod.electrical@dmrc.com",
    password: "123456",
    role: "hod_electrical",
    name: "Electrical HOD"
  },
  {
    email: "admin@dmrc.com",
    password: "123456",
    role: "admin",
    name: "Admin"
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
    if (req.method !== "POST") {
    return res.status(405).json(createErrorResponse("Method Not Allowed"));
  }

  const { email, password } = req.body;

  const user = demoUsers.find(u => u.email === email && u.password === password);

  if (user) {
    return res.status(200).json(createSuccessResponse({
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: "mocked-token" // You can change this if needed
    }, "Login successful"));
  }

  return res.status(401).json(createErrorResponse("Invalid email or password"));
}