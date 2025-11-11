import React, { useCallback, useState } from 'react';

interface UseDropzoneOptions {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number;
  onDrop: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
}

interface FileRejection {
  file: File;
  errors: Array<{ code: string; message: string }>;
}

interface DropzoneState {
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  isDragActive: boolean;
}

export const useDropzone = (options: UseDropzoneOptions): DropzoneState => {
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFile = (file: File): Array<{ code: string; message: string }> => {
    const errors: Array<{ code: string; message: string }> = [];

    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      errors.push({ code: 'file-too-large', message: 'File is too large' });
    }

    // Check file type
    if (options.accept) {
      const acceptedTypes = Object.values(options.accept).flat();
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        errors.push({ code: 'file-invalid-type', message: 'File type not accepted' });
      }
    }

    return errors;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const acceptedFiles: File[] = [];
    const rejectedFiles: FileRejection[] = [];

    Array.from(files).forEach(file => {
      const errors = validateFile(file);
      if (errors.length > 0) {
        rejectedFiles.push({ file, errors });
      } else {
        acceptedFiles.push(file);
      }
    });

    options.onDrop(acceptedFiles, rejectedFiles);
  };

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [options]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [options]);

  const getRootProps = () => ({
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  });

  const getInputProps = () => ({
    type: 'file' as const,
    multiple: options.multiple || false,
    accept: options.accept ? Object.keys(options.accept).join(',') : undefined,
    onChange,
    style: { display: 'none' },
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive,
  };
};