'use client';

import React from 'react';
import { FileNode } from '@/types';
import { formatBytes, formatNumber } from '@/lib/utils';
import { Files, Folder, HardDrive, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsProps {
  data: FileNode;
  scannedAt?: string;
}

function countNodes(node: FileNode): { files: number; folders: number } {
  let files = 0;
  let folders = 0;

  if (node.type === 'file') {
    files = 1;
  } else {
    folders = 1;
    if (node.children) {
      for (const child of node.children) {
        const counts = countNodes(child);
        files += counts.files;
        folders += counts.folders;
      }
    }
  }

  return { files, folders };
}

export default function Stats({ data, scannedAt }: StatsProps) {
  const counts = countNodes(data);

  const stats = [
    {
      icon: HardDrive,
      label: 'Total Size',
      value: formatBytes(data.size),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Files,
      label: 'Files',
      value: formatNumber(counts.files),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Folder,
      label: 'Folders',
      value: formatNumber(counts.folders),
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scannedAt && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last scanned: {new Date(scannedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
