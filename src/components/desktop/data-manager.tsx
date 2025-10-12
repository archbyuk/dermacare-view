'use client';

import { useState } from 'react';
// import DataList from './data-list';
import DataDetail from './data-detail';

interface DataItem {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'inactive';
    lastModified: string;
}

export default function DataManager() {
    const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

    return (
        <div className="h-full w-full flex">
            {/* <DataList 
                selectedItem={selectedItem} 
                onItemSelect={setSelectedItem} 
            /> */}
            <DataDetail selectedItem={selectedItem} />
        </div>
    );
}