# IncomingDocumentsApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createIncomingDocument**](#createincomingdocument) | **POST** /api/documents/incoming | Create new incoming document|
|[**deleteIncomingDocument**](#deleteincomingdocument) | **DELETE** /api/documents/incoming/{id} | Delete incoming document|
|[**downloadIncomingDocumentAttachment**](#downloadincomingdocumentattachment) | **GET** /api/documents/incoming/{id}/attachment | Download document attachment|
|[**findByDateRange2**](#findbydaterange2) | **GET** /api/documents/incoming/date-range | Find documents by date range|
|[**findByProcessingStatus**](#findbyprocessingstatus) | **GET** /api/documents/incoming/processing-status | Find documents by processing status|
|[**findByUrgencyLevel**](#findbyurgencylevel) | **GET** /api/documents/incoming/urgency-level | Find documents by urgency level|
|[**getAllIncomingDocuments**](#getallincomingdocuments) | **GET** /api/documents/incoming | Get all incoming documents|
|[**getIncomingDocumentById**](#getincomingdocumentbyid) | **GET** /api/documents/incoming/{id} | Get incoming document by ID|
|[**searchIncomingDocuments**](#searchincomingdocuments) | **GET** /api/documents/incoming/search | Search incoming documents|
|[**updateIncomingDocument**](#updateincomingdocument) | **PUT** /api/documents/incoming/{id} | Update incoming document|
|[**uploadIncomingDocumentAttachment**](#uploadincomingdocumentattachment) | **POST** /api/documents/incoming/{id}/attachment | Upload document attachment|

# **createIncomingDocument**
> IncomingDocumentDTO createIncomingDocument(incomingDocumentDTO)

Creates a new incoming document

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration,
    IncomingDocumentDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let incomingDocumentDTO: IncomingDocumentDTO; //

const { status, data } = await apiInstance.createIncomingDocument(
    incomingDocumentDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **incomingDocumentDTO** | **IncomingDocumentDTO**|  | |


### Return type

**IncomingDocumentDTO**

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

# **deleteIncomingDocument**
> deleteIncomingDocument()

Deletes an incoming document by ID

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let id: number; //ID of the document to delete (default to undefined)

const { status, data } = await apiInstance.deleteIncomingDocument(
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

# **downloadIncomingDocumentAttachment**
> File downloadIncomingDocumentAttachment()

Downloads a file attachment for an incoming document

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.downloadIncomingDocumentAttachment(
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

# **findByDateRange2**
> PageIncomingDocumentDTO findByDateRange2()

Returns documents within a specific date range

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let start: string; //Start date (ISO format) (default to undefined)
let end: string; //End date (ISO format) (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.findByDateRange2(
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

**PageIncomingDocumentDTO**

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

# **findByProcessingStatus**
> PageIncomingDocumentDTO findByProcessingStatus()

Returns documents with a specific processing status

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let status: string; //Processing status to filter by (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.findByProcessingStatus(
    status,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] | Processing status to filter by | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageIncomingDocumentDTO**

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

# **findByUrgencyLevel**
> PageIncomingDocumentDTO findByUrgencyLevel()

Returns documents matching a specific urgency level

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let level: string; //Urgency level to filter by (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.findByUrgencyLevel(
    level,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **level** | [**string**] | Urgency level to filter by | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageIncomingDocumentDTO**

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

# **getAllIncomingDocuments**
> PageIncomingDocumentDTO getAllIncomingDocuments()

Returns a paginated list of all incoming documents

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getAllIncomingDocuments(
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageIncomingDocumentDTO**

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

# **getIncomingDocumentById**
> IncomingDocumentDTO getIncomingDocumentById()

Returns a single incoming document by ID

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let id: number; //ID of the document to retrieve (default to undefined)

const { status, data } = await apiInstance.getIncomingDocumentById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the document to retrieve | defaults to undefined|


### Return type

**IncomingDocumentDTO**

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

# **searchIncomingDocuments**
> PageIncomingDocumentDTO searchIncomingDocuments()

Search incoming documents by keyword

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let keyword: string; //Keyword to search for (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.searchIncomingDocuments(
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

**PageIncomingDocumentDTO**

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

# **updateIncomingDocument**
> IncomingDocumentDTO updateIncomingDocument(incomingDocumentDTO)

Updates an existing incoming document

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration,
    IncomingDocumentDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let id: number; //ID of the document to update (default to undefined)
let incomingDocumentDTO: IncomingDocumentDTO; //

const { status, data } = await apiInstance.updateIncomingDocument(
    id,
    incomingDocumentDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **incomingDocumentDTO** | **IncomingDocumentDTO**|  | |
| **id** | [**number**] | ID of the document to update | defaults to undefined|


### Return type

**IncomingDocumentDTO**

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

# **uploadIncomingDocumentAttachment**
> IncomingDocumentDTO uploadIncomingDocumentAttachment()

Uploads a file attachment for an incoming document

### Example

```typescript
import {
    IncomingDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncomingDocumentsApi(configuration);

let id: number; //ID of the document (default to undefined)
let file: File; //File to upload (default to undefined)

const { status, data } = await apiInstance.uploadIncomingDocumentAttachment(
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

**IncomingDocumentDTO**

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

