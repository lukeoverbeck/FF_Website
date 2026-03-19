import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { cn } from "../lib/utils";

const SettingsCard = ({
  className,
  settingsName,
  settingsContent,
  ...props
}) => {
  return (
    <Card className={cn("bg-slate-50 gap-3", className)} {...props}>
      <CardHeader className="">
        <CardTitle>{settingsName}</CardTitle>
      </CardHeader>
      <CardContent className="">{settingsContent}</CardContent>
    </Card>
  );
};

export default SettingsCard;
