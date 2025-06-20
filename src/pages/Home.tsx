import AddScore from "@/components/AddScore";
import Scoreboard from "@/components/Scoreboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorageState } from "@/lib/utils";

export default function Home() {
  const [currentTab, setCurrentTab] = useLocalStorageState("tab", "score");

  return (
    <div className="max-w-xl mx-auto h-full flex flex-col justify-start items-center p-5">
      <Tabs
        onValueChange={(value: string) => setCurrentTab(value)}
        defaultValue={currentTab}
        className="w-full h-full flex flex-col"
      >
        <TabsList className="flex items-center justify-center flex-wrap h-fit space-y-1 w-full">
          <TabsTrigger value="score">Add Score</TabsTrigger>
          <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
        </TabsList>
        <TabsContent value="score" className="h-full">
          <AddScore />
        </TabsContent>
        <TabsContent value="scoreboard" className="h-full">
          <Scoreboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
