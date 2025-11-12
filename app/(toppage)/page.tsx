import { auth } from "@/libs/auth/auth";

export default async function TopPage() {
    const session = await auth();
    console.log("session", session);
    const user = session?.user;
    return <div>TopPage, user: {JSON.stringify(user)}</div>;
}