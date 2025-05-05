
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMarket } from "@/providers/MarketProvider";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface StatisticsHarvestProps {
  onComplete: () => void;
}

export const StatisticsHarvest: React.FC<StatisticsHarvestProps> = ({ onComplete }) => {
  const { 
    stats,
    acceptedStatsCount
  } = useMarket();
  
  const [activeFilters, setActiveFilters] = useState({
    region: '',
    year: '',
    metric: ''
  });

  // Call onComplete immediately without conditions
  useEffect(() => {
    onComplete();
  }, [onComplete]);
  
  // Filter options
  const regionOptions = ['Global', 'North America', 'APAC', 'Europe'];
  const yearOptions = ['2022', '2023', '2024'];
  const metricOptions = ['Spend', 'CAGR', 'Adoption', 'ROI', 'Efficiency'];
  
  // StatCard component - no click handlers
  const StatCard = React.memo<{ stat: any, index: number }>(({ stat, index }) => {
    return (
      <motion.div
        className={`bg-[#262626] rounded-lg p-5 h-[220px] flex flex-col justify-between border ${stat.accepted ? 'border-cyan' : 'border-transparent'}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        whileHover={{ scale: 1.02 }}
        layout
      >
        <div>
          <div className="text-3xl font-bold mb-2">{stat.value}</div>
          <p className="text-sm text-muted-foreground">{stat.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="bg-[#303030] text-xs px-2 py-1 rounded flex items-center gap-1">
            <span>{stat.source}</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full p-1 ${stat.accepted ? 'bg-cyan text-black' : 'hover:bg-cyan/20'}`}
              // onClick is removed to ignore clicks
            >
              <Check className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full p-1 hover:bg-red-500/20"
              // onClick is removed to ignore clicks
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  });
  
  StatCard.displayName = "StatCard";
  
  const applyFilter = React.useCallback((type: 'region' | 'year' | 'metric', value: string) => {
    // Toggle filter
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (newFilters[type] === value) {
        // If clicking the same filter value, turn it off
        newFilters[type] = '';
      } else {
        newFilters[type] = value;
      }
      
      return newFilters;
    });
  }, []);
  
  // Filter stats based on activeFilters
  const filteredStats = React.useMemo(() => stats.filter(stat => {
    if (activeFilters.region && stat.region !== activeFilters.region) return false;
    if (activeFilters.year && !stat.year?.includes(activeFilters.year)) return false;
    if (activeFilters.metric && !stat.metric?.includes(activeFilters.metric)) return false;
    return true;
  }), [stats, activeFilters]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold flex items-center">
          <span className="text-cyan mr-2">{acceptedStatsCount}</span> / 8 accepted
        </div>
        
        <div className="flex gap-2">
          <div className="relative group">
            <Button variant="outline" size="sm">Region ▾</Button>
            <div className="absolute right-0 mt-1 w-40 bg-[#262626] border border-border rounded-md shadow-lg z-10 hidden group-hover:block">
              {regionOptions.map(region => (
                <button
                  key={region}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent ${activeFilters.region === region ? 'bg-accent/50' : ''}`}
                  onClick={() => applyFilter('region', region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative group">
            <Button variant="outline" size="sm">Year ▾</Button>
            <div className="absolute right-0 mt-1 w-40 bg-[#262626] border border-border rounded-md shadow-lg z-10 hidden group-hover:block">
              {yearOptions.map(year => (
                <button
                  key={year}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent ${activeFilters.year === year ? 'bg-accent/50' : ''}`}
                  onClick={() => applyFilter('year', year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative group">
            <Button variant="outline" size="sm">Metric ▾</Button>
            <div className="absolute right-0 mt-1 w-40 bg-[#262626] border border-border rounded-md shadow-lg z-10 hidden group-hover:block">
              {metricOptions.map(metric => (
                <button
                  key={metric}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent ${activeFilters.metric === metric ? 'bg-accent/50' : ''}`}
                  onClick={() => applyFilter('metric', metric)}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
        
        {filteredStats.length === 0 && (
          <div className="col-span-3 text-center py-10 text-muted-foreground">
            No stats match your filters. Try adjusting or clearing filters.
          </div>
        )}
      </div>
    </div>
  );
};
