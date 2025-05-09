
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMarket } from "@/providers/MarketProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Maximize } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DeepDiveLibraryProps {
  onComplete: () => void;
}

export const DeepDiveLibrary: React.FC<DeepDiveLibraryProps> = ({ onComplete }) => {
  const { 
    libraryItems, 
    saveLibraryItem, 
    viewLibraryItem, 
    selectedLibraryItem,
    setSelectedLibraryItem,
    savedLibraryCount,
    viewedGraphCount,
    isSection3Complete 
  } = useMarket();
  
  const [showFullGraph, setShowFullGraph] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'type'>('newest');
  
  // Monitor for completion
  useEffect(() => {
    if (isSection3Complete) {
      onComplete();
    }
  }, [isSection3Complete, onComplete]);
  
  // Handle sorting
  const sortedItems = [...libraryItems].sort((a, b) => {
    if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }
    return 0; // For 'newest' we'll assume the current order is newest first
  });
  
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
  
  const renderPreview = () => {
    if (!selectedLibraryItem) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select an item to preview
        </div>
      );
    }
    
    if (selectedLibraryItem.type === 'graph') {
      return (
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{selectedLibraryItem.title}</h3>
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
              
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1"
                onClick={() => setShowFullGraph(true)}
              >
                <Maximize className="h-4 w-4" />
                Expand graph
              </Button>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {selectedLibraryItem.data?.datasets?.length > 1 ? (
                <LineChart data={selectedLibraryItem.data?.labels?.map((label, i) => {
                  const dataPoint: any = { name: label };
                  selectedLibraryItem.data.datasets.forEach((dataset, j) => {
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
                  {selectedLibraryItem.data?.datasets?.map((dataset, i) => (
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
                <BarChart data={selectedLibraryItem.data?.labels?.map((label, i) => {
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
        </div>
      );
    }
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{selectedLibraryItem.title}</h3>
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
        </div>
        
        <div className="bg-[#262626] rounded-lg p-6 flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <img 
              src={selectedLibraryItem.previewUrl || '/placeholder.svg'} 
              alt={selectedLibraryItem.title}
              className="max-w-full max-h-[300px] object-contain"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-cyan">{savedLibraryCount}</span> / 4 saved, 
          <span className="text-cyan ml-1">{viewedGraphCount}</span> / 1 graphs viewed
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={sortBy === 'newest' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('newest')}
          >
            Newest first
          </Button>
          
          <Button 
            variant={sortBy === 'type' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('type')}
          >
            Group by type
          </Button>
        </div>
      </div>
      
      <div className="flex gap-6">
        {/* Left column - document list */}
        <div className="w-[40%] bg-[#1C1C1C] rounded-lg p-4 overflow-y-auto max-h-[600px]">
          {sortedItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`mb-2 ${index !== 0 ? 'mt-2' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Card className={`p-3 flex items-center justify-between ${
                selectedLibraryItem?.id === item.id ? 'bg-secondary border border-muted' : ''
              }`}>
                <div className="flex items-center gap-3">
                  <Badge className={`${getBadgeColor(item.type)} font-normal`}>
                    {item.type === 'report' ? 'Report' : 
                    item.type === 'case-study' ? 'Case Study' : 'Graph'}
                  </Badge>
                  
                  <span 
                    className="font-medium hover:underline cursor-pointer"
                    onClick={() => viewLibraryItem(item.id)}
                  >
                    {item.title}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    disabled={item.saved}
                    onClick={() => saveLibraryItem(item.id)}
                  >
                    {item.saved ? 'Saved' : 'Save'}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => viewLibraryItem(item.id)}
                  >
                    View
                  </Button>
                </div>
              </Card>
              
              {index < sortedItems.length - 1 && <Separator className="my-2" />}
            </motion.div>
          ))}
        </div>
        
        {/* Right column - preview pane */}
        <div className="w-[58%] bg-[#1C1C1C] rounded-lg p-4 h-[600px]">
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
                <LineChart data={selectedLibraryItem?.data?.labels?.map((label, i) => {
                  const dataPoint: any = { name: label };
                  selectedLibraryItem?.data?.datasets?.forEach((dataset, j) => {
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
                  {selectedLibraryItem?.data?.datasets?.map((dataset, i) => (
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
                <BarChart data={selectedLibraryItem?.data?.labels?.map((label, i) => {
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
            <div className="flex justify-end">
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
