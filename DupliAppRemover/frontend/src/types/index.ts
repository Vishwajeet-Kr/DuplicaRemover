export interface FileInfo {
  filePath: string;
  fileName: string;
  hash: string;
  size: number;
  extension: string;
  category: string;
  lastModified: string;
  duplicate: boolean;
}

export interface ScanResult {
  scanId: string;
  directory: string;
  scanTime: string;
  files: FileInfo[];
  duplicateGroups: Record<string, FileInfo[]>;
  categorizedFiles: Record<string, FileInfo[]>;
  totalFiles: number;
  duplicateCount: number;
  status: string;
}

export interface ScanResponse {
  scanId: string;
  status: string;
}

// Extend HTML input element to include webkitdirectory
declare global {
  namespace React {
    interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      webkitdirectory?: string;
      directory?: string;
    }
  }
}

// Extend File interface for enhanced path detection
declare global {
  interface File {
    path?: string;
    webkitRelativePath?: string;
  }
  
  interface DataTransferItem {
    webkitGetAsEntry?(): FileSystemEntry | null;
  }
  
  interface FileSystemEntry {
    isDirectory: boolean;
    isFile: boolean;
    name: string;
    fullPath: string;
  }
}