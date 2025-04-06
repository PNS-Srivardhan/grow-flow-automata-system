
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const GenerateDataButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateData = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sample-data');
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Sample sensor data generated',
      });
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate sample data',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleGenerateData} 
      disabled={isGenerating}
      className="flex items-center gap-2"
    >
      {isGenerating && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {isGenerating ? 'Generating...' : 'Generate Sample Data'}
    </Button>
  );
};

export default GenerateDataButton;
