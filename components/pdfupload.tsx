'use client';
import { LoadPdfEmbedingsFromBuffer } from '@/embedings';
import { toastSuccess } from '@/lib/toast';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText, LoaderCircle, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

export default function PdfUploader({ mode, targetModelId }: { mode: 'bot' | 'notebook', targetModelId?: string }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [isPending, setIsPending] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const client = useQueryClient();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setUploadStatus('');
            setIsDone(false);
        }
    };

    const clearFile = (e: React.MouseEvent) => {
        e.preventDefault();
        setSelectedFile(null);
        setUploadStatus('');
        setIsDone(false);
    };

    const handleProcess = async () => {
        if (!selectedFile) {
            setUploadStatus('Please select a PDF file first.');
            return;
        }

        setIsPending(true);
        setIsDone(false);
        setUploadStatus('Reading file…');

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');

            setUploadStatus('Generating embeddings…');

            const res = await LoadPdfEmbedingsFromBuffer(base64, selectedFile.name, mode, targetModelId);

            if (res) {
                setIsDone(true);
                setUploadStatus('Collection created successfully!');
                toastSuccess('PDF added to knowledge base!');
                client.invalidateQueries({ queryKey: ['modelsinfo'] });
                setTimeout(() => {
                    setSelectedFile(null);
                    setUploadStatus('');
                    setIsDone(false);
                }, 3000);
            } else {
                setUploadStatus('Failed to generate embeddings.');
            }
        } catch (error) {
            setUploadStatus('An error occurred while processing the PDF.');
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className='card my-6 p-4 py-5 rounded-3xl flex flex-col'>
            <h2 className="text-2xl text-gray-700 font-bold mb-4">Upload PDF file</h2>

            {isPending && (
                <div className="w-full rounded-3xl text-blue-500 card h-[70px] flex items-center justify-center mb-4 gap-2">
                    <LoaderCircle className="animate-spin" />
                    <p className="text-lg font-medium">{uploadStatus}</p>
                </div>
            )}

            {isDone && !isPending && (
                <div className="w-full rounded-3xl text-green-600 bg-green-50 h-[70px] flex items-center justify-center mb-4 gap-2">
                    <CheckCircle2 size={20} />
                    <p className="text-lg font-medium">{uploadStatus}</p>
                </div>
            )}

            <label className={`relative h-[200px] rounded-3xl border-dashed border flex-col gap-3 cursor-pointer transition-colors ${selectedFile ? 'border-blue-400 bg-blue-50/40' : 'border-gray-400 hover:border-blue-400'} center`}>
                <input
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isPending}
                />
                {!selectedFile ? (
                    <>
                        <Upload className="mx-auto text-gray-400" size={48} />
                        <p className="text-gray-400">Click to select a PDF file</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 px-4 text-center">
                        <FileText size={36} className="text-blue-500" />
                        <p className="text-lg font-medium textbg truncate max-w-[260px]">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                )}
            </label>

            {selectedFile && !isPending && (
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleProcess}
                        className="flex-1 buttonbg px-4 py-2 rounded text-white disabled:opacity-45"
                    >
                        Process PDF
                    </button>
                    <button
                        onClick={clearFile}
                        className="px-3 py-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                        aria-label="Remove selected file"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {!isPending && !isDone && uploadStatus && (
                <p className="mt-2 text-red-500 text-sm">{uploadStatus}</p>
            )}
        </div>
    );
}