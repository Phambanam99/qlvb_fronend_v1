# SendersApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSender**](#createsender) | **POST** /api/senders | Create new sender|
|[**deleteSender**](#deletesender) | **DELETE** /api/senders/{id} | Delete sender|
|[**getAllSenders**](#getallsenders) | **GET** /api/senders | Get all senders|
|[**getSenderById**](#getsenderbyid) | **GET** /api/senders/{id} | Get sender by ID|
|[**updateSender**](#updatesender) | **PUT** /api/senders/{id} | Update sender|

# **createSender**
> SenderDTO createSender(senderDTO)

Creates a new sender organization

### Example

```typescript
import {
    SendersApi,
    Configuration,
    SenderDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new SendersApi(configuration);

let senderDTO: SenderDTO; //

const { status, data } = await apiInstance.createSender(
    senderDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **senderDTO** | **SenderDTO**|  | |


### Return type

**SenderDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Sender successfully created |  -  |
|**403** | Not authorized to create senders |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteSender**
> deleteSender()

Deletes a sender by ID

### Example

```typescript
import {
    SendersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SendersApi(configuration);

let id: number; //ID of the sender to delete (default to undefined)

const { status, data } = await apiInstance.deleteSender(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the sender to delete | defaults to undefined|


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
|**204** | Sender successfully deleted |  -  |
|**403** | Not authorized to delete senders |  -  |
|**404** | Sender not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllSenders**
> Array<SenderDTO> getAllSenders()

Returns a list of all document sender organizations

### Example

```typescript
import {
    SendersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SendersApi(configuration);

const { status, data } = await apiInstance.getAllSenders();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<SenderDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved senders list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSenderById**
> SenderDTO getSenderById()

Returns a sender by ID

### Example

```typescript
import {
    SendersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SendersApi(configuration);

let id: number; //ID of the sender to retrieve (default to undefined)

const { status, data } = await apiInstance.getSenderById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ID of the sender to retrieve | defaults to undefined|


### Return type

**SenderDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved sender |  -  |
|**404** | Sender not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSender**
> SenderDTO updateSender(senderDTO)

Updates an existing sender organization

### Example

```typescript
import {
    SendersApi,
    Configuration,
    SenderDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new SendersApi(configuration);

let id: number; //ID of the sender to update (default to undefined)
let senderDTO: SenderDTO; //

const { status, data } = await apiInstance.updateSender(
    id,
    senderDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **senderDTO** | **SenderDTO**|  | |
| **id** | [**number**] | ID of the sender to update | defaults to undefined|


### Return type

**SenderDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Sender successfully updated |  -  |
|**403** | Not authorized to update senders |  -  |
|**404** | Sender not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

