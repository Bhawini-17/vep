import { NextApiRequest, NextApiResponse } from "next";
import { createSuccessResponse, createErrorResponse } from "../../../lib/utils";

const demoUsers = [
  {
    email: "vendor@demo.com",
    password: "Ven@12",
    role: "vendor",
    name: "Vendor User"
  },
  {
    email: "hod.civil@dmrc.com",
    password: "Civ@23",
    role: "hod_civil",
    name: "Civil HOD"
  },
  {
    email: "hod.electrical@dmrc.com",
    password: "Elec@234",
    role: "hod_electrical",
    name: "Electrical HOD"
  },
  {
    email: "admin@dmrc.com",
    password: "Adm@56",
    role: "admin",
    name: "Admin"
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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