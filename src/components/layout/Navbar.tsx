import { auth } from "@/lib/auth";
import NavbarShell from "./NavbarShell";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? "(no name)",
        image: session.user.image ?? null,
      }
    : null;
  return <NavbarShell user={user} />;
}
