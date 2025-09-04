'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ProcedureAccordionProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    value: string;
}

export default function ProcedureAccordion({ title, subtitle, children, value }: ProcedureAccordionProps) {
    return (
        <Accordion type="single" collapsible className="bg-gray-50 rounded-lg border border-gray-200">
            <AccordionItem value={value} className="border-none">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-100 transition-colors [&[data-state=open]]:bg-gray-100">
                    <div className="flex items-center space-x-3">
                        <h5 className="text-sm font-medium text-gray-900">{title}</h5>
                        {subtitle && (
                            <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 border-t border-gray-200 bg-white">
                    <div className="pt-4">
                        {children}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}