# TestApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**publicEndpoint**](#publicendpoint) | **GET** /api/test/public | Public endpoint|
|[**testAuth**](#testauth) | **GET** /api/test/auth | Test authentication|

# **publicEndpoint**
> object publicEndpoint()

A public endpoint that doesn\'t require authentication

### Example

```typescript
import {
    TestApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TestApi(configuration);

const { status, data } = await apiInstance.publicEndpoint();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **testAuth**
> object testAuth()

Returns information about the current authenticated user

### Example

```typescript
import {
    TestApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TestApi(configuration);

const { status, data } = await apiInstance.testAuth();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | Successfully authenticated |  -  |
|**401** | Not authenticated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

