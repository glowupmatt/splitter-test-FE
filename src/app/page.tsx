"use client"
import { useState } from 'react';
import { separateAudio, downloadStem } from '../../apiFunctions';

export default function Home () {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await separateAudio(file, '4');
      console.log(result, "RESULT")
      setDownloadLinks(result.downloads);
    } catch (error) {
      console.error('Separation failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to separate audio');
    } finally {
      setIsLoading(false);
      console.log(downloadLinks)
    }
  };

  const handleDownload = async (stem: string, url: string) => {
    event?.preventDefault();
    setDownloading(stem);
    try {
      const blob = await downloadStem(url);
      // Create and click a temporary download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${stem}.wav`; // or appropriate extension
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Failed to download ${stem}:`, error);
      alert(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  };


  return (
    <div>
      <input 
        type="file" 
        accept="audio/*"
        onChange={handleFileUpload}
        disabled={isLoading}
      />
      {isLoading && <p>Processing...</p>}
      {Object.entries(downloadLinks).map(([stem, url]) => (
        <button
          key={stem}
          onClick={() => handleDownload(stem, url)}
          disabled={downloading === stem}
        >
          {downloading === stem ? 'Downloading...' : `Download ${stem}`}
        </button>
      ))}
    </div>
  );
};