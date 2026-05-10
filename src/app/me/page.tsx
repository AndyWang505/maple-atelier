import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import { outfits, users } from "@/db/schema";
import PageShell from "@/components/layout/PageShell";
import { toWireRow } from "@/lib/queries/utils";
import MyOutfitsList from "./MyOutfitsList";
import ProfileCard from "./ProfileCard";


export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/me");
  }
  const userId = session.user.id;

  const db = getDb();
  const [[me], rows] = await Promise.all([
    db
      .select({
        name: users.name,
        image: users.image,
        displayName: users.displayName,
      })
      .from(users)
      .where(eq(users.id, userId)),
    db
      .select()
      .from(outfits)
      .where(eq(outfits.userId, userId))
      .orderBy(desc(outfits.updatedAt)),
  ]);

  const fallback = rows.map(toWireRow);

  return (
    <PageShell bg="soft">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
        我的衣櫃
      </h1>
      <ProfileCard
        name={me?.name ?? null}
        image={me?.image ?? null}
        displayName={me?.displayName ?? null}
      />
      <MyOutfitsList fallback={fallback} />
    </PageShell>
  );
}
