"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenSquare, FileSignature } from "lucide-react";
import { SignatureManagement } from "@/components/digital-signature/SignatureManagement";
import { DocumentSigning } from "@/components/digital-signature/DocumentSigning";
import { DndWrapper } from "@/components/digital-signature/DndWrapper";
import { useSignatures } from "@/hooks/use-signatures";
import { UI_TEXT } from "@/lib/constants/signature";
import { SignatureDTO } from "@/lib/types/signature";

export default function DigitalSignaturePage() {
  const { signatures, fetchSignatures } = useSignatures();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <PenSquare className="h-8 w-8" />
          {UI_TEXT.TITLES.DIGITAL_SIGNATURE}
        </h1>
        <p className="text-muted-foreground">{UI_TEXT.DESCRIPTIONS.MAIN}</p>
      </div>

      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management">
            <PenSquare className="h-4 w-4 mr-2" />
            {UI_TEXT.TABS.MANAGEMENT}
          </TabsTrigger>
          <TabsTrigger value="signing">
            <FileSignature className="h-4 w-4 mr-2" />
            {UI_TEXT.TABS.SIGNING}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="management" className="mt-4">
          <SignatureManagement onSignaturesChange={() => fetchSignatures()} />
        </TabsContent>
        <TabsContent value="signing" className="mt-4">
          <DndWrapper>
            <DocumentSigning signatures={signatures} />
          </DndWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}
