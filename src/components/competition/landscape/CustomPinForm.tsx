
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Competitor, useCompetition } from "@/providers/CompetitionProvider";
import { toast } from "sonner";

interface FormValues {
  name: string;
  type: "startup" | "large-company";
  website: string;
  priority: number;
}

export const CustomPinForm: React.FC = () => {
  const { addCompetitor } = useCompetition();
  const [open, setOpen] = useState(false);
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      type: "startup",
      website: "",
      priority: 5
    }
  });

  const onSubmit = (values: FormValues) => {
    const newCompetitor: Competitor = {
      id: `custom-${Date.now()}`,
      name: values.name,
      logo: "/placeholder.svg",
      tags: ["Custom"],
      type: values.type,
      website: values.website,
      priority: values.priority,
      position: { x: 0.5, y: 0.5 } // Default position in the center
    };
    
    addCompetitor(newCompetitor);
    toast.success(`${values.name} added to landscape`);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-1">
          <Plus className="h-4 w-4" />
          Add Custom Pin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Custom Competitor</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="startup" id="startup" />
                        <label htmlFor="startup" className="text-sm">Startup</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large-company" id="large-company" />
                        <label htmlFor="large-company" className="text-sm">Large Company</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority (1-10)</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <span className="text-sm font-medium w-8 text-center">
                      {field.value}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Competitor</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
