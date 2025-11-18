"use client";

import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { Star, Calendar, MoreVertical } from "lucide-react";

const stats = [
  { m: "Aug 27", positive: 920, negative: 340 },
  { m: "Sep 27", positive: 1010, negative: 360 },
  { m: "Oct 27", positive: 880, negative: 420 },
  { m: "Nov 27", positive: 970, negative: 410 },
  { m: "Dec 27", positive: 1150, negative: 470 },
  { m: "Jan 28", positive: 940, negative: 390 },
  { m: "Feb 28", positive: 1080, negative: 430 },
  { m: "Mar 28", positive: 930, negative: 380 },
  { m: "Apr 28", positive: 1120, negative: 440 },
  { m: "May 28", positive: 980, negative: 360 },
  { m: "Jun 28", positive: 1060, negative: 400 },
  { m: "Jul 28", positive: 990, negative: 370 },
];

const ratingCategories = [
  { name: "Accommodation", score: 4.8 },
  { name: "Tour Guides", score: 4.6 },
  { name: "Itinerary", score: 4.4 },
  { name: "Customer Service", score: 4.7 },
  { name: "Value for Money", score: 4.5 },
  { name: "Safety", score: 4.2 },
  { name: "Transportation", score: 4.3 },
  { name: "Food", score: 4.5 },
];

const feedback = [
  { name: "Camellia Swan", package: "Venice Doenara", location: "Venice, Italy", rating: 4.5, text: "The Venice package was fantastic. Gondola ride was magical, and the guided tour was immersive." },
  { name: "Raphael Goodman", package: "Safari Adventure", location: "Serengeti, Tanzania", rating: 5, text: "A well-organized safari with knowledgeable guides and unforgettable views." },
  { name: "Ludwig Contessa", package: "Alpine Escape", location: "Swiss Alps", rating: 4.6, text: "Chalet stay with stunning alpine views. Top-notch accommodations." },
  { name: "James Dunn", package: "Parisian Romance", location: "Paris, France", rating: 4.3, text: "Romantic itinerary and river cruise. Great for couples." },
  { name: "Sophia Lee", package: "Tokyo Cultural Adventure", location: "Tokyo, Japan", rating: 4.5, text: "Insightful cultural experiences and delicious food." },
  { name: "Michael Smith", package: "Greek Island Hopping", location: "Santorini, Greece", rating: 4.2, text: "Island hopping was amazing. Hotels were comfortable." },
  { name: "Armando Meyers", package: "Caribbean Cruise", location: "Caribbean Sea", rating: 4.7, text: "Beautiful destinations and excellent staff service." },
  { name: "Emily Davis", package: "Bali Beach Escape", location: "Bali, Indonesia", rating: 4.4, text: "Beach views and resort amenities were great." },
];

export default function AdminReview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Review Statistics</CardTitle>
            <CardDescription>Positive vs. Negative</CardDescription>
            <CardAction>
              <Button variant="secondary" size="sm">Last 12 Months</Button>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={{ positive: { label: "Positive", color: "#60a5fa" }, negative: { label: "Negative", color: "#93c5fd" } }}>
              <BarChart data={stats} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="positive" fill="#60a5fa" radius={[6,6,0,0]} />
                <Bar dataKey="negative" fill="#93c5fd" radius={[6,6,0,0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Ratings</CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm"><MoreVertical className="size-4" /></Button>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-5 ${i < 5 ? "text-yellow-500" : "text-muted-foreground"}`} />
                ))}
              </div>
              <div className="text-xl font-semibold">4.5</div>
              <div className="text-xs text-muted-foreground">from 1,200 reviews</div>
            </div>
            <Separator className="my-4" />
            <div className="flex flex-col gap-2">
              {ratingCategories.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{c.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-3 ${i < Math.round(c.score) ? "text-yellow-500" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{c.score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Traveler Feedback</CardTitle>
          <CardAction className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <Label htmlFor="search">Search name, package, etc</Label>
              <Input id="search" placeholder="Tìm kiếm" className="w-[260px]" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Packages" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="safari">Safari Adventure</SelectItem>
                <SelectItem value="tokyo">Tokyo Cultural Adventure</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" className="gap-2"><Calendar className="size-4" /> 1 June 26 – 15 July 26</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {feedback.map((f) => (
              <Card key={f.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full overflow-hidden border"><img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop" alt={f.name} className="h-full w-full object-cover" /></div>
                    <div className="flex-1">
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.package} • {f.location}</div>
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-3 ${i < Math.round(f.rating) ? "text-yellow-500" : "text-muted-foreground"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">{f.rating}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div>Showing 9 out of 286</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">Previous</Button>
              <Button variant="secondary" size="sm">1</Button>
              <Button variant="ghost" size="sm">2</Button>
              <Button variant="ghost" size="sm">3</Button>
              <Button variant="ghost" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}