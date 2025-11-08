'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TopItemsPanel from '@/components/TopItemsPanel';
import { useScan } from '@/contexts/ScanContext';
import { useAppState } from '@/contexts/AppStateContext';

export default function Sidebar() {
  const { currentNode, handleNodeClick } = useScan();
  const { isSidebarOpen, setIsSidebarOpen } = useAppState();

  if (!currentNode) {
    return null;
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '500px' }}
      >
        <div className="h-full overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
            <h2 className="text-lg font-semibold">Top Items</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4">
            <TopItemsPanel
              data={currentNode}
              onItemClick={(node) => {
                if (node.type === 'directory') {
                  handleNodeClick(node);
                }
              }}
            />
          </div>
        </div>
      </aside>

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          style={{ paddingTop: '80px' }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
