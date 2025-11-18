"use client";

import { Card, CardTitle, CardHeader, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MapPin, Calendar, ImagePlus, Handshake, ThumbsUp, MessageSquareMore } from "lucide-react";
import { IArticle } from "@/types/response/article.type";
import { useEffect, useState } from "react";
import { adminApi } from "@/apis/admin";

const items = [
  { title: "Alpine Escape hihuhuh ihuiadiad adh iasdajdand aidasd ja", location: "Swiss Alps, Switzerland", image: "https://images.unsplash.com/photo-1500417148159-68083bd7333f?q=80&w=1080&auto=format&fit=crop" },
  { title: "Bali Beach Escape", location: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1504608524841-42fe6f0321a5?q=80&w=1080&auto=format&fit=crop" },
  { title: "Caribbean Cruise", location: "Caribbean Sea", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop" },
  { title: "Greek Island Hopping", location: "Santorini, Greece", image: "https://images.unsplash.com/photo-1508599575973-3f233b4a9839?q=80&w=1080&auto=format&fit=crop" },
  { title: "New York City Highlights", location: "New York, USA", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1080&auto=format&fit=crop" },
  { title: "Parisian Romance", location: "Paris, France", image: "https://images.unsplash.com/photo-1543349689-9a4d2a3ac0bb?q=80&w=1080&auto=format&fit=crop" },
  { title: "Safari Adventure", location: "Serengeti, Tanzania", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1080&auto=format&fit=crop" },
  { title: "Seoul Cultural Exploration", location: "Seoul, South Korea", image: "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=1080&auto=format&fit=crop" },
  { title: "Sydney Explorer", location: "Sydney, Australia", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=1080&auto=format&fit=crop" },
  { title: "Tokyo Cultural Adventure", location: "Tokyo, Japan", image: "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=1080&auto=format&fit=crop" },
  { title: "Tropical Paradise Retreat", location: "Maldives", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop" },
  { title: "Venice Dreams", location: "Venice, Italy", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop" },
];

export default function AdminBlog() {

  const [articles, setArticles] = useState<IArticle[]>([]);

  useEffect(() => {
        (async () => {
            try {
                const resArticles = await adminApi.getAllArticle();
                setArticles(resArticles);
            } catch (e) {
                throw new Error('Error get notification: ' + e);
            }
        })();
    }, []);

  return (
    <div className="flex flex-col gap-4">
        <CardHeader className="border-b">
          <CardAction className="flex items-center gap-2 flex-wrap justify-between">
            <Button variant="secondary" size="sm" className="gap-2"><Calendar className="size-4" /> 1–30 June 26</Button>
            <Select defaultValue="package">
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="package">Package</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex items-center gap-2">
              <Label htmlFor="search">Search</Label>
              <Input id="search" placeholder="Search packages, location, etc" className="w-[260px]" />
            </div>
          </CardAction>
        </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {articles.map((it) => (
          <Card key={it.id} 
          className="hover:bg-muted/100"
          onClick={() => {console.log(it)}}>
            <CardContent className="">
              <div className="overflow-hidden rounded-lg border">
                <img src={ 'https://images.unsplash.com/photo-1528127269322-539801943592' } alt={it.title} className="h-40 w-full object-cover" />
              </div>
              <div className="mt-3">
                <div className="font-medium">{it.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><ThumbsUp className="size-3" /> {it.count_likes}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MessageSquareMore className="size-3" /> {it.count_comments}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>Showing 12 out of 2390</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">Previous</Button>
          <Button variant="secondary" size="sm">1</Button>
          <Button variant="ghost" size="sm">2</Button>
          <Button variant="ghost" size="sm">3</Button>
          <Button variant="ghost" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}