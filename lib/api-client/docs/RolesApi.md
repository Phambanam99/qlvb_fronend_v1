# RolesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addPermissionToRole**](#addpermissiontorole) | **POST** /api/roles/{roleId}/permissions/{permissionId} | Add permission to role|
|[**createRole**](#createrole) | **POST** /api/roles | Create a new role|
|[**deleteRole**](#deleterole) | **DELETE** /api/roles/{id} | Delete a role|
|[**getAllRoles**](#getallroles) | **GET** /api/roles | Get all roles|
|[**getCustomRoles**](#getcustomroles) | **GET** /api/roles/custom | Get custom roles|
|[**getRoleById**](#getrolebyid) | **GET** /api/roles/{id} | Get role by ID|
|[**getRoleByName**](#getrolebyname) | **GET** /api/roles/name/{name} | Get role by name|
|[**getRolesByCreator**](#getrolesbycreator) | **GET** /api/roles/creator/{creatorId} | Get roles by creator|
|[**getRolesByPermission**](#getrolesbypermission) | **GET** /api/roles/by-permission/{permissionName} | Get roles by permission|
|[**getSystemRoles**](#getsystemroles) | **GET** /api/roles/system | Get system roles|
|[**removePermissionFromRole**](#removepermissionfromrole) | **DELETE** /api/roles/{roleId}/permissions/{permissionId} | Remove permission from role|
|[**updateRole**](#updaterole) | **PUT** /api/roles/{id} | Update a role|

# **addPermissionToRole**
> CustomRoleDTO addPermissionToRole()

Adds a permission to a role

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let roleId: number; //ID of the role (default to undefined)
let permissionId: number; //ID of the permission to add (default to undefined)

const { status, data } = await apiInstance.addPermissionToRole(
    roleId,
    permissionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **roleId** | [**number**] | ID of the role | defaults to undefined|
| **permissionId** | [**number**] | ID of the permission to add | defaults to undefined|


### Return type

**CustomRoleDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Permission successfully added to role |  -  |
|**400** | Cannot modify system role |  -  |
|**403** | Not authorized to modify roles |  -  |
|**404** | Role or permission not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createRole**
> CustomRoleDTO createRole(customRoleDTO)

Creates a new custom role

### Example

```typescript
import {
    RolesApi,
    Configuration,
    CustomRoleDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let customRoleDTO: CustomRoleDTO; //

const { status, data } = await apiInstance.createRole(
    customRoleDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customRoleDTO** | **CustomRoleDTO**|  | |


### Return type

**CustomRoleDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Role successfully created |  -  |
|**403** | Not authorized to create roles |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteRole**
> deleteRole()

Deletes a custom role

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let id: number; //ID of the role to delete (default to undefined)

const { status, data } = await apiInstance.deleteRole(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the role to delete | defaults to undefined|


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
|**204** | Role successfully deleted |  -  |
|**400** | Cannot delete system role |  -  |
|**403** | Not authorized to delete roles |  -  |
|**404** | Role not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllRoles**
> Array<CustomRoleDTO> getAllRoles()

Returns a list of all roles

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

const { status, data } = await apiInstance.getAllRoles();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CustomRoleDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved roles |  -  |
|**403** | Not authorized to view roles |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCustomRoles**
> Array<CustomRoleDTO> getCustomRoles()

Returns all custom roles

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

const { status, data } = await apiInstance.getCustomRoles();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CustomRoleDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved custom roles |  -  |
|**403** | Not authorized to view roles |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRoleById**
> CustomRoleDTO getRoleById()

Returns a single role by ID

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let id: number; //ID of the role to retrieve (default to undefined)

const { status, data } = await apiInstance.getRoleById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the role to retrieve | defaults to undefined|


### Return type

**CustomRoleDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved role |  -  |
|**403** | Not authorized to view roles |  -  |
|**404** | Role not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRoleByName**
> CustomRoleDTO getRoleByName()

Returns a single role by name

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let name: string; //Name of the role to retrieve (default to undefined)

const { status, data } = await apiInstance.getRoleByName(
    name
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **name** | [**string**] | Name of the role to retrieve | defaults to undefined|


### Return type

**CustomRoleDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved role |  -  |
|**403** | Not authorized to view roles |  -  |
|**404** | Role not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRolesByCreator**
> Array<CustomRoleDTO> getRolesByCreator()

Returns roles created by a specific user

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let creatorId: number; //ID of the creator (default to undefined)

const { status, data } = await apiInstance.getRolesByCreator(
    creatorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **creatorId** | [**number**] | ID of the creator | defaults to undefined|


### Return type

**Array<CustomRoleDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved roles |  -  |
|**403** | Not authorized to view roles |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRolesByPermission**
> Array<CustomRoleDTO> getRolesByPermission()

Returns roles that have a specific permission

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let permissionName: string; //Name of the permission (default to undefined)

const { status, data } = await apiInstance.getRolesByPermission(
    permissionName
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **permissionName** | [**string**] | Name of the permission | defaults to undefined|


### Return type

**Array<CustomRoleDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved roles |  -  |
|**403** | Not authorized to view roles |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSystemRoles**
> Array<CustomRoleDTO> getSystemRoles()

Returns all system roles

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

const { status, data } = await apiInstance.getSystemRoles();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CustomRoleDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved system roles |  -  |
|**403** | Not authorized to view roles |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **removePermissionFromRole**
> CustomRoleDTO removePermissionFromRole()

Removes a permission from a role

### Example

```typescript
import {
    RolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let roleId: number; //ID of the role (default to undefined)
let permissionId: number; //ID of the permission to remove (default to undefined)

const { status, data } = await apiInstance.removePermissionFromRole(
    roleId,
    permissionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **roleId** | [**number**] | ID of the role | defaults to undefined|
| **permissionId** | [**number**] | ID of the permission to remove | defaults to undefined|


### Return type

**CustomRoleDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Permission successfully removed from role |  -  |
|**400** | Cannot modify system role |  -  |
|**403** | Not authorized to modify roles |  -  |
|**404** | Role or permission not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateRole**
> CustomRoleDTO updateRole(customRoleDTO)

Updates an existing custom role

### Example

```typescript
import {
    RolesApi,
    Configuration,
    CustomRoleDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new RolesApi(configuration);

let id: number; //ID of the role to update (default to undefined)
let customRoleDTO: CustomRoleDTO; //

const { status, data } = await apiInstance.updateRole(
    id,
    customRoleDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customRoleDTO** | **CustomRoleDTO**|  | |
| **id** | [**number**] | ID of the role to update | defaults to undefined|


### Return type

**CustomRoleDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Role successfully updated |  -  |
|**400** | Cannot update system role |  -  |
|**403** | Not authorized to update roles |  -  |
|**404** | Role not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

