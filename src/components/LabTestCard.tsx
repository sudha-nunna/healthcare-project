import { FlaskConical, Clock, Home, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LabTestCardProps {
  name: string;
  description: string;
  price: number;
  duration: string;
  homeCollection?: boolean;
  popular?: boolean;
  onBookTest?: () => void;
}

export const LabTestCard = ({
  name,
  description,
  price,
  duration,
  homeCollection,
  popular,
  onBookTest,
}: LabTestCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{name}</h3>
              {popular && (
                <Badge variant="secondary" className="mt-1">
                  Popular
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          {homeCollection && (
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4 text-accent" />
              <span>Home collection available</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-2xl font-semibold text-foreground">${price}</span>
          </div>
          <Button onClick={onBookTest}>Book Test</Button>
        </div>
      </CardContent>
    </Card>
  );
};
