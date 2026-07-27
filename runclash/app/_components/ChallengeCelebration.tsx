"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/_components/Modal";

export default function ChallengeCelebration({ onClose }: { onClose?: () => void }) {
    const [challenge, setChallenge] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const initSocket = async () => {
            const socket = (await import("@/lib/socket")).getSocket();
            if (!socket) return;

            const handler = (data: any) => {
                setChallenge(data);
                setIsVisible(true);
            };

            socket.on("challenge:completed", handler);
            return () => {
                socket.off("challenge:completed", handler);
            };
        };

        initSocket();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible || !challenge) return null;

    return (
        <Modal open={isVisible} onClose={handleClose} title="Challenge Completed!">
            <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-green-300">
                    <span className="text-5xl">🎯</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">{challenge.title}</h3>
                <p className="text-sm text-gray-500 mb-4">You crushed this challenge!</p>
                <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="font-bold text-gray-900">+{challenge.xpReward} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🪙</span>
                        <span className="font-bold text-gray-900">+{challenge.coinReward} Coins</span>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="rounded-full bg-gray-900 px-8 py-3 text-sm font-bold text-white hover:bg-gray-800 transition"
                >
                    Keep Going!
                </button>
            </div>
        </Modal>
    );
}
