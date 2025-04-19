import { PrismaClient } from '@/generated/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const prisma = new PrismaClient();

// Define the expected Promise type for params in Next 15+
// Note: Using 'any' for the resolved value based on the error message, adjust if needed
type ParamsPromise = Promise<{ id: string }>;

// Rename interface to avoid potential global conflicts
interface DreamIdPageProps {
  params: ParamsPromise;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// This is a Server Component by default in the App Router
export default async function DreamPage({ params }: DreamIdPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    notFound();
  }

  const dream = await prisma.dream.findUnique({
    where: { id: id },
    include: { analysis: true },
  });

  if (!dream) {
    notFound();
  }

  const renderTags = (tagsString: string | null) => {
    if (!tagsString) return <span className="text-sm text-muted-foreground">No tags.</span>;
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
      <Badge key={tag} variant="secondary" className="mr-1 mb-1">{tag}</Badge>
    ));
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-3xl mx-auto overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">Dream Details</CardTitle>
          <CardDescription>Recorded on: {new Date(dream!.createdAt).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Description:</h3>
            <div className="p-3 border rounded-md max-h-[250px] overflow-y-auto bg-muted/30">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{dream!.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold">Mood:</h3>
              <p>{dream!.mood} / 5</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold mb-1">Tags:</h3>
              <div className="flex flex-wrap">
                {renderTags(dream!.tags)}
              </div>
            </div>
          </div>

          {dream!.analysis && (
            <div className="border-t pt-6 space-y-3">
              <h3 className="text-xl font-semibold">Analysis:</h3>
              <div className="p-3 border rounded-md max-h-[400px] overflow-y-auto bg-muted/30">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => <h1 className="text-xl font-bold my-3" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-lg font-semibold my-2" {...props} />,
                    p: ({ ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                    li: ({ ...props }) => <li className="ml-4" {...props} />,
                    a: ({ ...props }) => <a className="text-blue-600 hover:underline dark:text-blue-400" {...props} />,
                  }}
                >
                  {dream!.analysis.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {!dream!.analysis && (
             <div className="border-t pt-6">
              <p className="text-muted-foreground">Analysis is not yet available for this dream.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Optional: Improve metadata for the page
// Keep generateMetadata as is for now, its props might be handled differently
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const dream = await prisma.dream.findUnique({ where: { id } });

  return {
    title: dream ? `Dream Analysis: ${new Date(dream.createdAt).toLocaleDateString()}` : 'Dream Analysis',
    description: dream ? `Analysis for dream recorded on ${new Date(dream.createdAt).toLocaleDateString()}` : 'Dream analysis details',
  };
} 
