# WorkCasesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addDocumentToCase**](#adddocumenttocase) | **POST** /api/cases/{caseId}/documents/{documentId} | Add document to work case|
|[**createWorkCase**](#createworkcase) | **POST** /api/cases | Create new work case|
|[**deleteWorkCase**](#deleteworkcase) | **DELETE** /api/cases/{id} | Delete work case|
|[**getAllWorkCases**](#getallworkcases) | **GET** /api/cases | Get all work cases|
|[**getOverdueCases**](#getoverduecases) | **GET** /api/cases/overdue | Get overdue cases|
|[**getWorkCaseByCaseCode**](#getworkcasebycasecode) | **GET** /api/cases/code/{caseCode} | Get work case by case code|
|[**getWorkCaseById**](#getworkcasebyid) | **GET** /api/cases/{id} | Get work case by ID|
|[**getWorkCasesByAssignee**](#getworkcasesbyassignee) | **GET** /api/cases/assignee/{assigneeId} | Get work cases by assignee|
|[**getWorkCasesByCreator**](#getworkcasesbycreator) | **GET** /api/cases/creator/{creatorId} | Get work cases by creator|
|[**getWorkCasesByDocument**](#getworkcasesbydocument) | **GET** /api/cases/by-document/{documentId} | Get work cases by document|
|[**getWorkCasesByPriority**](#getworkcasesbypriority) | **GET** /api/cases/priority/{priority} | Get work cases by priority|
|[**getWorkCasesByStatus**](#getworkcasesbystatus) | **GET** /api/cases/status/{status} | Get work cases by status|
|[**removeDocumentFromCase**](#removedocumentfromcase) | **DELETE** /api/cases/{caseId}/documents/{documentId} | Remove document from work case|
|[**searchWorkCases**](#searchworkcases) | **GET** /api/cases/search | Search work cases|
|[**updateWorkCase**](#updateworkcase) | **PUT** /api/cases/{id} | Update work case|

# **addDocumentToCase**
> WorkCaseDTO addDocumentToCase()

Adds a document to a work case

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let caseId: number; //ID of the work case (default to undefined)
let documentId: number; //ID of the document to add (default to undefined)

const { status, data } = await apiInstance.addDocumentToCase(
    caseId,
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **caseId** | [**number**] | ID of the work case | defaults to undefined|
| **documentId** | [**number**] | ID of the document to add | defaults to undefined|


### Return type

**WorkCaseDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Document successfully added to work case |  -  |
|**403** | Not authorized to modify work cases |  -  |
|**404** | Work case or document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createWorkCase**
> WorkCaseDTO createWorkCase(workCaseDTO)

Creates a new work case

### Example

```typescript
import {
    WorkCasesApi,
    Configuration,
    WorkCaseDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let workCaseDTO: WorkCaseDTO; //

const { status, data } = await apiInstance.createWorkCase(
    workCaseDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **workCaseDTO** | **WorkCaseDTO**|  | |


### Return type

**WorkCaseDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Work case successfully created |  -  |
|**403** | Not authorized to create work cases |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteWorkCase**
> deleteWorkCase()

Deletes a work case by ID

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let id: number; //ID of the work case to delete (default to undefined)

const { status, data } = await apiInstance.deleteWorkCase(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the work case to delete | defaults to undefined|


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
|**204** | Work case successfully deleted |  -  |
|**403** | Not authorized to delete work cases |  -  |
|**404** | Work case not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllWorkCases**
> PageWorkCaseDTO getAllWorkCases()

Returns a paginated list of all work cases

### Example

```typescript
import {
    WorkCasesApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getAllWorkCases(
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageWorkCaseDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work cases |  -  |
|**403** | Not authorized to view work cases |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOverdueCases**
> Array<WorkCaseDTO> getOverdueCases()

Returns work cases past their deadline

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

const { status, data } = await apiInstance.getOverdueCases();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<WorkCaseDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work cases |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWorkCaseByCaseCode**
> WorkCaseDTO getWorkCaseByCaseCode()

Returns a single work case by case code

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let caseCode: string; //Case code of the work case to retrieve (default to undefined)

const { status, data } = await apiInstance.getWorkCaseByCaseCode(
    caseCode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **caseCode** | [**string**] | Case code of the work case to retrieve | defaults to undefined|


### Return type

**WorkCaseDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work case |  -  |
|**403** | Not authorized to view this work case |  -  |
|**404** | Work case not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWorkCaseById**
> WorkCaseDTO getWorkCaseById()

Returns a single work case by ID

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let id: number; //ID of the work case to retrieve (default to undefined)

const { status, data } = await apiInstance.getWorkCaseById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the work case to retrieve | defaults to undefined|


### Return type

**WorkCaseDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work case |  -  |
|**403** | Not authorized to view this work case |  -  |
|**404** | Work case not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWorkCasesByAssignee**
> Array<WorkCaseDTO> getWorkCasesByAssignee()

Returns work cases assigned to a specific user

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let assigneeId: number; //ID of the assignee (default to undefined)

const { status, data } = await apiInstance.getWorkCasesByAssignee(
    assigneeId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assigneeId** | [**number**] | ID of the assignee | defaults to undefined|


### Return type

**Array<WorkCaseDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work cases |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWorkCasesByCreator**
> Array<WorkCaseDTO> getWorkCasesByCreator()

Returns work cases created by a specific user

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let creatorId: number; //ID of the creator (default to undefined)

const { status, data } = await apiInstance.getWorkCasesByCreator(
    creatorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **creatorId** | [**number**] | ID of the creator | defaults to undefined|


### Return type

**Array<WorkCaseDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work cases |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWorkCasesByDocument**
> Array<WorkCaseDTO> getWorkCasesByDocument()

Returns work cases related to a specific document

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let documentId: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.getWorkCasesByDocument(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**Array<WorkCaseDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work cases |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWorkCasesByPriority**
> Array<WorkCaseDTO> getWorkCasesByPriority()

Returns work cases with a specific priority

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let priority: string; //Priority to filter by (default to undefined)

const { status, data } = await apiInstance.getWorkCasesByPriority(
    priority
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **priority** | [**string**] | Priority to filter by | defaults to undefined|


### Return type

**Array<WorkCaseDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work cases |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWorkCasesByStatus**
> Array<WorkCaseDTO> getWorkCasesByStatus()

Returns work cases with a specific status

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let status: string; //Status to filter by (default to undefined)

const { status, data } = await apiInstance.getWorkCasesByStatus(
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] | Status to filter by | defaults to undefined|


### Return type

**Array<WorkCaseDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved work cases |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **removeDocumentFromCase**
> WorkCaseDTO removeDocumentFromCase()

Removes a document from a work case

### Example

```typescript
import {
    WorkCasesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let caseId: number; //ID of the work case (default to undefined)
let documentId: number; //ID of the document to remove (default to undefined)

const { status, data } = await apiInstance.removeDocumentFromCase(
    caseId,
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **caseId** | [**number**] | ID of the work case | defaults to undefined|
| **documentId** | [**number**] | ID of the document to remove | defaults to undefined|


### Return type

**WorkCaseDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Document successfully removed from work case |  -  |
|**403** | Not authorized to modify work cases |  -  |
|**404** | Work case or document not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **searchWorkCases**
> PageWorkCaseDTO searchWorkCases()

Search work cases by keyword

### Example

```typescript
import {
    WorkCasesApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let keyword: string; //Keyword to search for (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.searchWorkCases(
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

**PageWorkCaseDTO**

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

# **updateWorkCase**
> WorkCaseDTO updateWorkCase(workCaseDTO)

Updates an existing work case

### Example

```typescript
import {
    WorkCasesApi,
    Configuration,
    WorkCaseDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkCasesApi(configuration);

let id: number; //ID of the work case to update (default to undefined)
let workCaseDTO: WorkCaseDTO; //

const { status, data } = await apiInstance.updateWorkCase(
    id,
    workCaseDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **workCaseDTO** | **WorkCaseDTO**|  | |
| **id** | [**number**] | ID of the work case to update | defaults to undefined|


### Return type

**WorkCaseDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Work case successfully updated |  -  |
|**403** | Not authorized to update work cases |  -  |
|**404** | Work case not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

