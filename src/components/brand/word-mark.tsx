import Image from 'next/image';

export function WordMark() {
    return (
        <div className="flex justify-center items-center">
            <Image
                src="/word-mark.svg"
                alt="word_mark"
                width={320}
                height={320}
                priority
            />
        </div>
    );
}