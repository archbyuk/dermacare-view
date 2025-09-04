'use client';

import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Element, getElementsList, getElementDetail } from '@/api/element-api';
import { searchElementsByName } from '@/utils/element-utils';
import { BundleListResponse, getBundlesList, getBundleDetail } from '@/api/bundles-api';
import { CustomListResponse, getCustomsList, getCustomDetail } from '@/api/customs-api';
import { SequenceListResponse, getSequencesList, getSequenceDetail } from '@/api/sequences-api';
import { searchSequencesByName } from '@/utils/sequence-utils';
import { ProcedureInfo } from './standard-detail-types';

interface ProcedureSearchSelectorProps {
    packageType: string;
    onProcedureSelect: (type: 'element' | 'bundle' | 'custom' | 'sequence', id: number, name: string) => void;
    onProcedureInfoFetch: (type: 'element' | 'bundle' | 'custom' | 'sequence', id: number) => Promise<void>;
    onClearSelection: () => void;
    selectedProcedureName: string;
}

export default function ProcedureSearchSelector({
    packageType,
    onProcedureSelect,
    onProcedureInfoFetch,
    onClearSelection,
    selectedProcedureName
}: ProcedureSearchSelectorProps) {
    // 시술 검색 관련 state
    const [showElementSearch, setShowElementSearch] = useState(false);
    const [showBundleSearch, setShowBundleSearch] = useState(false);
    const [showCustomSearch, setShowCustomSearch] = useState(false);
    const [showSequenceSearch, setShowSequenceSearch] = useState(false);
    const [elementSearchQuery, setElementSearchQuery] = useState('');
    const [bundleSearchQuery, setBundleSearchQuery] = useState('');
    const [customSearchQuery, setCustomSearchQuery] = useState('');
    const [sequenceSearchQuery, setSequenceSearchQuery] = useState('');
    const [elementSearchResults, setElementSearchResults] = useState<Element[]>([]);
    const [bundleSearchResults, setBundleSearchResults] = useState<BundleListResponse[]>([]);
    const [customSearchResults, setCustomSearchResults] = useState<CustomListResponse[]>([]);
    const [sequenceSearchResults, setSequenceSearchResults] = useState<SequenceListResponse[]>([]);

    // 시술 검색 함수들
    const handleElementSearch = async (query: string) => {
        if (!query.trim()) {
            setElementSearchResults([]);
            return;
        }
        
        try {
            const elements = await getElementsList();
            const filtered = searchElementsByName(elements, query);
            setElementSearchResults(filtered.slice(0, 10)); // 최대 10개만 표시
        } catch (error) {
            console.error('Element 검색 실패:', error);
            setElementSearchResults([]);
        }
    };

    const handleBundleSearch = async (query: string) => {
        if (!query.trim()) {
            setBundleSearchResults([]);
            return;
        }
        
        try {
            const bundles = await getBundlesList();
            const filtered = bundles.filter(bundle => 
                bundle.name?.toLowerCase().includes(query.toLowerCase())
            );
            setBundleSearchResults(filtered.slice(0, 10));
        } catch (error) {
            console.error('Bundle 검색 실패:', error);
            setBundleSearchResults([]);
        }
    };

    const handleCustomSearch = async (query: string) => {
        if (!query.trim()) {
            setCustomSearchResults([]);
            return;
        }
        
        try {
            const customs = await getCustomsList();
            const filtered = customs.filter(custom => 
                custom.name?.toLowerCase().includes(query.toLowerCase())
            );
            setCustomSearchResults(filtered.slice(0, 10));
        } catch (error) {
            console.error('Custom 검색 실패:', error);
            setCustomSearchResults([]);
        }
    };

    const handleSequenceSearch = async (query: string) => {
        if (!query.trim()) {
            setSequenceSearchResults([]);
            return;
        }
        
        try {
            const sequences = await getSequencesList();
            const filtered = searchSequencesByName(sequences, query);
            setSequenceSearchResults(filtered.slice(0, 10));
        } catch (error) {
            console.error('Sequence 검색 실패:', error);
            setSequenceSearchResults([]);
        }
    };

    // 디바운스된 검색 함수들
    const debouncedElementSearch = useCallback(
        debounce((query: string) => {
            handleElementSearch(query);
        }, 200),
        []
    );

    const debouncedBundleSearch = useCallback(
        debounce((query: string) => {
            handleBundleSearch(query);
        }, 200),
        []
    );

    const debouncedCustomSearch = useCallback(
        debounce((query: string) => {
            handleCustomSearch(query);
        }, 200),
        []
    );

    const debouncedSequenceSearch = useCallback(
        debounce((query: string) => {
            handleSequenceSearch(query);
        }, 200),
        []
    );

    // 외부 클릭 시 검색 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.search-dropdown')) {
                setShowElementSearch(false);
                setShowBundleSearch(false);
                setShowCustomSearch(false);
                setShowSequenceSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProcedureClick = async (type: 'element' | 'bundle' | 'custom' | 'sequence', id: number, name: string) => {
        onProcedureSelect(type, id, name);
        
        // 검색 쿼리 업데이트
        if (type === 'element') {
            setElementSearchQuery(name);
            setShowElementSearch(false);
        } else if (type === 'bundle') {
            setBundleSearchQuery(name);
            setShowBundleSearch(false);
        } else if (type === 'custom') {
            setCustomSearchQuery(name);
            setShowCustomSearch(false);
        } else if (type === 'sequence') {
            setSequenceSearchQuery(name);
            setShowSequenceSearch(false);
        }
        
        // 시술 정보 가져오기
        await onProcedureInfoFetch(type, id);
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">교체할 시술 탐색</h4>
                <button
                    onClick={onClearSelection}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                >
                    선택 해제
                </button>
            </div>
            
            <div className="space-y-4">
                {/* Element 검색 (단일시술) */}
                {packageType === '단일시술' && (
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">새로운 Element 검색</label>
                        <div className="relative">
                            <Input
                                value={elementSearchQuery}
                                onChange={(e) => {
                                    setElementSearchQuery(e.target.value);
                                    debouncedElementSearch(e.target.value);
                                }}
                                onFocus={() => setShowElementSearch(true)}
                                placeholder="교체할 Element를 검색하세요..."
                                className="text-sm placeholder:text-gray-500 focus:ring-0 border-gray-300 bg-white text-gray-900"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            
                            {showElementSearch && (
                                <div className="search-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {elementSearchResults.length > 0 ? (
                                        elementSearchResults.map((element) => (
                                            <div
                                                key={element.id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                onClick={() => handleProcedureClick('element', element.id, element.name || '')}
                                            >
                                                <div className="font-medium">{element.name}</div>
                                                <div className="text-xs text-gray-500">ID: {element.id}</div>
                                            </div>
                                        ))
                                    ) : elementSearchQuery ? (
                                        <div className="px-3 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        {selectedProcedureName && (
                            <div className="mt-2 text-xs text-red-500">
                                선택됨: {selectedProcedureName}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Bundle 검색 (번들) */}
                {packageType === '번들' && (
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">새로운 Bundle 검색</label>
                        <div className="relative">
                            <Input
                                value={bundleSearchQuery}
                                onChange={(e) => {
                                    setBundleSearchQuery(e.target.value);
                                    debouncedBundleSearch(e.target.value);
                                }}
                                onFocus={() => setShowBundleSearch(true)}
                                placeholder="교체할 Bundle을 검색하세요..."
                                className="text-sm placeholder:text-gray-500 focus:ring-0 border-gray-300 bg-white text-gray-900"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            
                            {showBundleSearch && (
                                <div className="search-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {bundleSearchResults.length > 0 ? (
                                        bundleSearchResults.map((bundle) => (
                                            <div
                                                key={bundle.group_id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                onClick={() => handleProcedureClick('bundle', bundle.group_id, bundle.name || '')}
                                            >
                                                <div className="font-medium">{bundle.name}</div>
                                                <div className="text-xs text-gray-500">ID: {bundle.group_id}</div>
                                            </div>
                                        ))
                                    ) : bundleSearchQuery ? (
                                        <div className="px-3 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        {selectedProcedureName && (
                            <div className="mt-2 text-xs text-red-500">
                                선택됨: {selectedProcedureName}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Custom 검색 (커스텀) */}
                {packageType === '커스텀' && (
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">새로운 Custom 검색</label>
                        <div className="relative">
                            <Input
                                value={customSearchQuery}
                                onChange={(e) => {
                                    setCustomSearchQuery(e.target.value);
                                    debouncedCustomSearch(e.target.value);
                                }}
                                onFocus={() => setShowCustomSearch(true)}
                                placeholder="교체할 Custom을 검색하세요..."
                                className="text-sm placeholder:text-gray-500 focus:ring-0 border-gray-300 bg-white text-gray-900"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            
                            {showCustomSearch && (
                                <div className="search-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {customSearchResults.length > 0 ? (
                                        customSearchResults.map((custom) => (
                                            <div
                                                key={custom.group_id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                onClick={() => handleProcedureClick('custom', custom.group_id, custom.name || '')}
                                            >
                                                <div className="font-medium">{custom.name}</div>
                                                <div className="text-xs text-gray-500">ID: {custom.group_id}</div>
                                            </div>
                                        ))
                                    ) : customSearchQuery ? (
                                        <div className="px-3 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        {selectedProcedureName && (
                            <div className="mt-2 text-xs text-red-500">
                                선택됨: {selectedProcedureName}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Sequence 검색 (시퀀스) */}
                {packageType === '시퀀스' && (
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">새로운 Sequence 검색</label>
                        <div className="relative">
                            <Input
                                value={sequenceSearchQuery}
                                onChange={(e) => {
                                    setSequenceSearchQuery(e.target.value);
                                    debouncedSequenceSearch(e.target.value);
                                }}
                                onFocus={() => setShowSequenceSearch(true)}
                                placeholder="교체할 Sequence를 검색하세요..."
                                className="text-sm placeholder:text-gray-500 focus:ring-0 border-gray-300 bg-white text-gray-900"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            
                            {showSequenceSearch && (
                                <div className="search-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {sequenceSearchResults.length > 0 ? (
                                        sequenceSearchResults.map((sequence) => (
                                            <div
                                                key={sequence.group_id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                onClick={() => handleProcedureClick('sequence', sequence.group_id, sequence.sequence_name || '')}
                                            >
                                                <div className="font-medium">{sequence.sequence_name}</div>
                                                <div className="text-xs text-gray-500">ID: {sequence.group_id}</div>
                                            </div>
                                        ))
                                    ) : sequenceSearchQuery ? (
                                        <div className="px-3 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        {selectedProcedureName && (
                            <div className="mt-2 text-xs text-red-500">
                                선택됨: {selectedProcedureName}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
