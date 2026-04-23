import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import NavAlerts from "./NavAlerts";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const store = await db.store.findUnique({
    where: { userId: session.user.id }
  });

  // Removed 30-day trial logic (Platform is free)
  return (
    <>
      <div className="container mt-4 flex justify-end">
        <NavAlerts />
      </div>
      {children}
    </>
  );
}
