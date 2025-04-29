# UnifiedDocumentDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**number** | **string** |  | [optional] [default to undefined]
**referenceNumber** | **string** |  | [optional] [default to undefined]
**referenceDate** | **string** |  | [optional] [default to undefined]
**issuingAgency** | **string** |  | [optional] [default to undefined]
**subject** | **string** |  | [optional] [default to undefined]
**processingDepartmentId** | **string** |  | [optional] [default to undefined]
**processingDepartment** | **string** |  | [optional] [default to undefined]
**receivedDate** | **string** |  | [optional] [default to undefined]
**receivedTime** | **string** |  | [optional] [default to undefined]
**securityLevel** | **string** |  | [optional] [default to undefined]
**urgencyLevel** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**hasAttachment** | **boolean** |  | [optional] [default to undefined]
**attachments** | [**Array&lt;DocumentAttachmentDTO&gt;**](DocumentAttachmentDTO.md) |  | [optional] [default to undefined]
**assignedUsers** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**deadline** | **string** |  | [optional] [default to undefined]
**requiresResponse** | **boolean** |  | [optional] [default to undefined]
**comments** | [**Array&lt;DocumentCommentDTO&gt;**](DocumentCommentDTO.md) |  | [optional] [default to undefined]
**documentType** | **string** |  | [optional] [default to undefined]
**content** | **string** |  | [optional] [default to undefined]
**includesEnclosure** | **boolean** |  | [optional] [default to undefined]
**primaryHandler** | **boolean** |  | [optional] [default to undefined]
**legalDocument** | **boolean** |  | [optional] [default to undefined]
**confidentialReturn** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { UnifiedDocumentDTO } from './api';

const instance: UnifiedDocumentDTO = {
    id,
    number,
    referenceNumber,
    referenceDate,
    issuingAgency,
    subject,
    processingDepartmentId,
    processingDepartment,
    receivedDate,
    receivedTime,
    securityLevel,
    urgencyLevel,
    status,
    hasAttachment,
    attachments,
    assignedUsers,
    deadline,
    requiresResponse,
    comments,
    documentType,
    content,
    includesEnclosure,
    primaryHandler,
    legalDocument,
    confidentialReturn,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
