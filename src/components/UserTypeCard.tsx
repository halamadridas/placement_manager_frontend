import { Button } from "@/components/ui/button";
import React from "react";

interface UserTypeCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export const UserTypeCard: React.FC<UserTypeCardProps> = ({
  title,
  description,
  onClick,
}) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center w-64 border">
    <h2 className="text-lg font-bold mb-2">{title}</h2>
    <p className="text-gray-600 mb-4 text-center">{description}</p>
    <Button className="w-full" onClick={onClick}>
      Continue as {title}
    </Button>
  </div>
);
