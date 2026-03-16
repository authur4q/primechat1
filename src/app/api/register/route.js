import { connectDb } from "../../../../lib/mongoDb"
import User from "../../../../models/users"
import Message from "../../../../models/message"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"

import { options } from "../auth/[...nextauth]/options"

export const POST = async (req) => {
  try {
    const { username, email, password, phone } = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)

    if (!username || !email || !password || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
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
  try {
    await connectDb()
    const session = await getServerSession(options)
    
    if (!session?.user?.username) {
      const users = await User.find({}).select("-password").sort({ createdAt: -1 })
      return NextResponse.json(users)
    }

    const currentUsername = session.user.username

    const usersWithLastActivity = await User.aggregate([
      { 
        $match: { username: { $ne: currentUsername } } 
      },
      {
        $lookup: {
          from: "messages",
          let: { otherUser: "$username" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$room", "public"] },
                    { $eq: ["$room", { 
                      $concat: [
                        "private_", 
                        { $cond: [
                          { $lt: [currentUsername, "$$otherUser"] },
                          { $concat: [currentUsername, "_", "$$otherUser"] },
                          { $concat: ["$$otherUser", "_", currentUsername] }
                        ]}
                      ] 
                    }] }
                  ]
                }
              }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: "lastMsg"
        }
      },
      {
        $addFields: {
          lastActivity: { $ifNull: [{ $arrayElemAt: ["$lastMsg.createdAt", 0] }, "$createdAt"] }
        }
      },
      { $project: { password: 0, lastMsg: 0 } },
      { $sort: { lastActivity: -1 } }
    ])

    return NextResponse.json(usersWithLastActivity)
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
