import CredentialsProvider from "next-auth/providers/credentials";
import { connectDb } from "../../../../../lib/mongoDb";
import User from "../../../../../models/users";
import bcrypt from "bcryptjs"

export const options = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const {email,password} = credentials
        if(!email || !password){
          console.log("all fields are required to successfully log you in")
        }
        try {
          await connectDb();

          const existingUser = await User.findOne({ email: email });

          if (!existingUser) {
            console.log("No such user!");
            return null;
          }

          const isMatch = await bcrypt.compare(password, existingUser.password);

          if (!isMatch) {
            console.log("Invalid credentials!");
            return null;
          }

    
          return {
            
            id: existingUser._id.toString(),
            
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role, 

            
          
          }
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      }
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt"
  },

  pages: {
    signIn: "/auth/signin" 
  },
  callbacks:{
    async jwt({token,user}){
      if(user){
        token.id = user.id
        token.role =user.role

        token.username =user.username

        
        
        
      }
      return token
    },
    async session({token,session}){
      if(session.user){
        session.user.id = token.id
        session.user.role = token.role

      
        session.user.username= token.username
       
      }
      return session
    }
    
  }
};
