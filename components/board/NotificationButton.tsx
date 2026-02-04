"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationButton() {
  return (
    <Button variant="ghost" size="icon" aria-label="การแจ้งเตือน">
      <Bell className="h-5 w-5" />
    </Button>
  );
}
