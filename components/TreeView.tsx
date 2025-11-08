'use client';

import React, { useState } from 'react';
import { FileNode } from '@/types';
import { formatBytes } from '@/lib/utils';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TreeViewProps {
  data: FileNode;
  onItemClick?: (node: FileNode) => void;
}

interface TreeNodeProps {
  node: FileNode;
  level: number;
  onItemClick?: (node: FileNode) => void;
}

function TreeNode({ node, level, onItemClick }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isDirectory = node.type === 'directory';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClick = () => {
    if (isDirectory && onItemClick) {
      onItemClick(node);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 rounded transition-colors ${
          isDirectory ? 'cursor-pointer' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Button variant="ghost" size="icon" onClick={handleToggle} className="h-5 w-5 p-0.5">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        ) : (
          <div className="w-5" />
        )}

        {/* Icon */}
        {isDirectory ? (
          isExpanded && hasChildren ? (
            <FolderOpen className="w-4 h-4 text-blue-500" />
          ) : (
            <Folder className="w-4 h-4 text-blue-500" />
          )
        ) : (
          <File className="w-4 h-4 text-muted-foreground" />
        )}

        {/* Name */}
        <span className="flex-1 truncate font-medium text-sm">{node.name}</span>

        {/* Size */}
        <span className="text-xs text-muted-foreground font-mono">{formatBytes(node.size)}</span>

        {/* File Count for Directories */}
        {isDirectory && hasChildren && (
          <span className="text-xs text-muted-foreground">({node.children!.length})</span>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="animate-in slide-in-from-left-2">
          {node.children!.map((child, index) => (
            <TreeNode
              key={`${child.path}-${index}`}
              node={child}
              level={level + 1}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ data, onItemClick }: TreeViewProps) {
  return (
    <div className="h-full overflow-auto">
      {/* Toolbar */}
      <div className="sticky top-0 bg-background border-b p-3 flex items-center gap-2 z-10">
        <span className="text-sm text-muted-foreground">{data.children?.length || 0} items</span>
      </div>

      {/* Tree */}
      <div className="p-2">
        <TreeNode node={data} level={0} onItemClick={onItemClick} />
      </div>
    </div>
  );
}
