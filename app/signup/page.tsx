import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="bg-paper px-4 py-12 sm:px-6 lg:px-8">
      <AuthForm mode="signup" />
    </div>
  );
}
