import { AuthForm } from "@/components/auth-form";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="bg-paper px-4 py-12 sm:px-6 lg:px-8">
      <AuthForm mode="login" nextUrl={params?.next ?? "/account"} />
    </div>
  );
}
