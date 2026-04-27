import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { cn } from "../lib/utils";

const SettingsCard = ({
  className,
  settingsName,
  settingsContent,
  ...props
}) => {
  return (
    <Card
      className={cn(
        "bg-white border-t-4 border-gold shadow-sm flex flex-col gap-1.5 p-5",
        className
      )}
      {...props}
    >
      <CardHeader className="p-0">
        <CardTitle className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
          {settingsName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-xl font-bold text-navy">{settingsContent}</p>
      </CardContent>
    </Card>
  );
};

export default SettingsCard;
