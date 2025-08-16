'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// 추후 zod, react-hook-form 적용 예정

interface LoginFormProps {
  onSubmit: (username: string, password: string, rememberMe: boolean) => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password, rememberMe);
  };

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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 사용자명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
              사용자명
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자명을 입력하세요"
              required
              disabled={isLoading}
              autoComplete={rememberMe ? "username" : "off"}
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
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              disabled={isLoading}
              autoComplete={rememberMe ? "current-password" : "off"}
              className="h-12 text-sm text-gray-700 border-1 border-gray-200 focus:border-gray-500 focus:ring-0 transition-colors placeholder:text-gray-400 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
                className="h-4 w-4 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 data-[state=checked]:text-white"
              />
              <Label 
                htmlFor="remember" 
                className="text-gray-600 font-medium text-xs cursor-pointer mt-1"
              >
                로그인 정보 저장
              </Label>
            </div>
            <Button variant="ghost" className="p-0 h-auto text-xs font-semibold text-gray-600 hover:text-gray-800">
              문의하기
            </Button>
          </div>

          {/* 로그인 버튼 */}
          <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-sm font-semibold bg-gray-500 hover:bg-gray-700 text-white transition-all duration-200 ease-in-out rounded-lg mt-2"
            >
            {isLoading ? (
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
