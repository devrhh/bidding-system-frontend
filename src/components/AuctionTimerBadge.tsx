import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

function formatTimeLeft(seconds: number) {
  if (seconds <= 0) return "Expired";
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    return `Ends in ${days} day${days > 1 ? "s" : ""}`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const AuctionTimerBadge = ({ endTime, onExpire }: { endTime: string; onExpire?: () => void }) => {
  const calcTimeLeft = useCallback(
    () => Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)),
    [endTime]
  );
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, timeLeft, onExpire, calcTimeLeft]);

  return <Badge variant="secondary">Time Left: {formatTimeLeft(timeLeft)}</Badge>;
};

export default AuctionTimerBadge; 