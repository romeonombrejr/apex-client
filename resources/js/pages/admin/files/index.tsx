import { Head, router } from '@inertiajs/react';
import {
    Download,
    File as FileIcon,
    Folder,
    Plus,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    destroy as destroyFile,
    download,
    index,
    upload,
} from '@/routes/admin/files';
import {
    destroy as destroyFolder,
    store as storeFolder,
} from '@/routes/admin/files/folders';
import type { MediaFileRow, MediaFolderRow } from '@/types';

type PageProps = {
    currentFolder: { id: number; name: string } | null;
    breadcrumbs: { id: number; name: string }[];
    folders: MediaFolderRow[];
    files: MediaFileRow[];
};

export default function FilesIndex({
    currentFolder,
    breadcrumbs,
    folders,
    files,
}: PageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function goToFolder(folderId: number | null) {
        router.get(
            index(folderId ? { query: { folder: folderId } } : undefined).url,
        );
    }

    function handleCreateFolder() {
        const name = prompt('Folder name');

        if (!name) {
            return;
        }

        router.post(storeFolder().url, {
            name,
            parent_id: currentFolder?.id ?? null,
        });
    }

    function handleUploadClick() {
        fileInputRef.current?.click();
    }

    function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files;

        if (!selected || selected.length === 0) {
            return;
        }

        const formData = new FormData();
        Array.from(selected).forEach((file) =>
            formData.append('files[]', file),
        );

        if (currentFolder) {
            formData.append('folder_id', String(currentFolder.id));
        }

        router.post(upload().url, formData, { forceFormData: true });
        event.target.value = '';
    }

    function handleDeleteFolder(folderId: number, name: string) {
        if (
            !confirm(
                `Delete folder "${name}" and everything inside it? This cannot be undone.`,
            )
        ) {
            return;
        }

        router.delete(destroyFolder({ mediaFolder: folderId }).url);
    }

    function handleDeleteFile(fileId: number, name: string) {
        if (!confirm(`Delete file "${name}"? This cannot be undone.`)) {
            return;
        }

        router.delete(destroyFile({ mediaFile: fileId }).url);
    }

    return (
        <>
            <Head title="Files" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Files</h2>
                    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                        <button
                            onClick={() => goToFolder(null)}
                            className="underline-offset-2 hover:text-foreground hover:underline"
                        >
                            Root
                        </button>
                        {breadcrumbs.map((crumb) => (
                            <span
                                key={crumb.id}
                                className="flex items-center gap-1"
                            >
                                <span>/</span>
                                <button
                                    onClick={() => goToFolder(crumb.id)}
                                    className="underline-offset-2 hover:text-foreground hover:underline"
                                >
                                    {crumb.name}
                                </button>
                            </span>
                        ))}
                    </nav>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateFolder}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New folder
                    </Button>
                    <Button size="sm" onClick={handleUploadClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFilesSelected}
                    />
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-24" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {folders.length === 0 && files.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-center text-muted-foreground"
                            >
                                This folder is empty.
                            </TableCell>
                        </TableRow>
                    )}
                    {folders.map((folder) => (
                        <TableRow key={`folder-${folder.id}`}>
                            <TableCell className="font-medium">
                                <button
                                    onClick={() => goToFolder(folder.id)}
                                    className="flex items-center gap-2 hover:underline"
                                >
                                    <Folder className="h-4 w-4" />
                                    {folder.name}
                                </button>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                —
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                —
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        handleDeleteFolder(
                                            folder.id,
                                            folder.name,
                                        )
                                    }
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">
                                        Delete {folder.name}
                                    </span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {files.map((file) => (
                        <TableRow key={`file-${file.id}`}>
                            <TableCell className="font-medium">
                                <span className="flex items-center gap-2">
                                    <FileIcon className="h-4 w-4" />
                                    {file.name}
                                </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {file.size}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(file.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <a
                                        href={
                                            download({ mediaFile: file.id }).url
                                        }
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">
                                            Download {file.name}
                                        </span>
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        handleDeleteFile(file.id, file.name)
                                    }
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">
                                        Delete {file.name}
                                    </span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
