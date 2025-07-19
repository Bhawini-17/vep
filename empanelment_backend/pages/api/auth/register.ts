import { NextApiRequest, NextApiResponse } from "next";
import { createSuccessResponse, createErrorResponse } from "../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json(createErrorResponse("Method Not Allowed"));
  }

  try {
    const { email, password, company_name, mobile, pan, gstin, legal_structure } = req.body;

    // TODO: Add validations, hashing, saving to DB, etc.
    console.log("Registering user:", email);

    return res.status(200).json(createSuccessResponse({ message: "User registered successfully" }));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createErrorResponse("Registration failed"));
  }
}