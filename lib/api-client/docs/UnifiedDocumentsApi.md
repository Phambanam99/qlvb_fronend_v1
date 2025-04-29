# UnifiedDocumentsApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addDocumentComment**](#adddocumentcomment) | **POST** /api/documents/unified/{documentId}/comments | Add comment to document|
|[**assignDocumentToUser**](#assigndocumenttouser) | **POST** /api/documents/unified/{documentId}/workflow/assign | Assign document to user|
|[**changeDocumentWorkflowStatus**](#changedocumentworkflowstatus) | **POST** /api/documents/unified/{documentId}/workflow/status | Change document workflow status|
|[**deleteDocumentAttachment**](#deletedocumentattachment) | **DELETE** /api/documents/unified/{id}/attachments | Delete document attachment|
|[**deleteDocumentComment**](#deletedocumentcomment) | **DELETE** /api/documents/unified/comments/{commentId} | Delete document comment|
|[**downloadDocumentAttachment**](#downloaddocumentattachment) | **GET** /api/documents/unified/{id}/attachments | Download document attachment|
|[**findByDateRange**](#findbydaterange) | **GET** /api/documents/unified/by-date | Find documents by date range|
|[**getAllDocuments**](#getalldocuments) | **GET** /api/documents/unified | Get all documents|
|[**getDocumentById**](#getdocumentbyid) | **GET** /api/documents/unified/{id} | Get document by ID|
|[**getDocumentComments**](#getdocumentcomments) | **GET** /api/documents/unified/{documentId}/comments | Get document comments|
|[**getDocumentStats**](#getdocumentstats) | **GET** /api/documents/unified/stats | Get document statistics|
|[**getDocumentWorkflowHistory**](#getdocumentworkflowhistory) | **GET** /api/documents/unified/{documentId}/workflow/history | Get document workflow history|
|[**getDocumentWorkflowStatus**](#getdocumentworkflowstatus) | **GET** /api/documents/unified/{documentId}/workflow/status | Get document workflow status|
|[**searchDocuments**](#searchdocuments) | **GET** /api/documents/unified/search | Search documents|
|[**uploadDocumentAttachment**](#uploaddocumentattachment) | **POST** /api/documents/unified/{id}/attachments | Upload document attachment|
|[**uploadMultipleAttachments**](#uploadmultipleattachments) | **POST** /api/documents/unified/{id}/multiple-attachments | Upload multiple document attachments|

# **addDocumentComment**
> object addDocumentComment(requestBody)

Adds a comment to any document type

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.addDocumentComment(
    documentId,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Comment successfully added |  -  |
|**400** | Invalid comment data |  -  |
|**403** | Not authorized to add comments |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **assignDocumentToUser**
> object assignDocumentToUser(requestBody)

Assigns a document to a user for processing

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.assignDocumentToUser(
    documentId,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Document successfully assigned |  -  |
|**400** | Invalid request parameters |  -  |
|**403** | Not authorized to assign documents |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **changeDocumentWorkflowStatus**
> object changeDocumentWorkflowStatus(requestBody)

Changes the workflow status of a document

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.changeDocumentWorkflowStatus(
    documentId,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Status successfully changed |  -  |
|**400** | Invalid status transition |  -  |
|**403** | Not authorized to change document status |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteDocumentAttachment**
> object deleteDocumentAttachment()

Deletes a file attachment from any document type

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.deleteDocumentAttachment(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the document | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Attachment successfully deleted |  -  |
|**403** | Not authorized to delete attachments |  -  |
|**404** | Document or attachment not found |  -  |
|**500** | Internal server error during deletion |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteDocumentComment**
> object deleteDocumentComment()

Deletes a comment from any document type

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let commentId: number; //ID of the comment (default to undefined)

const { status, data } = await apiInstance.deleteDocumentComment(
    commentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **commentId** | [**number**] | ID of the comment | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Comment successfully deleted |  -  |
|**403** | Not authorized to delete comments |  -  |
|**404** | Comment not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **downloadDocumentAttachment**
> object downloadDocumentAttachment()

Downloads a file attachment for any document type

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.downloadDocumentAttachment(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the document | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | File ready for download |  -  |
|**403** | Not authorized to download attachments |  -  |
|**404** | Document or attachment not found |  -  |
|**500** | Internal server error during download |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findByDateRange**
> PageUnifiedDocumentDTO findByDateRange()

Find all documents within a date range

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let start: string; //Start date (inclusive) (default to undefined)
let end: string; //End date (inclusive) (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.findByDateRange(
    start,
    end,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **start** | [**string**] | Start date (inclusive) | defaults to undefined|
| **end** | [**string**] | End date (inclusive) | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageUnifiedDocumentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Search completed successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllDocuments**
> PageUnifiedDocumentDTO getAllDocuments()

Returns a paginated list of all documents in unified format

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getAllDocuments(
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageUnifiedDocumentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved documents |  -  |
|**403** | Not authorized to view documents |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentById**
> UnifiedDocumentDTO getDocumentById()

Returns a single document in unified format

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getDocumentById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**UnifiedDocumentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved document |  -  |
|**403** | Not authorized to view this document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentComments**
> object getDocumentComments()

Retrieves all comments for any document type

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let type: string; //Comment type filter (optional) (default to undefined)

const { status, data } = await apiInstance.getDocumentComments(
    documentId,
    type
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] | ID of the document | defaults to undefined|
| **type** | [**string**] | Comment type filter | (optional) defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Comments successfully retrieved |  -  |
|**403** | Not authorized to view comments |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentStats**
> { [key: string]: object; } getDocumentStats()

Get document counts by type and status

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

const { status, data } = await apiInstance.getDocumentStats();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: object; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved statistics |  -  |
|**403** | Not authorized to view statistics |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentWorkflowHistory**
> object getDocumentWorkflowHistory()

Returns the workflow history of a document

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let documentId: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.getDocumentWorkflowHistory(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved document history |  -  |
|**403** | Not authorized to view document history |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentWorkflowStatus**
> object getDocumentWorkflowStatus()

Returns the current workflow status of a document

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let documentId: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.getDocumentWorkflowStatus(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved document status |  -  |
|**403** | Not authorized to view document status |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **searchDocuments**
> PageUnifiedDocumentDTO searchDocuments()

Search all documents by keyword

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let keyword: string; //Keyword to search for (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.searchDocuments(
    keyword,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **keyword** | [**string**] | Keyword to search for | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageUnifiedDocumentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Search completed successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadDocumentAttachment**
> object uploadDocumentAttachment()

Uploads a file attachment for any document type

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)
let file: File; //File to upload (default to undefined)

const { status, data } = await apiInstance.uploadDocumentAttachment(
    id,
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the document | defaults to undefined|
| **file** | [**File**] | File to upload | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | File successfully uploaded |  -  |
|**403** | Not authorized to upload attachments |  -  |
|**404** | Document not found |  -  |
|**500** | Internal server error during upload |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadMultipleAttachments**
> object uploadMultipleAttachments()

Uploads multiple file attachments for any document type

### Example

```typescript
import {
    UnifiedDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UnifiedDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)
let files: Array<File>; //Files to upload (default to undefined)

const { status, data } = await apiInstance.uploadMultipleAttachments(
    id,
    files
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the document | defaults to undefined|
| **files** | **Array&lt;File&gt;** | Files to upload | defaults to undefined|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Files successfully uploaded |  -  |
|**403** | Not authorized to upload attachments |  -  |
|**404** | Document not found |  -  |
|**500** | Internal server error during upload |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

