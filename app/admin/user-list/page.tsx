"use client";
import { Card, CardHeader, CardTitle, CardAction, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  PlusIcon,
  SearchIcon,
  Share2Icon,
  PrinterIcon,
  Settings2Icon,
  PencilIcon,
  Trash2Icon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from "lucide-react";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dept: string;
  status: "Active" | "Inactive" | "Deactivate";
};

const rows: Row[] = [
  { id: "860315-1521", name: "john gerard", email: "adam@gmail.com", phone: "076-8359082", dept: "sales", status: "Active" },
  { id: "860315-1521", name: "john gerard", email: "adam@gmail.com", phone: "076-8359082", dept: "forvaltning", status: "Inactive" },
  { id: "860315-1521", name: "john smith gerard", email: "adam@gmail.com", phone: "076-8359082", dept: "DET", status: "Active" },
  { id: "860315-1521", name: "gerard antony john", email: "adam@gmail.com", phone: "076-8359082", dept: "sales", status: "Active" },
  { id: "860315-1521", name: "johngerard", email: "adam@gmail.com", phone: "076-8359082", dept: "forvaltning", status: "Active" },
  { id: "860315-1521", name: "johngerard", email: "adam@gmail.com", phone: "076-8359082", dept: "forvaltning", status: "Deactivate" },
  { id: "860315-1521", name: "johngerard", email: "adam@gmail.com", phone: "076-8359082", dept: "sales", status: "Active" },
  { id: "860315-1521", name: "johngerard", email: "adam@gmail.com", phone: "076-8359082", dept: "DET", status: "Active" },
  { id: "860315-1521", name: "johngerard", email: "adam@gmail.com", phone: "076-8359082", dept: "DET", status: "Active" },
  { id: "860315-1521", name: "john gerard", email: "adam@gmail.com", phone: "076-8359082", dept: "sales", status: "Active" },
];

const AdminListEmployee = () => {
  return (
    <div className="w-full min-h-svh flex flex-col">
      <Card className="w-full flex-1 flex flex-col p-4">
        <CardHeader className="border-b px-0">
          <CardTitle className="text-2xl">Danh sách khách hàng </CardTitle>
          <CardAction className="flex items-center gap-2">
            <Button variant="default" size="sm" className="gap-2">
              <PlusIcon className="size-4" />
              Thêm
            </Button>
          </CardAction>
        </CardHeader>

        {/* Toolbar */}
        <CardContent className="pt-4 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="Tìm kiếm" className="sr-only">
                Tìm kiếm
              </Label>
              <div className="relative">
                <SearchIcon className="text-muted-foreground absolute left-2 top-1/2 size-4 -translate-y-1/2" />
                <Input id="search" placeholder="Tìm kiếm" className="pl-8 w-64" />
              </div>
            </div>
          </div>
        </CardContent>

        {/* Table */}
        <CardContent className="w-full px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs">
                  <th className="py-3 text-left">NAME</th>
                  <th className="py-3 text-left">EMAIL</th>
                  <th className="py-3 text-left">MOBILE</th>
                  <th className="py-3 text-left">STATUS</th>
                  <th className="py-3 text-left">EDIT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const renderStatus = () => {
                    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
                    switch (row.status) {
                      case "Active":
                        return <span className={`${base} bg-green-500/15 text-green-700`}>Active</span>;
                      case "Inactive":
                        return <span className={`${base} bg-orange-500/15 text-orange-700`}>Inactive</span>;
                      case "Deactivate":
                        return <span className={`${base} bg-red-500/15 text-red-700`}>Deactivate</span>;
                    }
                  };

                  return (
                    <tr
                      key={i}
                      onClick={() => console.log("Row clicked:", row)}
                      className="border-t cursor-pointer transition-colors hover:bg-muted/30"
                    >
                      <td className="py-3">{row.name}</td>
                      <td className="py-3 text-muted-foreground">{row.email}</td>
                      <td className="py-3">{row.phone}</td>
                      <td className="py-3">{renderStatus()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Edit:", row);
                                }}
                              >
                                <PencilIcon className="size-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Delete:", row);
                                }}
                              >
                                <Trash2Icon className="size-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination */}
        <CardFooter className="border-t px-0">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Items per page:</span>
              <span className="inline-flex items-center rounded-md border px-2 py-1">10</span>
            </div>
            <div className="text-sm text-muted-foreground">1–10 of 100</div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronsLeftIcon className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronsRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
export default AdminListEmployee