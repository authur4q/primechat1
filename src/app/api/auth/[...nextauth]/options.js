import CredentialsProvider from "next-auth/providers/credentials";
import { connectDb } from "../../../../../lib/mongoDb";
import User from "../../../../../models/users";
import bcrypt from "bcryptjs";

export const options = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        try {
          await connectDb();
          const existingUser = await User.findOne({ email });

          if (!existingUser) return null;

          const isMatch = await bcrypt.compare(password, existingUser.password);
          if (!isMatch) return null;

          return {
            id: existingUser._id.toString(),
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role,
            about: existingUser.about,
            instagram: existingUser.instagram,
            tiktok: existingUser.tiktok,
            phone: existingUser.phone,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.about = user.about;
        token.instagram = user.instagram;
        token.tiktok = user.tiktok;
        token.phone = user.phone;
      }
      
      if (trigger === "update") {
        await connectDb();
        const updatedUser = await User.findById(token.id).lean();
        
        if (updatedUser) {
          token.username = updatedUser.username;
          token.about = updatedUser.about;
          token.instagram = updatedUser.instagram;
          token.tiktok = updatedUser.tiktok;
          token.phone = updatedUser.phone;
          token.role = updatedUser.role;
        }
      }
      return token;
    },
    async session({ token, session }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.about = token.about;
        session.user.instagram = token.instagram;
        session.user.tiktok = token.tiktok;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
};