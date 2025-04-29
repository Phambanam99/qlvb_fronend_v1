# UserManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteUser**](#deleteuser) | **DELETE** /api/users/{id} | Delete user|
|[**getAllUsers**](#getallusers) | **GET** /api/users | Get all users|
|[**getAvailableRoles**](#getavailableroles) | **GET** /api/users/roles | Get available user roles|
|[**getAvailableStatuses**](#getavailablestatuses) | **GET** /api/users/statuses | Get available user statuses|
|[**getUserById**](#getuserbyid) | **GET** /api/users/{id} | Get user by ID|
|[**getUserByUsername**](#getuserbyusername) | **GET** /api/users/username/{username} | Get user by username|
|[**getUsersByFilter**](#getusersbyfilter) | **GET** /api/users/filter | Get users by role or status|
|[**updatePassword**](#updatepassword) | **PUT** /api/users/{id}/password | Update user password|
|[**updateUser**](#updateuser) | **PUT** /api/users/{id} | Update user|

# **deleteUser**
> deleteUser()

Deletes a user by ID. Requires ADMIN role.

### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let id: number; //ID of the user to delete (default to undefined)

const { status, data } = await apiInstance.deleteUser(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the user to delete | defaults to undefined|


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
|**204** | User successfully deleted |  -  |
|**403** | Not authorized to delete users |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllUsers**
> Array<UserDTO> getAllUsers()

Returns a list of all users. Requires ADMIN role.

### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

const { status, data } = await apiInstance.getAllUsers();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<UserDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved all users |  -  |
|**403** | Not authorized to view users |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAvailableRoles**
> { [key: string]: string; } getAvailableRoles()

Returns all available user roles with their codes and display names. Useful for UI dropdowns.

### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

const { status, data } = await apiInstance.getAvailableRoles();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: string; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAvailableStatuses**
> { [key: string]: string; } getAvailableStatuses()

Returns all available user statuses with their values and display names. Useful for UI dropdowns.

### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

const { status, data } = await apiInstance.getAvailableStatuses();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: string; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserById**
> UserDTO getUserById()

Returns a single user by ID. Requires ADMIN role or to be the user requested.

### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let id: number; //ID of the user to retrieve (default to undefined)

const { status, data } = await apiInstance.getUserById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the user to retrieve | defaults to undefined|


### Return type

**UserDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved user |  -  |
|**403** | Not authorized to view this user |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserByUsername**
> UserDTO getUserByUsername()

Returns a single user by username. Requires ADMIN role or to be the user requested.

### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let username: string; //Username of the user to retrieve (default to undefined)

const { status, data } = await apiInstance.getUserByUsername(
    username
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **username** | [**string**] | Username of the user to retrieve | defaults to undefined|


### Return type

**UserDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved user |  -  |
|**403** | Not authorized to view this user |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUsersByFilter**
> Array<UserDTO> getUsersByFilter()

Returns a filtered list of users by role and/or status. Requires ADMIN role.

### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let role: 'ADMIN' | 'USER' | 'EDITOR' | 'DEPARTMENT_HEAD' | 'DEPUTY_DEPARTMENT_HEAD' | 'BUREAU_CHIEF' | 'DEPUTY_BUREAU_CHIEF' | 'STAFF' | 'SECRETARY' | 'CLERK'; //Role to filter by. Can be either role code (ROLE_ADMIN), display name (Trưởng phòng), or enum name (DEPARTMENT_HEAD). See /api/users/roles endpoint for available roles. (optional) (default to undefined)
let status: 'INACTIVE' | 'ACTIVE' | 'BLOCKED' | 'PENDING_APPROVAL'; //Status to filter by. Can be status value (0,1,2,3), display name (Active), or enum name (ACTIVE). See /api/users/statuses endpoint for available statuses. (optional) (default to undefined)

const { status, data } = await apiInstance.getUsersByFilter(
    role,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **role** | [**&#39;ADMIN&#39; | &#39;USER&#39; | &#39;EDITOR&#39; | &#39;DEPARTMENT_HEAD&#39; | &#39;DEPUTY_DEPARTMENT_HEAD&#39; | &#39;BUREAU_CHIEF&#39; | &#39;DEPUTY_BUREAU_CHIEF&#39; | &#39;STAFF&#39; | &#39;SECRETARY&#39; | &#39;CLERK&#39;**]**Array<&#39;ADMIN&#39; &#124; &#39;USER&#39; &#124; &#39;EDITOR&#39; &#124; &#39;DEPARTMENT_HEAD&#39; &#124; &#39;DEPUTY_DEPARTMENT_HEAD&#39; &#124; &#39;BUREAU_CHIEF&#39; &#124; &#39;DEPUTY_BUREAU_CHIEF&#39; &#124; &#39;STAFF&#39; &#124; &#39;SECRETARY&#39; &#124; &#39;CLERK&#39;>** | Role to filter by. Can be either role code (ROLE_ADMIN), display name (Trưởng phòng), or enum name (DEPARTMENT_HEAD). See /api/users/roles endpoint for available roles. | (optional) defaults to undefined|
| **status** | [**&#39;INACTIVE&#39; | &#39;ACTIVE&#39; | &#39;BLOCKED&#39; | &#39;PENDING_APPROVAL&#39;**]**Array<&#39;INACTIVE&#39; &#124; &#39;ACTIVE&#39; &#124; &#39;BLOCKED&#39; &#124; &#39;PENDING_APPROVAL&#39;>** | Status to filter by. Can be status value (0,1,2,3), display name (Active), or enum name (ACTIVE). See /api/users/statuses endpoint for available statuses. | (optional) defaults to undefined|


### Return type

**Array<UserDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved filtered users |  -  |
|**403** | Not authorized to view users |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updatePassword**
> object updatePassword(requestBody)

Updates a user\'s password. Requires ADMIN role or to be the user being updated.

### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let id: number; //ID of the user to update password (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.updatePassword(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: string; }**|  | |
| **id** | [**number**] | ID of the user to update password | defaults to undefined|


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
|**200** | Password successfully updated |  -  |
|**400** | Invalid password provided |  -  |
|**403** | Not authorized to update this user\&#39;s password |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateUser**
> UserDTO updateUser(userDTO)

Updates a user\'s information. Requires ADMIN role or to be the user being updated.

### Example

```typescript
import {
    UserManagementApi,
    Configuration,
    UserDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let id: number; //ID of the user to update (default to undefined)
let userDTO: UserDTO; //

const { status, data } = await apiInstance.updateUser(
    id,
    userDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userDTO** | **UserDTO**|  | |
| **id** | [**number**] | ID of the user to update | defaults to undefined|


### Return type

**UserDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User successfully updated |  -  |
|**403** | Not authorized to update this user |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

