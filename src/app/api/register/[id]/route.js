
import User from "../../../../../models/users";
import { NextResponse } from "next/server";
import { connectDb } from "../../../../../lib/mongoDb";

export const GET = async (req, { params }) => {
  try {
    await connectDb();
    const { id } = await params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Fetch User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};