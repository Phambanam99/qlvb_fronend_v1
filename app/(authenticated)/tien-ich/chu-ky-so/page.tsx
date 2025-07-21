"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenSquare, FileSignature, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
// Import the entire api object now
import { signatureApi } from "@/lib/api/signature";
import { SignatureDTO } from "@/lib/types/signature";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableSignature } from '@/components/digital-signature/DraggableSignature';
import { PdfViewer } from '@/components/digital-signature/PdfViewer';
import { DndWrapper } from '@/components/digital-signature/DndWrapper';
import { PDFDocument, rgb, degrees } from 'pdf-lib';


interface PlacedSignature {
  id: number; // The original ID of the signature type
  instanceId: number; // A unique ID for this specific placed instance
  src: string;
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
}

const SignatureManagement = () => {
    const { toast } = useToast();
    const [signatures, setSignatures] = useState<SignatureDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [signatureToDelete, setSignatureToDelete] = useState<SignatureDTO | null>(null);

    useEffect(() => {
        fetchSignatures();
    }, []);

    const fetchSignatures = async () => {
        try {
            setIsLoading(true);
            const userSignatures = await signatureApi.getSignatures();
            setSignatures(userSignatures);
        } catch (error: any) {
            toast({ title: "Lỗi", description: "Không thể lấy danh sách chữ ký.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleCreateSignature = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !password) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng chọn file ảnh và nhập mật khẩu.", variant: "destructive" });
            return;
        }
        setIsCreating(true);
        try {
            await signatureApi.createSignature(selectedFile!, password);
            toast({ title: "Thành công", description: "Chữ ký đã được tạo." });
            setPassword("");
            setSelectedFile(null);
            // Reset file input
            const fileInput = document.getElementById('signature-file') as HTMLInputElement;
            if(fileInput) fileInput.value = "";
            
            fetchSignatures(); // Refresh list
        } catch (error: any) {
            toast({ title: "Lỗi", description: error?.message || "Tạo chữ ký thất bại.", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteSignature = async () => {
        if (!signatureToDelete || !deletePassword) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng nhập mật khẩu để xóa.", variant: "destructive" });
            return;
        }
        try {
            await signatureApi.deleteSignature(signatureToDelete!.id, deletePassword);
            toast({ title: "Thành công", description: "Chữ ký đã được xóa." });
            setSignatureToDelete(null);
            setDeletePassword("");
            fetchSignatures(); // Refresh list
        } catch (error: any) {
            toast({ title: "Lỗi", description: error?.message || "Xóa chữ ký thất bại.", variant: "destructive" });
        }
    };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý chữ ký số</CardTitle>
        <CardDescription>Thêm, xem, hoặc xóa chữ ký số của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="font-medium mb-4">Chữ ký của bạn</h3>
            {isLoading ? (
                <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : signatures.length > 0 ? (
                <ul className="space-y-3">
                    {signatures.map((sig) => (
                        <li key={sig.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-mono text-sm">{sig.fileName}</span>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" onClick={() => setSignatureToDelete(sig)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa chữ ký?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Để xóa chữ ký này, vui lòng nhập mật khẩu của nó. Hành động này không thể được hoàn tác.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-4">
                                        <Label htmlFor="delete-password">Mật khẩu chữ ký</Label>
                                        <Input 
                                            id="delete-password" 
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="••••••••" 
                                        />
                                    </div>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeletePassword('')}>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteSignature}>Xóa</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Bạn chưa có chữ ký nào.</p>
            )}
        </div>
        <form onSubmit={handleCreateSignature} className="space-y-4 border-t pt-6">
            <h3 className="font-medium">Tạo chữ ký mới</h3>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="signature-file">Ảnh chữ ký</Label>
                <Input id="signature-file" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">Chỉ chấp nhận file .png hoặc .jpg</p>
            </div>
             <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="password">Mật khẩu bảo vệ</Label>
                <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Đặt mật khẩu cho chữ ký"
                    required 
                />
            </div>
            <Button type="submit" disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Tạo chữ ký
            </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const DocumentSigning = () => {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
    const [selectedSignatureId, setSelectedSignatureId] = useState<number | null>(null);
    const [isSigning, setIsSigning] = useState(false);
    
    const [signatures, setSignatures] = useState<SignatureDTO[]>([]);
     useEffect(() => {
        const fetchUserSignatures = async () => {
            try {
                const userSignatures = await signatureApi.getSignatures();
                setSignatures(userSignatures);
            } catch (error) {
                console.error("Failed to fetch signatures for signing tab", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách chữ ký.",
                    variant: "destructive"
                });
            }
        };
        fetchUserSignatures();
    }, [toast]);

    const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setPdfFile(event.target.files[0]);
            setPlacedSignatures([]); 
            setSelectedSignatureId(null);
        }
    };
    
    const handleDropSignature = useCallback((item: { id: number; src: string }, x: number, y: number, page: number) => {
        const newSignature: PlacedSignature = { 
            ...item, 
            instanceId: Date.now(),
            x, 
            y, 
            page,
            width: 150,
            height: 75,
        };
        setPlacedSignatures(prev => [...prev, newSignature]);
        setSelectedSignatureId(newSignature.instanceId);
    }, []);

    const handleMoveSignature = (instanceId: number, newX: number, newY: number) => {
        setPlacedSignatures(prev =>
            prev.map(sig => 
                sig.instanceId === instanceId ? { ...sig, x: newX, y: newY } : sig
            )
        );
    };

    const handleResizeSignature = (instanceId: number, newWidth: number, newHeight: number) => {
        setPlacedSignatures(prev =>
            prev.map(sig => 
                sig.instanceId === instanceId ? { ...sig, width: newWidth, height: newHeight } : sig
            )
        );
    };

    const handleDeleteSignature = (instanceIdToDelete: number) => {
        setPlacedSignatures(prev => prev.filter(sig => sig.instanceId !== instanceIdToDelete));
        setSelectedSignatureId(null);
    };


    const handleSignPdf = async () => {
        if (!pdfFile || placedSignatures.length === 0) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng tải file PDF và đặt chữ ký.", variant: "destructive" });
            return;
        }

        setIsSigning(true);
        try {
            const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
            const passwords = new Map<number, string>();
            const signatureImages = new Map<number, Uint8Array>();

            // Get passwords and fetch unique signature images
            for (const sig of placedSignatures) {
                if (signatureImages.has(sig.id)) continue;

                let password = passwords.get(sig.id);
                if (!password) {
                    password = prompt(`Vui lòng nhập mật khẩu cho chữ ký ID: ${sig.id}`) || '';
                    if (!password) {
                        toast({ title: "Hủy bỏ", description: "Quá trình ký bị hủy do thiếu mật khẩu.", variant: "default" });
                        setIsSigning(false);
                        return;
                    }
                    passwords.set(sig.id, password);
                }

                try {
                    const imageBlob = await signatureApi.getSignatureImage(sig.id, password);
                    signatureImages.set(sig.id, new Uint8Array(await imageBlob.arrayBuffer()));
                } catch (e) {
                    toast({ title: "Lỗi mật khẩu", description: `Mật khẩu không đúng cho chữ ký ID: ${sig.id}`, variant: "destructive" });
                    setIsSigning(false);
                    return;
                }
            }
            
            // Embed images into the PDF
            for (const sig of placedSignatures) {
                const pngImageBytes = signatureImages.get(sig.id);
                if (!pngImageBytes) continue;

                const pngImage = await pdfDoc.embedPng(pngImageBytes);
                const page = pdfDoc.getPages()[sig.page - 1];

                page.drawImage(pngImage, {
                    x: sig.x,
                    y: page.getHeight() - sig.y - sig.height, // Invert Y-axis
                    width: sig.width,
                    height: sig.height,
                });
            }

            const signedPdfBytes = await pdfDoc.save();
            const signedPdfBlob = new Blob([signedPdfBytes], { type: 'application/pdf' });

            const url = window.URL.createObjectURL(signedPdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `signed-${pdfFile.name}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({ title: "Thành công", description: "Tài liệu đã được ký và tải xuống." });
            setPlacedSignatures([]);
            setSelectedSignatureId(null);

        } catch (error: any) {
            toast({ title: "Lỗi ký", description: error?.message || "Không thể ký tài liệu.", variant: "destructive" });
        } finally {
            setIsSigning(false);
        }
    };
    
    // Construct the public URL for the signature image
    const getSignatureImageUrl = (fileName: string) => {
        // This needs to match how files are served from your backend.
        // Assuming a static path like `/api/uploads/signatures/{fileName}`
        // You MUST configure your backend to serve files from the signature storage directory.
        return `/api/uploads/signatures/${fileName}`; 
    };

    return (
        <Card>
                <CardHeader>
                    <CardTitle>Ký tài liệu PDF</CardTitle>
                    <CardDescription>Tải lên tài liệu PDF, kéo và thả chữ ký của bạn vào vị trí mong muốn, sau đó ký.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <PdfViewer 
                            file={pdfFile} 
                            placedSignatures={placedSignatures}
                            onDropSignature={handleDropSignature}
                            onMoveSignature={handleMoveSignature}
                            onResizeSignature={handleResizeSignature}
                            numPages={numPages}
                            setNumPages={setNumPages}
                            // Pass down selection state and handlers
                            selectedSignatureId={selectedSignatureId}
                            onSelectSignature={setSelectedSignatureId}
                            onDeleteSignature={handleDeleteSignature}
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="pdf-upload">1. Tải lên PDF</Label>
                            <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handlePdfFileChange} />
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">2. Kéo chữ ký của bạn</h3>
                             <div className="p-4 bg-gray-100 rounded-lg h-48 overflow-y-auto space-y-2">
                                {signatures.length > 0 ? signatures.map(sig => (
                                    <DraggableSignature 
                                        key={sig.id} 
                                        id={sig.id} 
                                        fileName={sig.fileName}
                                        src={getSignatureImageUrl(sig.fileName)}
                                    />
                                )) : <p className="text-xs text-center text-gray-500">Không có chữ ký nào</p>}
                            </div>
                        </div>
                         <div>
                            <h3 className="font-medium mb-2">3. Ký và tải xuống</h3>
                            <Button className="w-full" onClick={handleSignPdf} disabled={isSigning || !pdfFile || placedSignatures.length === 0}>
                                 {isSigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
                                Ký tài liệu
                            </Button>
                        </div>
                        {numPages && <p className="text-sm text-center">Số trang: {numPages}</p>}
                    </div>
                </CardContent>
            </Card>
    );
};


export default function DigitalSignaturePage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <PenSquare className="h-8 w-8" />
          Chữ ký số
        </h1>
        <p className="text-muted-foreground">
          Quản lý và sử dụng chữ ký số để ký các tài liệu PDF
        </p>
      </div>

      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management">
            <PenSquare className="h-4 w-4 mr-2" />
            Quản lý chữ ký
          </TabsTrigger>
          <TabsTrigger value="signing">
            <FileSignature className="h-4 w-4 mr-2" />
            Ký tài liệu
          </TabsTrigger>
        </TabsList>
        <TabsContent value="management" className="mt-4">
          <SignatureManagement />
        </TabsContent>
        <TabsContent value="signing" className="mt-4">
          <DndWrapper>
            <DocumentSigning />
          </DndWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
} 