# IncomingDocumentDTO

Document details

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**documentType** | **string** |  | [optional] [default to undefined]
**documentNumber** | **string** |  | [optional] [default to undefined]
**referenceNumber** | **string** |  | [optional] [default to undefined]
**issuingAuthority** | **string** |  | [optional] [default to undefined]
**urgencyLevel** | **string** |  | [optional] [default to undefined]
**securityLevel** | **string** |  | [optional] [default to undefined]
**summary** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**signingDate** | **string** |  | [optional] [default to undefined]
**receivedDate** | **string** |  | [optional] [default to undefined]
**processingStatus** | **string** |  | [optional] [default to undefined]
**displayStatus** | **string** |  | [optional] [default to undefined]
**closureRequest** | **boolean** |  | [optional] [default to undefined]
**sendingDepartmentName** | **string** |  | [optional] [default to undefined]
**emailSource** | **string** |  | [optional] [default to undefined]
**primaryProcessorId** | **number** |  | [optional] [default to undefined]
**primaryProcessor** | [**UserDTO**](UserDTO.md) |  | [optional] [default to undefined]
**created** | **string** |  | [optional] [default to undefined]
**changed** | **string** |  | [optional] [default to undefined]
**attachmentFilename** | **string** |  | [optional] [default to undefined]
**storageLocation** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { IncomingDocumentDTO } from './api';

const instance: IncomingDocumentDTO = {
    id,
    title,
    documentType,
    documentNumber,
    referenceNumber,
    issuingAuthority,
    urgencyLevel,
    securityLevel,
    summary,
    notes,
    signingDate,
    receivedDate,
    processingStatus,
    displayStatus,
    closureRequest,
    sendingDepartmentName,
    emailSource,
    primaryProcessorId,
    primaryProcessor,
    created,
    changed,
    attachmentFilename,
    storageLocation,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
