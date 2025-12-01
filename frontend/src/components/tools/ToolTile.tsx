import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface ToolTileProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  comingSoon?: boolean;
  onClick: () => void;
}

const ToolTile = ({
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  comingSoon,
  onClick,
}: ToolTileProps) => {
  return (
    <Card
      className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
        comingSoon ? "opacity-60" : ""
      }`}
      onClick={comingSoon ? undefined : onClick}
    >
      <div className="space-y-4">
        <div className={`${bgColor} ${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            {comingSoon && (
              <Badge variant="secondary" className="text-xs">
                Soon
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default ToolTile;
