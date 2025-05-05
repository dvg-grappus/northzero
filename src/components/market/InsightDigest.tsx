import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Star, FileText, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMarket } from "@/providers/MarketProvider";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface InsightDigestProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const InsightDigest: React.FC<InsightDigestProps> = ({ isOpen, onClose, onComplete }) => {
  const { marketInsights } = useMarket();
  const [activeTab, setActiveTab] = React.useState('list');
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  
  const starredInsights = marketInsights.filter(insight => insight.starred);
  const starredMarketInsightsCount = starredInsights.length;
  
  const handleExport = (type: 'pdf' | 'csv' | 'png') => {
    toast.success(`Exporting as ${type.toUpperCase()}`);
    console.log("onExport", type);
  };
  
  const handleComplete = () => {
    onClose();
    onComplete();
  };
  
  const sources = Array.from(new Set(starredInsights.map(insight => insight.source)));
  
  const filteredInsights = activeFilter
    ? starredInsights.filter(insight => insight.source === activeFilter)
    : starredInsights;
  
  const sourceDistributionData = React.useMemo(() => {
    const sourceCounts: Record<string, number> = {};
    starredInsights.forEach(insight => {
      sourceCounts[insight.source] = (sourceCounts[insight.source] || 0) + 1;
    });
    
    return Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count
    }));
  }, [starredInsights]);
  
  const timeDistributionData = [
    { month: 'Jan', count: 3 },
    { month: 'Feb', count: 5 },
    { month: 'Mar', count: 7 },
    { month: 'Apr', count: 10 },
    { month: 'May', count: 8 },
    { month: 'Jun', count: 12 }
  ];
  
  const typeDistributionData = React.useMemo(() => {
    const typeCounts = {
      stat: 0,
      social: 0,
      library: 0,
      merged: 0
    };
    
    starredInsights.forEach(insight => {
      if (insight.type in typeCounts) {
        typeCounts[insight.type as keyof typeof typeCounts]++;
      }
    });
    
    return [
      { name: 'Statistics', value: typeCounts.stat, color: '#3B82F6' },
      { name: 'Social', value: typeCounts.social, color: '#8B5CF6' },
      { name: 'Library', value: typeCounts.library, color: '#F59E0B' },
      { name: 'Merged', value: typeCounts.merged, color: '#10B981' }
    ];
  }, [starredInsights]);
  
  const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#6366F1'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogTitle>Market Insight Digest</DialogTitle>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Market Insight Digest</h2>
            <p className="text-sm text-muted-foreground">
              {starredInsights.length} starred insights from the Market module
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
              <FileImage className="h-4 w-4 mr-1" />
              PNG
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="charts">Chart View</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap gap-2">
              {sources.map(source => (
                <Badge 
                  key={source}
                  variant={activeFilter === source ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => setActiveFilter(activeFilter === source ? null : source)}
                >
                  {source}
                </Badge>
              ))}
            </div>
          </div>
          
          <TabsContent value="list" className="max-h-[60vh] overflow-y-auto">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-4">
              <AnimatePresence>
                {filteredInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    className="bg-[#262626] rounded-lg p-4 mb-4 break-inside-avoid-column border border-border/50"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <div className="flex justify-between mb-3">
                      <div className="bg-[#303030] text-xs px-2 py-1 rounded flex items-center gap-1">
                        <span>{insight.source}</span>
                      </div>
                      
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    
                    <p className="text-sm">{insight.text}</p>
                  </motion.div>
                ))}
                
                {filteredInsights.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground col-span-3">
                    {activeFilter 
                      ? "No starred insights match this filter."
                      : "No starred insights yet. Star insights in the Market workflow."}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#262626] p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-4">Insight Source Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="source" stroke="#9A9A9A" />
                      <YAxis stroke="#9A9A9A" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#444' }}
                        labelStyle={{ color: 'white' }}
                      />
                      <Bar dataKey="count" name="Insights" radius={[4, 4, 0, 0]}>
                        {sourceDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-[#262626] p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-4">Insight Type Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeDistributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                      <XAxis type="number" stroke="#9A9A9A" />
                      <YAxis dataKey="name" type="category" stroke="#9A9A9A" width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#444' }}
                        labelStyle={{ color: 'white' }}
                      />
                      <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                        {typeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-[#262626] p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-4">Time-based Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="month" stroke="#9A9A9A" />
                      <YAxis stroke="#9A9A9A" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#444' }}
                        labelStyle={{ color: 'white' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Insights" 
                        stroke="#7DF9FF" 
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-[#262626] p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-4">Top Market Insights</h3>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                  {starredInsights.slice(0, 5).map((insight, i) => (
                    <div key={insight.id} className="flex gap-2 items-start">
                      <div className="bg-[#1C1C1C] flex items-center justify-center rounded-full w-6 h-6 text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="text-sm">{insight.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleComplete} 
            className="bg-cyan text-black hover:bg-cyan/90"
          >
            Finish and return to timeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};