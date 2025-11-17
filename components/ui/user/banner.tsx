export default function Banner({ children }: { children: React.ReactNode }) {
  return <div className="bg-primary text-primary-foreground">{children}</div>;
}
