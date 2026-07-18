import { Card, CardContent } from "../ui/card";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
};

export default function StatsCard({
  title,
  value,
  subtitle,
  accent,
}: StatsCardProps) {
  return (
    <Card
      className={`rounded-lg border shadow-sm hover:shadow-md hover:bg-muted/30 transition-all duration-200 ${
        accent ? "border-t-2 border-t-primary" : ""
      }`}
    >
      <CardContent className="p-8">
        <p className="small-caps">{title}</p>

        <h2 className="mt-4 text-5xl font-heading">{value}</h2>

        {subtitle && (
          <p className="mt-3 text-sm text-primary font-medium">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}