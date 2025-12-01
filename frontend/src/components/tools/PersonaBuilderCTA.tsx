import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, MapPin, Car, Calendar } from "lucide-react";

const PersonaBuilderCTA = () => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-purple-500/10 via-primary/10 to-blue-500/10 p-8 md:p-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <Badge variant="secondary" className="text-sm">Coming Soon</Badge>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold">
            Let AI Pick Your Perfect Variant
          </h2>

          <p className="text-lg text-muted-foreground">
            Answer a few questions about your lifestyle, and our AI will recommend the ideal car variant tailored to your needs.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
            <div className="bg-background/50 backdrop-blur rounded-lg p-4 space-y-2">
              <Users className="h-6 w-6 mx-auto text-primary" />
              <p className="text-sm font-medium">Family Size</p>
            </div>
            <div className="bg-background/50 backdrop-blur rounded-lg p-4 space-y-2">
              <MapPin className="h-6 w-6 mx-auto text-primary" />
              <p className="text-sm font-medium">City Usage</p>
            </div>
            <div className="bg-background/50 backdrop-blur rounded-lg p-4 space-y-2">
              <Car className="h-6 w-6 mx-auto text-primary" />
              <p className="text-sm font-medium">Highway Trips</p>
            </div>
            <div className="bg-background/50 backdrop-blur rounded-lg p-4 space-y-2">
              <Calendar className="h-6 w-6 mx-auto text-primary" />
              <p className="text-sm font-medium">Commute Type</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button size="lg" disabled className="text-base">
              <Sparkles className="h-5 w-5 mr-2" />
              Get AI Recommendations
            </Button>
            <p className="text-sm text-muted-foreground">
              We're training our AI to understand your preferences. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaBuilderCTA;
