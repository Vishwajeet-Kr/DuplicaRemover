import React, { useState, useRef, useCallback } from 'react';
import { Search, FolderOpen, Upload, Share2, Copy, Check, X, Clock, ChevronDown } from 'lucide-react';
import { scanService } from '../services/api';

interface ScanFormProps {
  onScan: (directory: string) => void;
  isLoading: boolean;
}

const ScanForm: React.FC<ScanFormProps> = ({ onScan, isLoading }) => {
  const [directory, setDirectory] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [recentDirectories, setRecentDirectories] = useState<string[]>([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (directory.trim()) {
      onScan(directory.trim());
    }
  };

  // Validate directory with debouncing
  const validateDirectory = useCallback(async (path: string) => {
    if (!path.trim()) {
      setValidationMessage('');
      return;
    }

    setIsValidating(true);
    try {
      const result = await scanService.validateDirectory(path);
      setValidationMessage(result.message);
    } catch (error) {
      setValidationMessage('Error validating directory');
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleDirectoryChange = (value: string) => {
    setDirectory(value);
    
    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Set new timeout for validation
    validationTimeoutRef.current = setTimeout(() => {
      validateDirectory(value);
    }, 500); // 500ms debounce
  };

  // Load recent directories
  const loadRecentDirectories = useCallback(async () => {
    try {
      const result = await scanService.getRecentDirectories();
      setRecentDirectories(result.directories);
    } catch (error) {
      console.error('Failed to load recent directories:', error);
    }
  }, []);

  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }, [isDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragOver to false if we're leaving the main drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // For file system access, we can only get the file path in some browsers
      // In most browsers, we'll need to work with the File object
      const file = files[0];
      
      // Try to get the full path (this works in some browsers/contexts)
      const fullPath = (file as any).path || file.webkitRelativePath || file.name;
      
      if (fullPath) {
        // Extract directory path from file path
        const pathParts = fullPath.split(/[/\\]/);
        pathParts.pop(); // Remove filename
        const dirPath = pathParts.join('/') || '/';
        handleDirectoryChange(dirPath);
      } else {
        // Fallback: show a message that manual input is needed
        alert('Please manually enter the directory path. Drag and drop file path detection is limited in web browsers for security reasons.');
      }
    }

    // Handle directory drop (when supported)
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry?.();
          if (entry?.isDirectory) {
            handleDirectoryChange(entry.fullPath);
            break;
          }
        }
      }
    }
  }, []);

  // Handle folder selection via file input
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fullPath = (file as any).path || file.webkitRelativePath;
      
      if (fullPath) {
        const pathParts = fullPath.split(/[/\\]/);
        pathParts.pop(); // Remove filename
        const dirPath = pathParts.join('/') || '/';
        handleDirectoryChange(dirPath);
      }
    }
  };

  // Select recent directory
  const selectRecentDirectory = (path: string) => {
    handleDirectoryChange(path);
    setShowRecentDropdown(false);
  };

  // Generate shareable URL
  const generateShareUrl = () => {
    if (!directory.trim()) {
      alert('Please enter a directory path first');
      return;
    }

    const encodedPath = encodeURIComponent(directory);
    const baseUrl = window.location.origin + window.location.pathname;
    const shareableUrl = `${baseUrl}?path=${encodedPath}`;
    setShareUrl(shareableUrl);
    setShowShareModal(true);

    // Also update the current URL without navigation
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('path', directory);
    window.history.replaceState({}, '', newUrl.toString());
  };

  // Copy share URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Load path from URL on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathParam = urlParams.get('path');
    if (pathParam) {
      handleDirectoryChange(decodeURIComponent(pathParam));
    }
    loadRecentDirectories();
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Start Directory Scan</h2>
            <p className="text-gray-600">Enter path, drag & drop, or share directory locations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Recent Directories Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRecentDropdown(!showRecentDropdown);
                if (!showRecentDropdown) {
                  loadRecentDirectories();
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Recent directories"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Recent</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showRecentDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-3 border-b">
                  <h4 className="font-medium text-gray-900">Recent Directories</h4>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {recentDirectories.length > 0 ? (
                    recentDirectories.map((path, index) => (
                      <button
                        key={index}
                        onClick={() => selectRecentDirectory(path)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">{path}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent directories</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={generateShareUrl}
            disabled={!directory.trim() || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Share this directory path"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="directory" className="block text-sm font-medium text-gray-700 mb-2">
            Directory Path
          </label>
          
          {/* Drag and Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="directory"
                value={directory}
                onChange={(e) => handleDirectoryChange(e.target.value)}
                placeholder="/path/to/directory or C:\Program Files"
                className="w-full pl-10 pr-20 py-3 border-0 bg-transparent focus:ring-0 focus:outline-none"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                title="Browse for folder"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            
            {/* Drag overlay */}
            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-700">Drop folder here</p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input for folder selection */}
          <input
            ref={fileInputRef}
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={handleFolderSelect}
          />

          {/* Validation Message */}
          {(validationMessage || isValidating) && (
            <div className={`mt-2 text-sm flex items-center space-x-2 ${
              validationMessage.includes('valid and accessible') 
                ? 'text-green-600' 
                : validationMessage.includes('Error') || validationMessage.includes('not') 
                  ? 'text-red-600' 
                  : 'text-blue-600'
            }`}>
              {isValidating ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Validating directory...</span>
                </>
              ) : (
                <>
                  {validationMessage.includes('valid and accessible') ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span>{validationMessage}</span>
                </>
              )}
            </div>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Enter path manually, drag & drop a folder, or click the upload icon to browse
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !directory.trim() || (validationMessage && !validationMessage.includes('valid and accessible'))}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Start Scan</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Enhanced Features:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Drag & Drop:</strong> Drag folders directly into the input area</li>
          <li>• <strong>Browse:</strong> Click the upload icon to select folders</li>
          <li>• <strong>Share:</strong> Generate shareable URLs for directory paths</li>
          <li>• <strong>Recent:</strong> Quick access to recently scanned directories</li>
          <li>• <strong>Validation:</strong> Real-time directory path validation</li>
        </ul>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Directory Path</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Share this URL to let others scan the same directory:
            </p>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  copySuccess
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            {copySuccess && (
              <p className="text-sm text-green-600 mb-4">
                ✓ URL copied to clipboard!
              </p>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showRecentDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowRecentDropdown(false)}
        />
      )}
    </div>
  );
};

export default ScanForm;