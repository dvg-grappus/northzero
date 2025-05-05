
import React, { useState } from "react";
import { Layers, Trash2, Star, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompetition, SecondaryInsight } from "@/providers/CompetitionProvider";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface InsightCardProps {
  insight: SecondaryInsight;
  isSelected: boolean;
  onToggleSelect: () => void;
  onStar: () => void;
  onDelete: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  isSelected, 
  onToggleSelect,
  onStar,
  onDelete
}) => {
  return (
    <div 
      className={`p-4 mb-2 rounded-md border transition-all ${
        isSelected ? "border-cyan bg-cyan/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-2">
        <div>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={onToggleSelect}
            className="rounded border-muted-foreground/50"
          />
        </div>
        
        <div className="flex-1">
          <p className="text-sm">{insight.text}</p>
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>{insight.source}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onStar}
                className={`${
                  insight.starred ? "text-yellow-500" : "text-gray-500"
                } hover:text-yellow-500 transition-colors`}
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EnhancedHeatMapProps {
  insights: SecondaryInsight[];
}

const EnhancedHeatMap: React.FC<EnhancedHeatMapProps> = ({ insights }) => {
  const starredInsights = insights.filter(i => i.starred);
  
  const categoryCounts = {
    "ux": starredInsights.filter(i => i.text.toLowerCase().includes("ux") || i.text.toLowerCase().includes("interface")).length,
    "product": starredInsights.filter(i => i.text.toLowerCase().includes("product") || i.text.toLowerCase().includes("feature")).length,
    "growth": starredInsights.filter(i => i.text.toLowerCase().includes("growth") || i.text.toLowerCase().includes("acquisition")).length,
    "brand": starredInsights.filter(i => i.text.toLowerCase().includes("brand") || i.text.toLowerCase().includes("identity")).length
  };
  
  const chartData = [
    { name: "UX", value: categoryCounts.ux, color: "#3B82F6" },
    { name: "Product", value: categoryCounts.product, color: "#8B5CF6" },
    { name: "Growth", value: categoryCounts.growth, color: "#10B981" },
    { name: "Brand", value: categoryCounts.brand, color: "#F59E0B" },
  ];
  
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <div className="font-medium">{payload[0].name}</div>
                    <div className="text-muted-foreground text-xs">
                      {payload[0].value} insights
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="value" 
            name="Insights"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const InsightDigest: React.FC = () => {
  const { 
    secondaryInsights, 
    starInsight, 
    deleteInsight,
    mergeInsights
  } = useCompetition();
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [activePool, setActivePool] = useState<"secondary" | "primary">("secondary");
  const [viewMode, setViewMode] = useState<"list" | "chart">("list");
  
  const toggleInsightSelection = (id: string) => {
    setSelectedInsights(prev => 
      prev.includes(id) 
        ? prev.filter(insightId => insightId !== id) 
        : [...prev, id]
    );
  };
  
  const handleMergeSelected = () => {
    if (selectedInsights.length < 2) {
      toast.error("Select at least 2 insights to merge");
      return;
    }
    
    const toMerge = selectedInsights.map(id => 
      secondaryInsights.find(insight => insight.id === id)
    ).filter(Boolean);
    
    const mergedText = `Combined insight from ${toMerge.length} sources: ${toMerge.map(i => i?.text.substring(0, 30) + "...").join(" + ")}`;
    
    mergeInsights(selectedInsights, mergedText);
    
    setSelectedInsights([]);
    
    toast.success(`${selectedInsights.length} insights merged`);
  };
  
  const handleStarSelected = () => {
    if (selectedInsights.length === 0) return;
    
    selectedInsights.forEach(id => starInsight(id, true));
    
    toast.success(`${selectedInsights.length} insights starred`);
  };
  
  const handleDeleteSelected = () => {
    if (selectedInsights.length === 0) return;
    
    selectedInsights.forEach(id => deleteInsight(id));
    setSelectedInsights([]);
    
    toast.success(`${selectedInsights.length} insights deleted`);
  };
  
  const sortedInsights = [...secondaryInsights].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">Insight Digest</h2>
        <p className="text-muted-foreground">
          Review and refine your competitive insights before publishing.
        </p>
      </div>
      
      <div className="flex items-center border-b border-border/60 mb-6">
        <button 
          className={`px-4 py-3 ${
            activePool === 'secondary' 
              ? 'border-b-2 border-cyan text-foreground' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActivePool("secondary")}
        >
          Secondary Pool
        </button>
        <button 
          className={`px-4 py-3 ${
            activePool === 'primary' 
              ? 'border-b-2 border-cyan text-foreground' 
              : 'text-muted-foreground'
          }`}
          onClick={() => setActivePool("primary")}
        >
          Primary Pool
        </button>
        
        <div className="ml-auto flex">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${viewMode === 'list' ? 'bg-muted' : ''}`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${viewMode === 'chart' ? 'bg-muted' : ''}`}
            onClick={() => setViewMode("chart")}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex gap-8">
        <div className="flex-1">
          {activePool === "secondary" ? (
            <div>
              {selectedInsights.length > 0 && viewMode === "list" && (
                <div className="mb-4 p-3 bg-secondary/20 rounded-md flex gap-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    className="flex-1 gap-1"
                    onClick={handleMergeSelected}
                    disabled={selectedInsights.length < 2}
                  >
                    <Layers className="h-3 w-3" />
                    Merge ({selectedInsights.length})
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="flex-1 gap-1"
                    onClick={handleStarSelected}
                  >
                    <Star className="h-3 w-3" />
                    Star
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="flex-1 gap-1"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              )}
              
              {viewMode === "list" ? (
                <div className="space-y-2">
                  {sortedInsights.map(insight => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      isSelected={selectedInsights.includes(insight.id)}
                      onToggleSelect={() => toggleInsightSelection(insight.id)}
                      onStar={() => starInsight(insight.id, !insight.starred)}
                      onDelete={() => deleteInsight(insight.id)}
                    />
                  ))}
                  
                  {sortedInsights.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No insights in your secondary pool.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-card border border-border rounded-md p-6">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      Insight Heat Map
                    </h3>
                    <EnhancedHeatMap insights={secondaryInsights} />
                    <div className="mt-3 text-xs text-center text-muted-foreground">
                      {secondaryInsights.filter(i => i.starred).length} starred insights visualized by category
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-md p-6">
                    <h3 className="text-sm font-medium mb-3">Insights by Source</h3>
                    <div className="h-[180px] flex items-end gap-6 mt-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex-1 w-24 rounded-t-md bg-blue-500/90" style={{ 
                          height: `${Math.min(70, Math.max(20, sortedInsights.filter(i => i.source.includes('Competitor')).length * 10))}%` 
                        }}>
                        </div>
                        <div className="text-xs text-muted-foreground">Competitors</div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex-1 w-24 rounded-t-md bg-green-500/90" style={{ 
                          height: `${Math.min(70, Math.max(20, sortedInsights.filter(i => i.source.includes('Takeaway')).length * 10))}%` 
                        }}>
                        </div>
                        <div className="text-xs text-muted-foreground">Takeaways</div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex-1 w-24 rounded-t-md bg-amber-500/90" style={{ 
                          height: `${Math.min(70, Math.max(20, sortedInsights.filter(i => i.source.includes('Trend')).length * 10))}%` 
                        }}>
                        </div>
                        <div className="text-xs text-muted-foreground">Trends</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-md p-6">
                    <h3 className="text-sm font-medium mb-3">Top Starred Insights</h3>
                    <div className="space-y-3">
                      {sortedInsights
                        .filter(i => i.starred)
                        .slice(0, 5)
                        .map(insight => (
                          <div key={insight.id} className="text-sm p-3 bg-muted/30 rounded-md border border-muted">
                            {insight.text.length > 80 ? `${insight.text.substring(0, 80)}...` : insight.text}
                            <div className="text-xs text-muted-foreground mt-1">
                              {insight.source}
                            </div>
                          </div>
                        ))}
                      
                      {sortedInsights.filter(i => i.starred).length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No starred insights yet. Star some insights to see them here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Primary insights are read-only and can be viewed in the Audience module.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActivePool("secondary")}
              >
                Switch to Secondary Pool
              </Button>
            </div>
          )}
        </div>
        
        {viewMode === "list" && (
          <div className="w-[240px]">
            <div className="p-4 bg-card border border-border rounded-md">
              <h3 className="text-sm font-medium mb-3">Charts & Visualizations</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Switch to chart view to see detailed visualizations of your insights.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setViewMode("chart")}
              >
                <BarChart3 className="h-3 w-3 mr-2" />
                View Charts
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
