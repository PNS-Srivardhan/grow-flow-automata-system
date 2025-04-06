
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SystemStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
}

const SystemStatus = ({ isConnected, lastUpdated }: SystemStatusProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <div className="bg-hydroponics-green/10 p-1 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-hydroponics-green" />
              </div>
              <div className="text-sm font-medium text-hydroponics-green">Connected</div>
            </>
          ) : (
            <>
              <div className="bg-hydroponics-critical/10 p-1 rounded-full">
                <WifiOff className="h-5 w-5 text-hydroponics-critical" />
              </div>
              <div className="text-sm font-medium text-hydroponics-critical">Disconnected</div>
            </>
          )}
        </div>
      </CardContent>
      {lastUpdated && (
        <CardFooter className="pt-0">
          <CardDescription className="text-xs">
            Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </CardDescription>
        </CardFooter>
      )}
    </Card>
  );
};

export default SystemStatus;
