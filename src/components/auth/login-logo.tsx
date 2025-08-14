import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex justify-center items-center">
      <Image
        src="/facefilter_logo.svg"
        alt="Logo"
        width={320}
        height={320}
      />
    </div>
  );
}