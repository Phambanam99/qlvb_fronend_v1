# DepartmentsApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createDepartment**](#createdepartment) | **POST** /api/departments | Create new department|
|[**deleteDepartment**](#deletedepartment) | **DELETE** /api/departments/{id} | Delete department|
|[**findDepartmentsByGroup**](#finddepartmentsbygroup) | **GET** /api/departments/group/{group} | Find departments by group|
|[**findDepartmentsByType**](#finddepartmentsbytype) | **GET** /api/departments/type/{typeCode} | Find departments by type|
|[**getAllDepartments**](#getalldepartments) | **GET** /api/departments | Get all departments|
|[**getDepartmentById**](#getdepartmentbyid) | **GET** /api/departments/{id} | Get department by ID|
|[**getDepartmentStatistics**](#getdepartmentstatistics) | **GET** /api/departments/statistics | Get department statistics|
|[**getDepartmentTypes**](#getdepartmenttypes) | **GET** /api/departments/types | Get department types|
|[**searchDepartments**](#searchdepartments) | **GET** /api/departments/search | Search departments|
|[**updateDepartment**](#updatedepartment) | **PUT** /api/departments/{id} | Update department|

# **createDepartment**
> DepartmentDTO createDepartment(departmentDTO)

Creates a new department

### Example

```typescript
import {
    DepartmentsApi,
    Configuration,
    DepartmentDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

let departmentDTO: DepartmentDTO; //

const { status, data } = await apiInstance.createDepartment(
    departmentDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **departmentDTO** | **DepartmentDTO**|  | |


### Return type

**DepartmentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Department successfully created |  -  |
|**400** | Invalid department data |  -  |
|**403** | Not authorized to create departments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteDepartment**
> deleteDepartment()

Deletes a department by ID

### Example

```typescript
import {
    DepartmentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

let id: number; //ID of the department to delete (default to undefined)

const { status, data } = await apiInstance.deleteDepartment(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the department to delete | defaults to undefined|


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
|**204** | Department successfully deleted |  -  |
|**403** | Not authorized to delete departments |  -  |
|**404** | Department not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findDepartmentsByGroup**
> PageDepartmentDTO findDepartmentsByGroup()

Returns departments belonging to a specific group

### Example

```typescript
import {
    DepartmentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

let group: string; //Department group to filter by (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.findDepartmentsByGroup(
    group,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Department group to filter by | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageDepartmentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved departments |  -  |
|**403** | Not authorized to view departments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findDepartmentsByType**
> PageDepartmentDTO findDepartmentsByType()

Returns departments matching a specific type

### Example

```typescript
import {
    DepartmentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

let typeCode: number; //Department type code to filter by (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.findDepartmentsByType(
    typeCode,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **typeCode** | [**number**] | Department type code to filter by | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageDepartmentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved departments |  -  |
|**400** | Invalid department type |  -  |
|**403** | Not authorized to view departments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllDepartments**
> PageDepartmentDTO getAllDepartments()

Returns a paginated list of all departments

### Example

```typescript
import {
    DepartmentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getAllDepartments(
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**PageDepartmentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved departments |  -  |
|**403** | Not authorized to view departments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDepartmentById**
> DepartmentDTO getDepartmentById()

Returns a single department by ID

### Example

```typescript
import {
    DepartmentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

let id: number; //ID of the department to retrieve (default to undefined)

const { status, data } = await apiInstance.getDepartmentById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the department to retrieve | defaults to undefined|


### Return type

**DepartmentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved department |  -  |
|**403** | Not authorized to view departments |  -  |
|**404** | Department not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDepartmentStatistics**
> { [key: string]: object; } getDepartmentStatistics()

Returns statistics about departments

### Example

```typescript
import {
    DepartmentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

const { status, data } = await apiInstance.getDepartmentStatistics();
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

# **getDepartmentTypes**
> { [key: string]: object; } getDepartmentTypes()

Returns a list of available department types and their descriptions

### Example

```typescript
import {
    DepartmentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

const { status, data } = await apiInstance.getDepartmentTypes();
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
|**200** | Successfully retrieved department types |  -  |
|**403** | Not authorized to view department types |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **searchDepartments**
> PageDepartmentDTO searchDepartments()

Search departments by name or abbreviation

### Example

```typescript
import {
    DepartmentsApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

let keyword: string; //Keyword to search for (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.searchDepartments(
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

**PageDepartmentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Search completed successfully |  -  |
|**403** | Not authorized to search departments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateDepartment**
> DepartmentDTO updateDepartment(departmentDTO)

Updates an existing department

### Example

```typescript
import {
    DepartmentsApi,
    Configuration,
    DepartmentDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DepartmentsApi(configuration);

let id: number; //ID of the department to update (default to undefined)
let departmentDTO: DepartmentDTO; //

const { status, data } = await apiInstance.updateDepartment(
    id,
    departmentDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **departmentDTO** | **DepartmentDTO**|  | |
| **id** | [**number**] | ID of the department to update | defaults to undefined|


### Return type

**DepartmentDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Department successfully updated |  -  |
|**400** | Invalid department data |  -  |
|**403** | Not authorized to update departments |  -  |
|**404** | Department not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

