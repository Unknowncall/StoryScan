'use client';

import React, { useState } from 'react';
import { ChevronRight, Home, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { copyToClipboard, formatPath, type PathFormat } from '@/lib/utils';

interface BreadcrumbProps {
  path: string[];
  fullPath: string;
  onNavigate: (index: number) => void;
}

export default function Breadcrumb({ path, fullPath, onNavigate }: BreadcrumbProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPath = async (format: PathFormat) => {
    const formattedPath = formatPath(fullPath, format);
    const success = await copyToClipboard(formattedPath);

    if (success) {
      setCopied(true);
      toast.success('Path copied!', {
        description: `${formattedPath} (Format: ${format.toUpperCase()})`,
      });

      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Copy failed', {
        description: 'Could not copy path to clipboard',
      });
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2">
      <Button variant="outline" size="sm" onClick={() => onNavigate(0)} className="gap-1">
        <Home className="w-4 h-4" />
        <span className="font-medium">Root</span>
      </Button>

      {path.map((segment, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(index + 1)}
            className="whitespace-nowrap"
          >
            {segment}
          </Button>
        </React.Fragment>
      ))}

      {/* Copy Path Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 ml-2">
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Copy Path</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Copy as...</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleCopyPath('unix')}>
            Unix Format
            <span className="ml-auto text-xs text-muted-foreground">/path/to/file</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopyPath('windows')}>
            Windows (SMB)
            <span className="ml-auto text-xs text-muted-foreground">\\server\path</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopyPath('unraid')}>
            Unraid Format
            <span className="ml-auto text-xs text-muted-foreground">/mnt/user/...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
