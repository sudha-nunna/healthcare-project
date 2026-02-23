import { Star, MapPin, DollarSign, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComparisonCardProps {
  name: string;
  specialization: string;
  rating: number;
  reviews: number;
  fee: number;
  location: string;
  experience: string;
  features: {
    name: string;
    available: boolean;
  }[];
  isRecommended?: boolean;
  onBookClick?: () => void;
}

export const ComparisonCard = ({
  name,
  specialization,
  rating,
  reviews,
  fee,
  location,
  experience,
  features,
  isRecommended,
  onBookClick,
}: ComparisonCardProps) => {
  return (
    <Card className={`overflow-hidden ${isRecommended ? 'border-2 border-primary shadow-lg' : ''}`}>
      <CardHeader className="pb-4">
        {isRecommended && (
          <Badge className="w-fit mb-2">Recommended</Badge>
        )}
        <div className="w-20 h-20 bg-muted rounded-lg mx-auto flex items-center justify-center text-3xl font-semibold text-primary mb-3">
          {name.charAt(0)}
        </div>
        <h3 className="font-semibold text-xl text-center">{name}</h3>
        <p className="text-sm text-muted-foreground text-center">{specialization}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground">({reviews})</span>
        </div>

        <div className="text-center py-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="text-3xl font-bold">${fee}</span>
          </div>
          <p className="text-sm text-muted-foreground">per consultation</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">Experience:</span>
            <span>{experience}</span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              {feature.available ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={feature.available ? '' : 'text-muted-foreground'}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>

        <Button 
          className="w-full" 
          variant={isRecommended ? "default" : "outline"}
          onClick={onBookClick}
        >
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
};
