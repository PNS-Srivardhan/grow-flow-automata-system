import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useAddCrop } from "@/services/supabaseService";

const cropSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  min_air_temp: z.coerce.number(),
  max_air_temp: z.coerce.number(),
  min_water_temp: z.coerce.number(),
  max_water_temp: z.coerce.number(),
  min_humidity: z.coerce.number(),
  max_humidity: z.coerce.number(),
  min_ph: z.coerce.number().min(0, "pH must be positive"),
  max_ph: z.coerce.number().min(0, "pH must be positive"),
  min_tds: z.coerce.number().min(0, "TDS must be positive"),
  max_tds: z.coerce.number().min(0, "TDS must be positive"),
});

type CropFormValues = z.infer<typeof cropSchema>;

const AddCropForm = () => {
  const [open, setOpen] = React.useState(false);
  const addCrop = useAddCrop();

  const form = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: "",
      min_air_temp: 18,
      max_air_temp: 26,
      min_water_temp: 18,
      max_water_temp: 24,
      min_humidity: 60,
      max_humidity: 80,
      min_ph: 5.5,
      max_ph: 6.5,
      min_tds: 700,
      max_tds: 1200,
    },
  });

  const onSubmit = (values: CropFormValues) => {
    const cropData = {
      name: values.name,
      min_air_temp: values.min_air_temp,
      max_air_temp: values.max_air_temp,
      min_water_temp: values.min_water_temp,
      max_water_temp: values.max_water_temp,
      min_humidity: values.min_humidity,
      max_humidity: values.max_humidity,
      min_ph: values.min_ph,
      max_ph: values.max_ph,
      min_tds: values.min_tds,
      max_tds: values.max_tds,
    };
    
    addCrop.mutate(cropData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add New Crop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Crop</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_air_temp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Air Temp (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_air_temp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Air Temp (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="min_water_temp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Water Temp (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_water_temp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Water Temp (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="min_humidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Humidity (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_humidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Humidity (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="min_ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min pH</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max pH</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="min_tds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min TDS (ppm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_tds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max TDS (ppm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addCrop.isPending}>
                {addCrop.isPending ? "Adding..." : "Add Crop"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCropForm;
