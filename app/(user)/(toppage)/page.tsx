import { auth } from "@/libs/auth/auth";

export default async function TopPage() {
    const session = await auth();
    const user = session?.user;
    return <div>TopPage, user: {JSON.stringify(user)}</div>;
}