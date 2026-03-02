"use client";
import Link from "next/link";
import { MdEmail } from "react-icons/md"

export default function Footer() {
    return (
        <footer className="bg-background pt-24 pb-12 flex flex-col font-heading gap-16 bottom-0 text-white">
            <div className="mx-auto flex flex-col gap-12">
                <div className="text-center">
                    <h2 className="text-xl">CONNECT WITH ME</h2>
                    <h2 className="text-2xl font-bold">HELLO@SHOTCRIB.COM</h2>
                </div>

                <div className="flex justify-center gap-6">
                    <a href="mailto:hello@shotcrib.com" className="bg-orange-400 hover:bg-orange-500 border-2 border-orange-500 rounded-full w-12 h-12 flex items-center justify-center">
                        <MdEmail size={32} />
                    </a>
                </div>
            </div>
            <div className="w-3/4 mx-auto text-gray-400 text-lg">
                <hr />
                <div className="flex justify-between">
                    <span>©2026 ShotCrib</span>
                    <Link href="https://shotcrib.com">Home</Link>
                </div>
            </div>
        </footer>
    );
}