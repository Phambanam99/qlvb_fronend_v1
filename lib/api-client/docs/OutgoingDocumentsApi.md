# OutgoingDocumentsApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createOutgoingDocument**](#createoutgoingdocument) | **POST** /api/documents/outgoing | Create new outgoing document|
|[**deleteOutgoingDocument**](#deleteoutgoingdocument) | **DELETE** /api/documents/outgoing/{id} | Delete outgoing document|
|[**downloadOutgoingDocumentAttachment**](#downloadoutgoingdocumentattachment) | **GET** /api/documents/outgoing/{id}/attachment | Download document attachment|
|[**findByDateRange1**](#findbydaterange1) | **GET** /api/documents/outgoing/date-range | Find documents by date range|
|[**findByDocumentType**](#findbydocumenttype) | **GET** /api/documents/outgoing/document-type | Find documents by type|
|[**getAllOutgoingDocuments**](#getalloutgoingdocuments) | **GET** /api/documents/outgoing | Get all outgoing documents|
|[**getOutgoingDocumentById**](#getoutgoingdocumentbyid) | **GET** /api/documents/outgoing/{id} | Get outgoing document by ID|
|[**searchOutgoingDocuments**](#searchoutgoingdocuments) | **GET** /api/documents/outgoing/search | Search outgoing documents|
|[**updateOutgoingDocument**](#updateoutgoingdocument) | **PUT** /api/documents/outgoing/{id} | Update outgoing document|
|[**uploadMultipleAttachments1**](#uploadmultipleattachments1) | **POST** /api/documents/outgoing/{id}/attachments | Upload multiple document attachments|
|[**uploadOutgoingDocumentAttachment**](#uploadoutgoingdocumentattachment) | **POST** /api/documents/outgoing/{id}/attachment | Upload document attachment|

# **createOutgoingDocument**
> OutgoingDocumentDTO createOutgoingDocument(outgoingDocumentDTO)

Creates a new outgoing document

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration,
    OutgoingDocumentDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let outgoingDocumentDTO: OutgoingDocumentDTO; //

const { status, data } = await apiInstance.createOutgoingDocument(
    outgoingDocumentDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **outgoingDocumentDTO** | **OutgoingDocumentDTO**|  | |


### Return type

**OutgoingDocumentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Document successfully created |  -  |
|**403** | Not authorized to create documents |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteOutgoingDocument**
> deleteOutgoingDocument()

Deletes an outgoing document by ID

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let id: number; //ID of the document to delete (default to undefined)

const { status, data } = await apiInstance.deleteOutgoingDocument(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the document to delete | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Document successfully deleted |  -  |
|**403** | Not authorized to delete documents |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **downloadOutgoingDocumentAttachment**
> File downloadOutgoingDocumentAttachment()

Downloads a file attachment for an outgoing document

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.downloadOutgoingDocumentAttachment(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the document | defaults to undefined|


### Return type

**File**

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

# **findByDateRange1**
> PageOutgoingDocumentDTO findByDateRange1()

Returns documents within a specific date range

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let start: string; //Start date (ISO format) (default to undefined)
let end: string; //End date (ISO format) (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.findByDateRange1(
    start,
    end,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **start** | [**string**] | Start date (ISO format) | defaults to undefined|
| **end** | [**string**] | End date (ISO format) | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageOutgoingDocumentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved documents |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findByDocumentType**
> PageOutgoingDocumentDTO findByDocumentType()

Returns documents matching a specific document type

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let type: string; //Document type to filter by (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.findByDocumentType(
    type,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**string**] | Document type to filter by | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageOutgoingDocumentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved documents |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllOutgoingDocuments**
> PageOutgoingDocumentDTO getAllOutgoingDocuments()

Returns a paginated list of all outgoing documents

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getAllOutgoingDocuments(
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageOutgoingDocumentDTO**

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

# **getOutgoingDocumentById**
> OutgoingDocumentDTO getOutgoingDocumentById()

Returns a single outgoing document by ID

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let id: number; //ID of the document to retrieve (default to undefined)

const { status, data } = await apiInstance.getOutgoingDocumentById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the document to retrieve | defaults to undefined|


### Return type

**OutgoingDocumentDTO**

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

# **searchOutgoingDocuments**
> PageOutgoingDocumentDTO searchOutgoingDocuments()

Search outgoing documents by keyword

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let keyword: string; //Keyword to search for (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.searchOutgoingDocuments(
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

**PageOutgoingDocumentDTO**

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

# **updateOutgoingDocument**
> OutgoingDocumentDTO updateOutgoingDocument(outgoingDocumentDTO)

Updates an existing outgoing document

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration,
    OutgoingDocumentDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let id: number; //ID of the document to update (default to undefined)
let outgoingDocumentDTO: OutgoingDocumentDTO; //

const { status, data } = await apiInstance.updateOutgoingDocument(
    id,
    outgoingDocumentDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **outgoingDocumentDTO** | **OutgoingDocumentDTO**|  | |
| **id** | [**number**] | ID of the document to update | defaults to undefined|


### Return type

**OutgoingDocumentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Document successfully updated |  -  |
|**403** | Not authorized to update documents |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadMultipleAttachments1**
> object uploadMultipleAttachments1()

Uploads multiple file attachments for an outgoing document

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)
let files: Array<File>; //Files to upload (default to undefined)

const { status, data } = await apiInstance.uploadMultipleAttachments1(
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

# **uploadOutgoingDocumentAttachment**
> OutgoingDocumentDTO uploadOutgoingDocumentAttachment()

Uploads a file attachment for an outgoing document

### Example

```typescript
import {
    OutgoingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OutgoingDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)
let file: File; //File to upload (default to undefined)

const { status, data } = await apiInstance.uploadOutgoingDocumentAttachment(
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

**OutgoingDocumentDTO**

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

