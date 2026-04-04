import { useRef, useState } from 'react';
import { Share2, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareVerdictProps {
  targetRef: React.RefObject<HTMLDivElement>;
  title?: string;
}

export default function ShareVerdict({ targetRef, title = 'My NestDecide Analysis' }: ShareVerdictProps) {
  const [loading, setLoading] = useState(false);

  const capture = async (): Promise<Blob | null> => {
    if (!targetRef.current) return null;
    setLoading(true);
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#1a1625',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'));
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const blob = await capture();
    if (!blob) return;

    const file = new File([blob], 'nestdecide-result.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, files: [file] });
    } else {
      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nestdecide-result.png';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/60 hover:bg-accent text-sm font-medium text-foreground transition-colors disabled:opacity-50 mx-auto"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : navigator.share ? (
        <Share2 className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {loading ? 'Generating...' : 'Share Result'}
    </button>
  );
}
