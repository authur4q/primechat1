import { connectDb } from "../../../../lib/mongoDb"
import User from "../../../../models/users"
import Message from "../../../../models/message"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
<<<<<<< HEAD
=======

>>>>>>> 1e56c28ea77123b910ce0c39f7e6cc5b4d329dc8
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
<<<<<<< HEAD

export const PUT = async (req) => {
  try {
    await connectDb();
    const session = await getServerSession(options);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, email, phone, about, instagram, tiktok, oldUsername } = body;

    const existingConflict = await User.findOne({
      _id: { $ne: session.user.id },
      $or: [
        { username },
        { email },
        { phone }
      ]
    });

    if (existingConflict) {
      let msg = "Details conflict with another user.";
      if (existingConflict.username === username){msg = "Username is already taken.";}
      if (existingConflict.email === email) msg = "Email is already in use.";
      if (existingConflict.phone === phone) msg = "Phone number is already in use.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (oldUsername && oldUsername !== username) {
      await Message.updateMany(
        { user: oldUsername },
        { $set: { user: username } }
      );

      const affectedMessages = await Message.find({
        room: { $regex: `private_.*${oldUsername}.*` }
      });

      if (affectedMessages.length > 0) {
        const bulkOps = affectedMessages.map((msg) => {
          const names = msg.room.replace("private_", "").split("_");
          const updatedNames = names.map(n => n === oldUsername ? username : n);
          const newRoomName = "private_" + updatedNames.sort().join("_");

          return {
            updateOne: {
              filter: { _id: msg._id },
              update: { $set: { room: newRoomName } }
            }
          };
        });

        await Message.bulkWrite(bulkOps);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          username,
          email,
          phone,
          about,
          instagram,
          tiktok
        }
      },
      { new: true }
    ).select("-password");

    return NextResponse.json({ message: "Profile updated", user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
=======
>>>>>>> 1e56c28ea77123b910ce0c39f7e6cc5b4d329dc8
