// 'use client';

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Search, Filter, Plus } from 'lucide-react';
// import { getElementsList } from '@/api/element-api';
// import { getBundlesList } from '@/api/bundles-api';
// import { getCustomsList } from '@/api/customs-api';
// import { getSequencesList } from '@/api/sequences-api';

// interface DataItem {
//     id: string;
//     name: string;
//     type: string;
//     status: 'active' | 'inactive';
//     lastModified: string;
// }

// interface DataListProps {
//     selectedItem: DataItem | null;
//     onItemSelect: (item: DataItem) => void;
// }

// export default function DataList({ selectedItem, onItemSelect }: DataListProps) {
//     const [activeTab, setActiveTab] = useState('procedures');
//     const [activeSubTab, setActiveSubTab] = useState('element');
//     const [data, setData] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     // API 호출 함수
//     const loadData = async () => {
//         if (activeTab !== 'procedures') return;
        
//         setLoading(true);
//         setError(null);
        
//         try {
//             let apiData: any[] = [];
            
//             switch (activeSubTab) {
//                 case 'element':
//                     apiData = await getElementsList();
//                     break;
//                 case 'bundle':
//                     apiData = await getBundlesList();
//                     break;
//                 case 'custom':
//                     apiData = await getCustomsList();
//                     break;
//                 case 'sequence':
//                     apiData = await getSequencesList();
//                     break;
//                 default:
//                     apiData = [];
//             }
            
//             setData(apiData);
//         } catch (err) {
//             console.error('API 호출 실패:', err);
//             setError(err instanceof Error ? err.message : '데이터 로드에 실패했습니다.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 하위 탭 변경 시 데이터 로드
//     useEffect(() => {
//         loadData();
//     }, [activeSubTab, activeTab]);

//     // 데이터를 DataItem 형태로 변환
//     const getCurrentData = (): DataItem[] => {
//         if (activeTab !== 'procedures') return [];
        
//         return data.map((item, index) => {
//             let name = '';
//             let type = '';
//             let id = '';
            
//             switch (activeSubTab) {
//                 case 'element':
//                     name = item.name || `단일 시술 ${index + 1}`;
//                     type = '단일 시술';
//                     id = `element-${item.id || index}`;
//                     break;
//                 case 'bundle':
//                     name = item.name || `패키지 ${index + 1}`;
//                     type = '패키지';
//                     id = `bundle-${item.group_id || index}`;
//                     break;
//                 case 'custom':
//                     name = item.name || `커스텀 ${index + 1}`;
//                     type = '커스텀';
//                     id = `custom-${item.group_id || index}`;
//                     break;
//                 case 'sequence':
//                     name = item.sequence_name || `코스 패키지 ${index + 1}`;
//                     type = '코스 패키지';
//                     id = `sequence-${item.group_id || index}`;
//                     break;
//             }
            
//             return {
//                 id,
//                 name,
//                 type,
//                 status: (item.release === 1 ? 'active' : 'inactive') as 'active' | 'inactive',
//                 lastModified: new Date().toISOString().split('T')[0]
//             };
//         });
//     };

//     const currentData = getCurrentData();

//     return (
//         <div className="w-1/2 border-r border-gray-200 flex flex-col">
//             {/* 헤더 */}
//             <div className="p-4 border-b border-gray-200">
                
//                 {/* 탭 네비게이션 */}
//                 <Tabs value={activeTab} onValueChange={setActiveTab}>
//                     <TabsList className="grid w-full grid-cols-3">
//                         <TabsTrigger value="procedures">시술 관리</TabsTrigger>
//                         <TabsTrigger value="products">상품 관리</TabsTrigger>
//                         <TabsTrigger value="costs">비용 관리</TabsTrigger>
//                     </TabsList>
//                 </Tabs>
                
//                 {/* 시술 관리 하위 탭 */}
//                 {activeTab === 'procedures' && (
//                     <div className="mt-4">
//                         <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
//                             <TabsList className="grid w-full grid-cols-4">
//                                 <TabsTrigger value="element">단일 시술</TabsTrigger>
//                                 <TabsTrigger value="bundle">패키지</TabsTrigger>
//                                 <TabsTrigger value="custom">커스텀</TabsTrigger>
//                                 <TabsTrigger value="sequence">코스 패키지</TabsTrigger>
//                             </TabsList>
//                         </Tabs>
//                     </div>
//                 )}
//             </div>

//             {/* 검색 및 필터 */}
//             <div className="p-4 border-b border-gray-200">
//                 <div className="flex gap-2">
//                     <div className="flex-1 relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                         <input
//                             type="text"
//                             placeholder="검색..."
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>
//                     <Button variant="outline" size="sm">
//                         <Filter className="w-4 h-4" />
//                     </Button>
//                 </div>
//             </div>

//             {/* 목록 */}
//             <div className="flex-1 overflow-y-auto p-4">
//                 {loading ? (
//                     <div className="text-center text-gray-500 py-8">
//                         데이터를 불러오는 중...
//                     </div>
//                 ) : error ? (
//                     <div className="text-center text-red-500 py-8">
//                         오류: {error}
//                     </div>
//                 ) : currentData.length === 0 ? (
//                     <div className="text-center text-gray-500 py-8">
//                         데이터가 없습니다.
//                     </div>
//                 ) : (
//                     <div className="space-y-2">
//                         {currentData.map((item) => (
//                             <div
//                                 key={item.id}
//                                 className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
//                                     selectedItem?.id === item.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
//                                 }`}
//                                 onClick={() => onItemSelect(item as DataItem)}
//                             >
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <h3 className="font-medium text-gray-900">{item.name}</h3>
//                                         <p className="text-sm text-gray-500">{item.type}</p>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <span className={`px-2 py-1 text-xs rounded-full ${
//                                             item.status === 'active' 
//                                                 ? 'bg-green-100 text-green-800' 
//                                                 : 'bg-gray-100 text-gray-800'
//                                         }`}>
//                                             {item.status === 'active' ? '활성' : '비활성'}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
