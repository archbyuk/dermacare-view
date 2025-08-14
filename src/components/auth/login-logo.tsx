import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex justify-center items-center${className}`}>
      <Image
        src="/logo.svg"
        alt="DermaCare View Logo"
        width={320}
        height={320}
      />
    </div>
  );
}