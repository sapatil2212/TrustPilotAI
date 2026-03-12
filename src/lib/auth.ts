import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from './prisma';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'ADMIN';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const { email, password } = credentials;

        // Check for super admin
        if (
          email === process.env.SUPER_ADMIN_EMAIL &&
          password === process.env.SUPER_ADMIN_PASSWORD
        ) {
          // Check if super admin exists in database
          let adminUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!adminUser) {
            // Create super admin user
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 12);
            const trialEndsAt = new Date();
            trialEndsAt.setFullYear(trialEndsAt.getFullYear() + 100); // Never expires

            adminUser = await prisma.user.create({
              data: {
                name: 'Super Admin',
                email,
                password: hashedPassword,
                role: 'ADMIN',
                trialEndsAt,
                isTrialExpired: false,
                isActive: true,
              },
            });
          }

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: 'ADMIN',
          };
        }

        // Regular user authentication
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account has been deactivated');
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
