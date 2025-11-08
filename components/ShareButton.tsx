'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { copyToClipboard } from '@/lib/utils';

interface ShareButtonProps {
  getShareableUrl: () => string;
}

export default function ShareButton({ getShareableUrl }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = getShareableUrl();

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);

    if (success) {
      setCopied(true);
      toast.success('Link copied!', {
        description: 'The shareable link has been copied to your clipboard.',
      });

      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Copy failed', {
        description: 'Failed to copy link to clipboard.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCopied(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" title="Share current view">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share This View</DialogTitle>
          <DialogDescription>
            Share this link to let others view this exact directory, path, filters, and view mode.
          </DialogDescription>
        </DialogHeader>

        {/* URL Display */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-url">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                type="text"
                value={shareUrl}
                readOnly
                className="font-mono text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={handleCopy}
                size="sm"
                className="gap-2 shrink-0"
                variant={copied ? 'default' : 'outline'}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <Label>QR Code</Label>
            <div className="flex justify-center p-4 bg-white dark:bg-white rounded border">
              <QRCodeSVG value={shareUrl} size={200} level="M" marginSize={4} />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Scan with your phone to open this view on mobile
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
