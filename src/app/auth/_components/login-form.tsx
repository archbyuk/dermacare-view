'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, loginSchema } from '@/app/auth/_types/auth';
import { useEffect } from 'react';
import { useLogin } from '@/app/auth/_hooks/use-login';

export function LoginForm() {
    const { handleLogin } = useLogin();

    // react-hook-form: 폼 상태 관리 <link: https://react-hook-form.com/docs/useform>
    const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<LoginSchema>(
        {
            resolver: zodResolver(loginSchema),
            defaultValues: {
                username: '',
                password: '',
                autoLogin: false,
            },
        }
    );
    
    // localStorage에서 autoLogin 값 가져오기
    useEffect(() => {
        const savedAutoLogin = localStorage.getItem('autoLogin') === 'true';
        setValue('autoLogin', savedAutoLogin);
    }, [setValue]);
    
    // autoLogin 값 실시간 감지
    const autoLogin = watch('autoLogin');

    // autoLogin 값 변경 시 localStorage에 저장
    const handleAutoLoginChange = (checked: boolean) => {
        setValue('autoLogin', checked);
        localStorage.setItem('autoLogin', checked.toString());
    }

    // 폼 제출 시 handleLogin 함수 호출
    const handleFormSubmit = handleSubmit(handleLogin);

    return (
        <Card className="w-full border-0 bg-white shadow-none">
            <CardHeader className="">
                
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                    환영합니다
                </CardTitle>
                <p className="text-sm text-gray-500 text-center font-medium">
                    로그인하여 페이스필터의 시술 목록을 확인하세요
                </p>
            
            </CardHeader>

            <CardContent className="space-y-4">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    
                    {/* 사용자 아이디 입력 */}
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                            아이디
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            {...register('username')}
                            placeholder="아이디를 입력하세요"
                            required
                            disabled={isSubmitting}
                            autoComplete={ autoLogin ? "username" : "off" }
                            className="h-12 text-sm text-gray-700 border-1 border-gray-200 focus:border-gray-500 focus:ring-0 transition-colors placeholder:text-gray-400 rounded-lg"
                        />
                    </div>

                    {/* 비밀번호 입력 */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                            비밀번호
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            placeholder="비밀번호를 입력하세요"
                            required
                            disabled={isSubmitting}
                            autoComplete={ autoLogin ? "current-password" : "off" }
                            className="h-12 text-sm text-gray-700 border-1 border-gray-200 focus:border-gray-500 focus:ring-0 transition-colors placeholder:text-gray-400 rounded-lg"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="autoLogin"
                                checked={autoLogin}
                                onCheckedChange= { handleAutoLoginChange }
                                disabled={isSubmitting}
                                className="h-4 w-4 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 data-[state=checked]:text-white"
                            />
                            <Label 
                                htmlFor="autoLogin" 
                                className="text-gray-600 font-medium text-xs cursor-pointer mt-1"
                            >
                                로그인 정보 저장
                            </Label>
                        </div>
                        <Button 
                            type="button"
                            variant="ghost" 
                            className="p-0 h-auto text-xs font-semibold text-gray-600 hover:text-gray-800"
                            onClick={() => window.open(process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL, '_blank')}
                        >
                            문의하기
                        </Button>
                    </div>

                    {/* 로그인 버튼 */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-sm font-semibold bg-gray-500 hover:bg-gray-700 text-white transition-all duration-200 ease-in-out rounded-lg mt-2"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                로그인 중...
                            </div>
                        ) : (
                            '로그인'
                        )}
                    </Button>
                </form>
            
            </CardContent>
        </Card>
    );
}
