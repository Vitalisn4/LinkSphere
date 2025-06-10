import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50/90 via-white/90 to-pink-50/90 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-800/90 backdrop-blur-md">
      <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 -z-10" />
      <LoginForm />
    </div>
  );
} 