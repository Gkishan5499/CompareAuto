import { useCity } from "@/contexts/CityContext";
import { listCities } from "@/lib/prices";
import { Label } from "@/components/ui/label";

interface CitySelectorProps {
  value?: string;
  onChange?: (citySlug: string) => void;
  compact?: boolean;
  className?: string;
}

const topCities = ["delhi-ncr", "mumbai", "bangalore", "hyderabad", "pune", "chennai"];

export const CitySelector = ({ 
  value, 
  onChange, 
  compact = false,
  className = ""
}: CitySelectorProps) => {
  const { city: contextCity, setCity: setContextCity } = useCity();
  const allCities = listCities();
  
  // Use prop value if provided, otherwise fall back to context
  const currentValue = value || contextCity;
  
  const handleChange = (newCity: string) => {
    if (onChange) {
      onChange(newCity);
    } else {
      setContextCity(newCity);
    }
  };

  const topCityList = allCities.filter(c => topCities.includes(c.slug));
  const otherCities = allCities.filter(c => !topCities.includes(c.slug));

  return (
    <div className={`flex flex-col gap-2 ${className}`} data-testid="cityselector">
      {!compact && (
        <Label htmlFor="city-select" className="text-sm text-muted-foreground">
          City
        </Label>
      )}
      <select
        id="city-select"
        name="city"
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        className={`
          bg-background border border-input rounded-md px-3 py-2
          text-sm focus:outline-none focus:ring-2 focus:ring-ring
          ${compact ? 'max-w-[220px]' : 'w-full'}
        `}
        aria-label="City"
      >
        <optgroup label="Top Cities">
          {topCityList.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </optgroup>
        {otherCities.length > 0 && (
          <optgroup label="Other Cities">
            {otherCities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
};
