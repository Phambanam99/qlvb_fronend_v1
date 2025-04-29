# DocumentWorkflowApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**approveDocument**](#approvedocument) | **PUT** /api/workflow/{documentId}/approve | Approve document|
|[**assignDocument**](#assigndocument) | **POST** /api/workflow/{documentId}/assign | Assign document|
|[**assignToSpecialist**](#assigntospecialist) | **POST** /api/workflow/{documentId}/assign-specialist | Assign to specialist|
|[**changeDocumentStatus**](#changedocumentstatus) | **PUT** /api/workflow/{documentId}/status | Change document status|
|[**distributeDocument**](#distributedocument) | **PUT** /api/workflow/{documentId}/distribute | Distribute document|
|[**forwardToLeadership**](#forwardtoleadership) | **PUT** /api/workflow/{documentId}/forward-to-leadership | Forward to leadership|
|[**getDocumentDepartments**](#getdocumentdepartments) | **GET** /api/workflow/{documentId}/departments | Get document departments|
|[**getDocumentHistory**](#getdocumenthistory) | **GET** /api/workflow/{documentId}/history | Get document history|
|[**getDocumentStatus**](#getdocumentstatus) | **GET** /api/workflow/{documentId}/status | Get document status|
|[**provideDocumentFeedback**](#providedocumentfeedback) | **PUT** /api/workflow/{documentId}/provide-feedback | Provide feedback|
|[**publishOutgoingDocument**](#publishoutgoingdocument) | **PUT** /api/workflow/{documentId}/publish | Publish outgoing document|
|[**registerIncomingDocument**](#registerincomingdocument) | **PUT** /api/workflow/{documentId}/register | Register incoming document|
|[**startProcessingDocument**](#startprocessingdocument) | **PUT** /api/workflow/{documentId}/start-processing | Start processing document|
|[**startReviewingDocument**](#startreviewingdocument) | **PUT** /api/workflow/{documentId}/start-reviewing | Start reviewing document|
|[**submitToLeadership**](#submittoleadership) | **PUT** /api/workflow/{documentId}/submit | Submit to leadership|

# **approveDocument**
> object approveDocument(documentWorkflowDTO)

Leader approves document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.approveDocument(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Document approved successfully |  -  |
|**403** | Not authorized to approve document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **assignDocument**
> object assignDocument(documentWorkflowDTO)

Assigns a document to a user

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.assignDocument(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**403** | Not authorized to assign document |  -  |
|**404** | Document or user not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **assignToSpecialist**
> object assignToSpecialist(documentWorkflowDTO)

Department head assigns document to a specialist

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.assignToSpecialist(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**403** | Not authorized to assign document |  -  |
|**404** | Document or user not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **changeDocumentStatus**
> object changeDocumentStatus(documentWorkflowDTO)

Changes the status of a document in the workflow

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.changeDocumentStatus(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Document status successfully changed |  -  |
|**400** | Invalid status transition |  -  |
|**403** | Not authorized to change document status |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **distributeDocument**
> object distributeDocument(requestBody)

Distribute document to relevant departments

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.distributeDocument(
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
|**200** | Document successfully distributed |  -  |
|**400** | Invalid request parameters |  -  |
|**403** | Not authorized to distribute document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **forwardToLeadership**
> object forwardToLeadership(documentWorkflowDTO)

Department head forwards document for leader approval

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.forwardToLeadership(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Document successfully forwarded |  -  |
|**403** | Not authorized to forward document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentDepartments**
> Array<DocumentDepartmentDTO> getDocumentDepartments()

Get departments assigned to process a document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.getDocumentDepartments(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**Array<DocumentDepartmentDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved department list |  -  |
|**403** | Not authorized to view document departments |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentHistory**
> Array<DocumentHistoryDTO> getDocumentHistory()

Returns the workflow history of a document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.getDocumentHistory(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**Array<DocumentHistoryDTO>**

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

# **getDocumentStatus**
> DocumentWorkflowDTO getDocumentStatus()

Returns the current status of a document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.getDocumentStatus(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**DocumentWorkflowDTO**

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

# **provideDocumentFeedback**
> object provideDocumentFeedback(documentWorkflowDTO)

Leader provides feedback on document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.provideDocumentFeedback(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Feedback provided successfully |  -  |
|**403** | Not authorized to provide feedback |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **publishOutgoingDocument**
> object publishOutgoingDocument(documentWorkflowDTO)

Văn thư publishes an outgoing document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.publishOutgoingDocument(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Document successfully published |  -  |
|**403** | Not authorized to publish document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registerIncomingDocument**
> object registerIncomingDocument(documentWorkflowDTO)

Văn thư registers a newly received document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.registerIncomingDocument(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Document successfully registered |  -  |
|**403** | Not authorized to register document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startProcessingDocument**
> object startProcessingDocument(documentWorkflowDTO)

Specialist starts processing the document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.startProcessingDocument(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Document processing started |  -  |
|**403** | Not authorized to process document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startReviewingDocument**
> object startReviewingDocument(documentWorkflowDTO)

Leader starts reviewing document

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.startReviewingDocument(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Document review started |  -  |
|**403** | Not authorized to review document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submitToLeadership**
> object submitToLeadership(documentWorkflowDTO)

Specialist submits document for leader approval

### Example

```typescript
import {
    DocumentWorkflowApi,
    Configuration,
    DocumentWorkflowDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentWorkflowApi(configuration);

let documentId: number; //ID of the document (default to undefined)
let documentWorkflowDTO: DocumentWorkflowDTO; //

const { status, data } = await apiInstance.submitToLeadership(
    documentId,
    documentWorkflowDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentWorkflowDTO** | **DocumentWorkflowDTO**|  | |
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
|**200** | Document successfully submitted |  -  |
|**403** | Not authorized to submit document |  -  |
|**404** | Document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

