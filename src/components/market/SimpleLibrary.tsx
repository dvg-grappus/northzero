
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMarket } from "@/providers/MarketProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Maximize } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SimpleLibraryProps {
  onComplete: () => void;
}

export const SimpleLibrary: React.FC<SimpleLibraryProps> = ({ onComplete }) => {
  const { 
    libraryItems, 
    saveLibraryItem, 
    viewLibraryItem, 
    selectedLibraryItem,
    savedLibraryCount,
    viewedGraphCount,
    isSection3Complete 
  } = useMarket();
  
  const [showFullGraph, setShowFullGraph] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Monitor for completion
  useEffect(() => {
    if (isSection3Complete) {
      onComplete();
    }
  }, [isSection3Complete, onComplete]);
  
  // Filter items based on selected tab
  const filteredItems = activeTab === "all" 
    ? libraryItems
    : libraryItems.filter(item => item.type === activeTab);
  
  // Get badge color based on item type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'report':
        return 'bg-purple-500 hover:bg-purple-500';
      case 'case-study':
        return 'bg-amber-500 hover:bg-amber-500';
      case 'graph':
        return 'bg-cyan hover:bg-cyan text-black';
      default:
        return '';
    }
  };

  // Item preview content
  const renderPreview = () => {
    if (!selectedLibraryItem) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <p className="mb-2">Select an item to preview</p>
          <p className="text-sm">Click on any item from the list to see details</p>
        </div>
      );
    }
    
    return (
      <Card className="w-full bg-[#262626] border-none h-[400px] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{selectedLibraryItem.title}</CardTitle>
          <div className="flex gap-2">
            {!selectedLibraryItem.saved && (
              <Button 
                size="sm" 
                variant="outline"
                className="gap-1"
                onClick={() => saveLibraryItem(selectedLibraryItem.id)}
              >
                <Check className="h-4 w-4" />
                Save
              </Button>
            )}
            
            {selectedLibraryItem.type === 'graph' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1"
                onClick={() => setShowFullGraph(true)}
              >
                <Maximize className="h-4 w-4" />
                Expand
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedLibraryItem.type === 'graph' ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                {selectedLibraryItem.data?.datasets?.length > 1 ? (
                  <LineChart data={selectedLibraryItem.data?.labels?.map((label: string, i: number) => {
                    const dataPoint: any = { name: label };
                    selectedLibraryItem.data.datasets.forEach((dataset: any, j: number) => {
                      dataPoint[dataset.label] = dataset.data[i];
                    });
                    return dataPoint;
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#9A9A9A" />
                    <YAxis stroke="#9A9A9A" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#262626', borderColor: '#444' }} 
                      labelStyle={{ color: 'white' }}
                    />
                    {selectedLibraryItem.data?.datasets?.map((dataset: any, i: number) => (
                      <Line 
                        key={i}
                        type="monotone" 
                        dataKey={dataset.label} 
                        stroke={dataset.borderColor || '#7DF9FF'}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={selectedLibraryItem.data?.labels?.map((label: string, i: number) => {
                    const dataPoint: any = { name: label };
                    if (selectedLibraryItem.data?.datasets?.[0]) {
                      dataPoint.value = selectedLibraryItem.data.datasets[0].data[i];
                    }
                    return dataPoint;
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#9A9A9A" />
                    <YAxis stroke="#9A9A9A" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#262626', borderColor: '#444' }} 
                      labelStyle={{ color: 'white' }} 
                    />
                    <Bar 
                      dataKey="value" 
                      fill={selectedLibraryItem.data?.datasets?.[0]?.backgroundColor || '#7DF9FF'} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <img 
                src={selectedLibraryItem.previewUrl || '/placeholder.svg'} 
                alt={selectedLibraryItem.title}
                className="max-w-full max-h-[250px] object-contain"
              />
              <p className="mt-4 text-sm">{selectedLibraryItem.content}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4">
      {/* Status and filter tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm">
          <span className="text-cyan">{savedLibraryCount}</span> / 4 saved, 
          <span className="text-cyan ml-1">{viewedGraphCount}</span> / 1 graphs viewed
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="report">Reports</TabsTrigger>
            <TabsTrigger value="case-study">Case Studies</TabsTrigger>
            <TabsTrigger value="graph">Graphs</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Items list */}
        <div className="md:col-span-1">
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card 
                  className={`cursor-pointer hover:border-muted transition-all ${
                    selectedLibraryItem?.id === item.id ? 'border-cyan' : ''
                  }`}
                  onClick={() => viewLibraryItem(item.id)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <Badge className={`${getBadgeColor(item.type)} font-normal mb-2 self-start`}>
                        {item.type === 'report' ? 'Report' : 
                        item.type === 'case-study' ? 'Case Study' : 'Graph'}
                      </Badge>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    
                    {item.saved ? (
                      <Badge variant="outline" className="ml-2">Saved</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveLibraryItem(item.id);
                        }}
                      >
                        Save
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center text-muted-foreground p-6">
                No items found in this category
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - preview pane */}
        <div className="md:col-span-2">
          {renderPreview()}
        </div>
      </div>
      
      {/* Full graph modal */}
      <Dialog open={showFullGraph} onOpenChange={setShowFullGraph}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedLibraryItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="h-[60vh]">
            <ResponsiveContainer width="100%" height="100%">
              {selectedLibraryItem?.data?.datasets?.length > 1 ? (
                <LineChart data={selectedLibraryItem?.data?.labels?.map((label: string, i: number) => {
                  const dataPoint: any = { name: label };
                  selectedLibraryItem?.data?.datasets?.forEach((dataset: any, j: number) => {
                    dataPoint[dataset.label] = dataset.data[i];
                  });
                  return dataPoint;
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#9A9A9A" />
                  <YAxis stroke="#9A9A9A" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#262626', borderColor: '#444' }} 
                    labelStyle={{ color: 'white' }}
                  />
                  {selectedLibraryItem?.data?.datasets?.map((dataset: any, i: number) => (
                    <Line 
                      key={i}
                      type="monotone" 
                      dataKey={dataset.label} 
                      stroke={dataset.borderColor || '#7DF9FF'}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={selectedLibraryItem?.data?.labels?.map((label: string, i: number) => {
                  const dataPoint: any = { name: label };
                  if (selectedLibraryItem?.data?.datasets?.[0]) {
                    dataPoint.value = selectedLibraryItem.data.datasets[0].data[i];
                  }
                  return dataPoint;
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#9A9A9A" />
                  <YAxis stroke="#9A9A9A" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#262626', borderColor: '#444' }} 
                    labelStyle={{ color: 'white' }} 
                  />
                  <Bar 
                    dataKey="value" 
                    fill={selectedLibraryItem?.data?.datasets?.[0]?.backgroundColor || '#7DF9FF'} 
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {!selectedLibraryItem?.saved && (
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => {
                  if (selectedLibraryItem) {
                    saveLibraryItem(selectedLibraryItem.id);
                  }
                  setShowFullGraph(false);
                }}
              >
                Save and Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
