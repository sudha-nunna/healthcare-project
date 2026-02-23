import { Star, MapPin, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface DoctorCardProps {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  reviews: number;
  fee: number;
  location: string;
  image?: string;
  availableToday?: boolean;
}

export const DoctorCard = ({
  id,
  name,
  specialization,
  rating,
  reviews,
  fee,
  location,
  image,
  availableToday,
}: DoctorCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate(`/doctor/${id}`)}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-primary">
                {name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-lg text-foreground truncate">{name}</h3>
                <p className="text-sm text-muted-foreground">{specialization}</p>
              </div>
              {availableToday && (
                <Badge variant="secondary" className="flex-shrink-0">
                  Available Today
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-medium text-foreground">{rating}</span>
                <span>({reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-xl font-semibold text-foreground">${fee}</span>
                <span className="text-sm text-muted-foreground">consultation</span>
              </div>
              <Button size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Book
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
