import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// 추후 zod, react-hook-form 적용 예정

interface LoginFormProps {
  onSubmit: (name: string, password: string) => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, password);
  };

  return (
    <Card className="flex w-full border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-black">
          환영합니다
        </CardTitle>
        <p className="text-sm text-gray-600 text-center font-medium">
          로그인하여 페이스필터의 시술 목록을 확인하세요
        </p>
      </CardHeader>

      <CardContent className="space-y-5 px-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
              이름
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
              disabled={isLoading}
              className="h-11 text-s text-gray-500 border-2 border-gray-200 focus:border-gray-500 transition-colors placeholder:text-gray-400"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요."
              required
              disabled={isLoading}
              className="h-11 text-sm text-gray-500 border-2 border-gray-200 focus:border-gray-500 transition-colors placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                disabled={isLoading}
                className="h-4 w-4 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 data-[state=checked]:text-white"
              />
              <Label 
                htmlFor="remember" 
                className="text-gray-600 font-medium text-xs cursor-pointer"
              >
                로그인 상태 유지
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
              className="w-full h-11 text-sm font-semibold border-2 border-gray-300 bg-gray-300 hover:bg-gray-600 transition-all duration-200 ease-in-out"
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
