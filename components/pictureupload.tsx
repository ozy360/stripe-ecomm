import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadSimpleIcon, X } from '@phosphor-icons/react';

interface FileWithPreview {
  file?: File;
  preview: string;
  isExisting?: boolean; // Flag to differentiate existing URLs from new uploads
}

interface PictureUploadProps {
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  defaultValue?: string[];
  name?: string; // Name attribute for form field
}

export function PictureUpload({
  onUpload,
  maxFiles = 5,
  accept = { 'image/*': [] },
  defaultValue = [],
  name = 'images', // Default field name
}: PictureUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>(() =>
    defaultValue.map((url) => ({ preview: url, isExisting: true })),
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithPreview[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isExisting: false,
      }));

      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));

      if (onUpload) {
        onUpload(acceptedFiles);
      }
    },
    [maxFiles, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      // Only revoke object URL for newly uploaded files
      if (!newFiles[index].isExisting) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Get all file objects for form submission
  const getFiles = () => {
    return files.filter((f) => f.file).map((f) => f.file!);
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden inputs for files - these will be included in FormData */}
      {files.map((fileObj, index) => {
        if (fileObj.file) {
          // This is a DataTransfer hack to attach File objects to hidden inputs
          // However, React doesn't support this directly, so we'll handle it differently
          return null;
        }
        return null;
      })}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`bg-secondary border-input cursor-pointer rounded-lg border p-8 text-center transition-colors duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${files.length >= maxFiles ? 'cursor-not-allowed opacity-50' : ''} `}
      >
        <input {...getInputProps()} name={name} />
        <UploadSimpleIcon
          className="text-muted-foreground mx-auto mb-4 size-10"
          weight="duotone"
        />
        {isDragActive ? (
          <p className="text-muted-foreground text-lg">
            Drop the images here...
          </p>
        ) : (
          <div>
            <p className="text-muted-foreground mb-2 text-lg">
              Drag & drop images here, or click to select
            </p>
            <p className="text-muted-foreground text-sm">
              {files.length >= maxFiles
                ? `Maximum ${maxFiles} files reached`
                : `Upload up to ${maxFiles} images`}
            </p>
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {files.map((fileObj, index) => (
            <div key={index} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100">
                <img
                  src={fileObj.preview}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 !h-fit rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600"
              >
                <X className="size-3" weight="bold" />
              </button>
              {/* File name */}
              <p className="mt-2 truncate text-sm text-gray-600">
                {fileObj.file?.name ||
                  (fileObj.isExisting ? 'Existing Image' : 'Image')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
