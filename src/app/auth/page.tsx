import { LoginForm } from '@/app/auth/_components/login-form';
import { WordMark } from '@/components/brand/word-mark';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-6">
            <div className="w-full max-w-sm mx-auto mt-7">
                <div className="mb-8">
                    <WordMark />
                </div>
                <LoginForm />
            </div>
        </div>
    );
}