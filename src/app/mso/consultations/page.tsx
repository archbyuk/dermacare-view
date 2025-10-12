'use client'

import { useState, useRef } from 'react';
import ConsultationList, { ConsultationListRef } from '@/components/consultations/consultation-list';
import ConsultationCreateModal, { ConsultationFormData } from '@/components/consultations/consultation-create-modal';

export default function ConsultationsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const consultationListRef = useRef<ConsultationListRef>(null);

    const handleCreateConsultation = async (data: ConsultationFormData) => {
        console.log('새 상담 등록:', data);
        // TODO: API 호출로 상담 등록
        alert('상담이 등록되었습니다!');
        
        // 상담 목록 새로고침
        if (consultationListRef.current) {
            await consultationListRef.current.refresh();
        }
    };

    return (
        <div className="p-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">상담 관리</h1>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    새 상담 등록
                </button>
            </div>
            
            {/* 상담 목록 */}
            <ConsultationList ref={consultationListRef} />
            
            {/* 새 상담 등록 모달 */}
            <ConsultationCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateConsultation}
            />
        </div>
    );
}