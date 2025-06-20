import React from "react";
import AddScore from "@/components/AddScore";
import Scoreboard from "@/components/Scoreboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, useLocalStorageState } from "@/lib/utils";

export default function Admin() {
  const [currentTab, setCurrentTab] = useLocalStorageState("tab", "score");
  const [hideAdmin, setHideAdmin] = useLocalStorageState("hideAdmin", "false");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(event.key);
    if (event.key === "`") {
      setHideAdmin((prev) => String(!(prev == "true")));
    }
  };

  return (
    <div onKeyDown={handleKeyDown} className="p-5 h-full w-full">
      <div
        className={cn(
          "fixed top-3 left-3",
          hideAdmin == "false" ? "opacity-100" : "opacity-0"
        )}
      >
        Admin View
      </div>
      <Tabs
        onValueChange={(value) => setCurrentTab(value)}
        defaultValue={currentTab}
        className="w-full h-full flex flex-col mx-auto"
      >
        <TabsList className="flex items-center justify-center flex-wrap h-fit space-y-1 w-full  max-w-xl  mx-auto px-5">
          <TabsTrigger value="score">Add Score</TabsTrigger>
          <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
        </TabsList>
        <TabsContent value="score" className="h-full">
          <div className="max-w-xl mx-auto h-full flex flex-col justify-start items-center px-5">
            <AddScore isAdmin={true} />
          </div>
        </TabsContent>
        <TabsContent value="scoreboard" className="h-full">
          <div className="max-w-xl mx-auto h-full flex flex-col justify-start items-center px-5">
            <Scoreboard isAdmin={true} hideAdmin={hideAdmin} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
