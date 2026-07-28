"use client";

import { useEffect, useState } from "react";
import { Medal, Zap, Coins } from "lucide-react";
import Modal from "@/app/_components/Modal";

export default function AchievementCelebration({ onClose }: { onClose?: () => void }) {
    const [achievement, setAchievement] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const initSocket = async () => {
            const socket = (await import("@/lib/socket")).getSocket();
            if (!socket) return;

            const handler = (data: any) => {
                setAchievement(data);
                setIsVisible(true);
            };

            socket.on("achievement:unlocked", handler);
            return () => {
                socket.off("achievement:unlocked", handler);
            };
        };

        initSocket();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible || !achievement) return null;

    const rarityColors: Record<string, string> = {
        common: "from-gray-100 to-gray-200 border-gray-300",
        rare: "from-blue-100 to-blue-200 border-blue-300",
        epic: "from-purple-100 to-purple-200 border-purple-300",
        legendary: "from-yellow-100 to-yellow-200 border-yellow-300",
    };

    const rarityTextColors: Record<string, string> = {
        common: "text-gray-700",
        rare: "text-blue-700",
        epic: "text-purple-700",
        legendary: "text-yellow-700",
    };

    return (
        <Modal open={isVisible} onClose={handleClose} title="Achievement Unlocked!">
            <div className="text-center py-4">
                <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity] || rarityColors.common} border-2 animate-bounce`}>
                    <Medal className="h-12 w-12 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">{achievement.badgeName}</h3>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase mb-4 ${rarityTextColors[achievement.rarity] || rarityTextColors.common}`}>
                    {achievement.rarity}
                </span>
                <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-gray-900">+{achievement.xpReward} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-600" />
                        <span className="font-bold text-gray-900">+{achievement.coinReward} Coins</span>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="rounded-full bg-gray-900 px-8 py-3 text-sm font-bold text-white hover:bg-gray-800 transition"
                >
                    Awesome!
                </button>
            </div>
        </Modal>
    );
}
