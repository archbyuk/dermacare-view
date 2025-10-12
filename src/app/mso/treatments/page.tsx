import { ProductList } from '@/components/tabs/product-list';
import { ExcelUpload } from '@/components/tabs/excel-upload';
import { ProductSearch } from '@/components/tabs/product-search';
import IPhoneFrame from '@/app/mso/_components/ui/iphone-frame';

export default function TreatmentsPage() {
    
    return (
        <div className="h-full flex items-center gap-6">
            {/* iPhone 프레임으로 감싼 시술목록 컴포넌트 */}
            <IPhoneFrame>
                <ProductList />
            </IPhoneFrame>

            {/* iPhone 프레임으로 감싼 검색 컴포넌트 */}
            <IPhoneFrame>
                <ProductSearch/>
            </IPhoneFrame>
            
            {/* iPhone 프레임으로 감싼 파일 업로드 컴포넌트 */}
            <IPhoneFrame>
                <ExcelUpload />
            </IPhoneFrame>
        </div>
    );
}