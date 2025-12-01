import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { getSectionSchema } from "@/lib/sections";

interface SectionEditorProps {
  section: {
    type: string;
    props: Record<string, any>;
  };
  index: number;
  onUpdate: (index: number, section: any) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const SectionEditor = ({
  section,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SectionEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const schema = getSectionSchema(section.type);

  const handlePropChange = (key: string, value: any) => {
    onUpdate(index, {
      ...section,
      props: {
        ...section.props,
        [key]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <CardTitle className="text-lg">{section.type}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(index)}
              disabled={!canMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(index)}
              disabled={!canMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Done" : "Edit"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isEditing && (
        <CardContent className="space-y-4">
          {Object.entries(schema).map(([key, field]: [string, any]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`${index}-${key}`}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {field.type === "text" ? (
                <Textarea
                  id={`${index}-${key}`}
                  value={section.props[key] || ""}
                  onChange={(e) => handlePropChange(key, e.target.value)}
                  rows={6}
                />
              ) : field.type === "select" ? (
                <Select
                  value={section.props[key] || ""}
                  onValueChange={(value) => handlePropChange(key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt: any) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`${index}-${key}`}
                  type={field.type === "number" ? "number" : "text"}
                  value={section.props[key] || ""}
                  onChange={(e) =>
                    handlePropChange(
                      key,
                      field.type === "number" ? Number(e.target.value) : e.target.value
                    )
                  }
                />
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};

export default SectionEditor;
