import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DiaryTab from "@/components/internship/DiaryTab";
import ReflectionsTab from "@/components/internship/ReflectionsTab";

export default function Internship() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-heading leading-tight">Documentation</h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Document the experience — keep a diary, and turn it into reflections when you need to.
        </p>
      </div>

      <Tabs defaultValue="diary" className="items-center">
        <TabsList variant="line" className="mx-auto">
          <TabsTrigger value="diary">Diary</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
        </TabsList>

        <TabsContent value="diary" className="w-full pt-4">
          <DiaryTab />
        </TabsContent>
        <TabsContent value="reflections" className="w-full pt-4">
          <ReflectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
