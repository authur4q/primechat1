import { connectDb } from "../../../../lib/mongoDb"
import User from "../../../../models/users"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export const POST = async (req) => {
  try {
    const { username, email, password,phone } = await req.json();
  
    const hashedPassword = await bcrypt.hash(password, 10)


    if (!username || !email || !password || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password cannot be less than 8 characters" }, { status: 422 });
    }
const phoneRegex = /^\+[1-9]\d{1,14}$/;

if (!phoneRegex.test(phone)) {
  return NextResponse.json(
    { message: "Please enter your number in international format (e.g., +254...)" }, 
    { status: 400 }
  );
}
    await connectDb()





const existingUser = await User.findOne({
  $or: [
    { email },
    { username },
    { phone }
  ]
});

if (existingUser) {
  let message = "This account is already registered.";
  
  if (existingUser.email === email) {
    message = "This email is already linked to an account.";
  } else if (existingUser.username === username) {
    message = "That username is already taken. Try another.";
  } else if (existingUser.phone === phone) {
    message = "This phone number is already in use.";
  }

  return NextResponse.json({ message }, { status: 409 });
}

    

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone
    });

    const { password: _, ...userWithoutPassword } = newUser._doc;

    return NextResponse.json({ message: "User registered", user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const GET = async (req) => {
  const url = new URL(req.url)
  const username = url.searchParams.get("name")

  try {
    await connectDb()
    const query = username ? { username: new RegExp(username, 'i') } : {};
    const users = await User.find(query).select("-password").sort({ createdAt: -1 })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}