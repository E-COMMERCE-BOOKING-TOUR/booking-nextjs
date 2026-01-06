import MyPageLayoutClient from './MyPageLayoutClient';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <MyPageLayoutClient>
            {children}
        </MyPageLayoutClient>
    );
}
