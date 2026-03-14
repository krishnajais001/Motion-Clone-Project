import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageStore } from '@/stores/usePageStore';

export default function HomePage() {
    const navigate = useNavigate();
    const { addPage } = usePageStore();

    const handleCreatePage = useCallback(async () => {
        const newPage = await addPage(null);
        if (newPage) {
            navigate(`/app/page/${newPage.id}`);
        }
    }, [addPage, navigate]);

    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
            {/* Illustration */}
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
            </div>

            {/* Text */}
            <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Welcome to Motion
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create a page to get started with your workspace.
                </p>
            </div>

            {/* CTA */}
            <Button onClick={handleCreatePage} className="gap-2">
                <Plus className="h-4 w-4" />
                Create your first page
            </Button>
        </div>
    );
}
