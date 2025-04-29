# PermissionsApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createPermission**](#createpermission) | **POST** /api/permissions | Create a new permission|
|[**deletePermission**](#deletepermission) | **DELETE** /api/permissions/{id} | Delete a permission|
|[**getAllPermissions**](#getallpermissions) | **GET** /api/permissions | Get all permissions|
|[**getCustomPermissions**](#getcustompermissions) | **GET** /api/permissions/custom | Get custom permissions|
|[**getPermissionById**](#getpermissionbyid) | **GET** /api/permissions/{id} | Get permission by ID|
|[**getPermissionByName**](#getpermissionbyname) | **GET** /api/permissions/name/{name} | Get permission by name|
|[**getPermissionsByCategory**](#getpermissionsbycategory) | **GET** /api/permissions/category/{category} | Get permissions by category|
|[**getSystemPermissions**](#getsystempermissions) | **GET** /api/permissions/system | Get system permissions|
|[**updatePermission**](#updatepermission) | **PUT** /api/permissions/{id} | Update a permission|

# **createPermission**
> PermissionDTO createPermission(permissionDTO)

Creates a new custom permission

### Example

```typescript
import {
    PermissionsApi,
    Configuration,
    PermissionDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

let permissionDTO: PermissionDTO; //

const { status, data } = await apiInstance.createPermission(
    permissionDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **permissionDTO** | **PermissionDTO**|  | |


### Return type

**PermissionDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Permission successfully created |  -  |
|**403** | Not authorized to create permissions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deletePermission**
> deletePermission()

Deletes a custom permission

### Example

```typescript
import {
    PermissionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

let id: number; //ID of the permission to delete (default to undefined)

const { status, data } = await apiInstance.deletePermission(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the permission to delete | defaults to undefined|


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
|**204** | Permission successfully deleted |  -  |
|**400** | Cannot delete system permission |  -  |
|**403** | Not authorized to delete permissions |  -  |
|**404** | Permission not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllPermissions**
> Array<PermissionDTO> getAllPermissions()

Returns a list of all permissions

### Example

```typescript
import {
    PermissionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

const { status, data } = await apiInstance.getAllPermissions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<PermissionDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved permissions |  -  |
|**403** | Not authorized to view permissions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCustomPermissions**
> Array<PermissionDTO> getCustomPermissions()

Returns all custom permissions

### Example

```typescript
import {
    PermissionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

const { status, data } = await apiInstance.getCustomPermissions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<PermissionDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved permissions |  -  |
|**403** | Not authorized to view permissions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPermissionById**
> PermissionDTO getPermissionById()

Returns a single permission by ID

### Example

```typescript
import {
    PermissionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

let id: number; //ID of the permission to retrieve (default to undefined)

const { status, data } = await apiInstance.getPermissionById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the permission to retrieve | defaults to undefined|


### Return type

**PermissionDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved permission |  -  |
|**403** | Not authorized to view permissions |  -  |
|**404** | Permission not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPermissionByName**
> PermissionDTO getPermissionByName()

Returns a single permission by name

### Example

```typescript
import {
    PermissionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

let name: string; //Name of the permission to retrieve (default to undefined)

const { status, data } = await apiInstance.getPermissionByName(
    name
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **name** | [**string**] | Name of the permission to retrieve | defaults to undefined|


### Return type

**PermissionDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved permission |  -  |
|**403** | Not authorized to view permissions |  -  |
|**404** | Permission not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPermissionsByCategory**
> Array<PermissionDTO> getPermissionsByCategory()

Returns permissions filtered by category

### Example

```typescript
import {
    PermissionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

let category: string; //Category to filter by (default to undefined)

const { status, data } = await apiInstance.getPermissionsByCategory(
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | [**string**] | Category to filter by | defaults to undefined|


### Return type

**Array<PermissionDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved permissions |  -  |
|**403** | Not authorized to view permissions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSystemPermissions**
> Array<PermissionDTO> getSystemPermissions()

Returns all system permissions

### Example

```typescript
import {
    PermissionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

const { status, data } = await apiInstance.getSystemPermissions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<PermissionDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved permissions |  -  |
|**403** | Not authorized to view permissions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updatePermission**
> PermissionDTO updatePermission(permissionDTO)

Updates an existing custom permission

### Example

```typescript
import {
    PermissionsApi,
    Configuration,
    PermissionDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PermissionsApi(configuration);

let id: number; //ID of the permission to update (default to undefined)
let permissionDTO: PermissionDTO; //

const { status, data } = await apiInstance.updatePermission(
    id,
    permissionDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **permissionDTO** | **PermissionDTO**|  | |
| **id** | [**number**] | ID of the permission to update | defaults to undefined|


### Return type

**PermissionDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Permission successfully updated |  -  |
|**400** | Cannot update system permission |  -  |
|**403** | Not authorized to update permissions |  -  |
|**404** | Permission not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

