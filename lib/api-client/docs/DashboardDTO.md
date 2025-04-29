# DashboardDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**incomingDocumentCount** | **number** |  | [optional] [default to undefined]
**outgoingDocumentCount** | **number** |  | [optional] [default to undefined]
**workCaseCount** | **number** |  | [optional] [default to undefined]
**pendingDocumentCount** | **number** |  | [optional] [default to undefined]
**overdueDocumentCount** | **number** |  | [optional] [default to undefined]
**documentCountsByType** | **{ [key: string]: number; }** |  | [optional] [default to undefined]
**documentCountsByMonth** | **{ [key: string]: number; }** |  | [optional] [default to undefined]
**processingTimeStatistics** | **{ [key: string]: number; }** |  | [optional] [default to undefined]
**departmentPerformance** | **{ [key: string]: object; }** |  | [optional] [default to undefined]
**topActiveUsers** | [**Array&lt;UserActivityDTO&gt;**](UserActivityDTO.md) |  | [optional] [default to undefined]
**recentDocuments** | [**Array&lt;UnifiedDocumentDTO&gt;**](UnifiedDocumentDTO.md) |  | [optional] [default to undefined]

## Example

```typescript
import { DashboardDTO } from './api';

const instance: DashboardDTO = {
    incomingDocumentCount,
    outgoingDocumentCount,
    workCaseCount,
    pendingDocumentCount,
    overdueDocumentCount,
    documentCountsByType,
    documentCountsByMonth,
    processingTimeStatistics,
    departmentPerformance,
    topActiveUsers,
    recentDocuments,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
