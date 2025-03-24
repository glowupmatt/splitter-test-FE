/* eslint-disable @typescript-eslint/no-unused-vars */
interface SeparationResponse {
  message: string;
  downloads: {
    [key: string]: string;  // stem name -> download URL
  };
  processing_time: number;
  separation_time: number;
}

interface ErrorResponse {
  error: string;
}

export const separateAudio = async (
  file: File, 
  mode: '2' | '4' = '2'
): Promise<SeparationResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);

  try {
    const response = await fetch(`http://localhost:8000/separate`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      // Try to parse error response, fallback to status text if not possible
      try {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error);
      } catch (e) {
        throw new Error(`Separation failed: ${response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to separate audio');
  }
};

export const downloadStem = async (url: string): Promise<Blob> => {
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Accept': 'audio/*'  // Add proper Accept header for audio files
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download stem: ${response.statusText}`);
  }
  return await response.blob();
};

export const cleanupFiles = async (): Promise<void> => {
  const response = await fetch('http://localhost:8000/cleanup', {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    try {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error);
    } catch (e) {
      throw new Error(`Cleanup failed: ${response.statusText}`);
    }
  }
};