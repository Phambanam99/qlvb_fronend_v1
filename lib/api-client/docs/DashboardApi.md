# DashboardApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getDashboardStatistics**](#getdashboardstatistics) | **GET** /api/dashboard | Get dashboard statistics|
|[**getDepartmentPerformanceReport**](#getdepartmentperformancereport) | **GET** /api/dashboard/reports/department-performance | Get department performance report|
|[**getDocumentActivities**](#getdocumentactivities) | **GET** /api/dashboard/document-activities/{documentId} | Get document activity logs|
|[**getDocumentCountsByMonth**](#getdocumentcountsbymonth) | **GET** /api/dashboard/document-counts-by-month | Get document counts by month|
|[**getDocumentCountsByType**](#getdocumentcountsbytype) | **GET** /api/dashboard/document-types | Get document counts by type|
|[**getDocumentVolumeReport**](#getdocumentvolumereport) | **GET** /api/dashboard/reports/document-volume | Get document volume report|
|[**getProcessingTimeStatistics**](#getprocessingtimestatistics) | **GET** /api/dashboard/processing-times | Get document processing time statistics|
|[**getRecentActivities**](#getrecentactivities) | **GET** /api/dashboard/recent-activities | Get recent activity logs|
|[**getTopActiveUsers**](#gettopactiveusers) | **GET** /api/dashboard/top-users | Get top active users|
|[**getUserActivities**](#getuseractivities) | **GET** /api/dashboard/user-activities/{userId} | Get user activity logs|

# **getDashboardStatistics**
> DashboardDTO getDashboardStatistics()

Returns statistics for the dashboard

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

const { status, data } = await apiInstance.getDashboardStatistics();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DashboardDTO**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved dashboard statistics |  -  |
|**403** | Not authorized to access dashboard |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDepartmentPerformanceReport**
> { [key: string]: object; } getDepartmentPerformanceReport()

Returns performance metrics by department

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

const { status, data } = await apiInstance.getDepartmentPerformanceReport();
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
|**200** | Successfully retrieved department performance report |  -  |
|**403** | Not authorized to access reports |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentActivities**
> Array<ActivityLogDTO> getDocumentActivities()

Returns activity logs for a specific document

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

let documentId: number; //ID of the document (default to undefined)

const { status, data } = await apiInstance.getDocumentActivities(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] | ID of the document | defaults to undefined|


### Return type

**Array<ActivityLogDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved document activity logs |  -  |
|**403** | Not authorized to access document activity logs |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentCountsByMonth**
> { [key: string]: number; } getDocumentCountsByMonth()

Returns document counts grouped by month within a date range

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

let start: string; //Start date (ISO format) (default to undefined)
let end: string; //End date (ISO format) (default to undefined)

const { status, data } = await apiInstance.getDocumentCountsByMonth(
    start,
    end
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **start** | [**string**] | Start date (ISO format) | defaults to undefined|
| **end** | [**string**] | End date (ISO format) | defaults to undefined|


### Return type

**{ [key: string]: number; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved document counts |  -  |
|**403** | Not authorized to access statistics |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentCountsByType**
> { [key: string]: number; } getDocumentCountsByType()

Returns document counts grouped by document type

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

const { status, data } = await apiInstance.getDocumentCountsByType();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: number; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved document counts |  -  |
|**403** | Not authorized to access statistics |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocumentVolumeReport**
> { [key: string]: object; } getDocumentVolumeReport()

Returns a comprehensive report on document volumes

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

let start: string; //Start date (ISO format) (default to undefined)
let end: string; //End date (ISO format) (default to undefined)

const { status, data } = await apiInstance.getDocumentVolumeReport(
    start,
    end
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **start** | [**string**] | Start date (ISO format) | defaults to undefined|
| **end** | [**string**] | End date (ISO format) | defaults to undefined|


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
|**200** | Successfully retrieved document volume report |  -  |
|**403** | Not authorized to access reports |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getProcessingTimeStatistics**
> { [key: string]: number; } getProcessingTimeStatistics()

Returns statistics about document processing times

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

const { status, data } = await apiInstance.getProcessingTimeStatistics();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: number; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved processing time statistics |  -  |
|**403** | Not authorized to access statistics |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRecentActivities**
> Array<ActivityLogDTO> getRecentActivities()

Returns the most recent activity logs

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

let page: number; //Page number (optional) (default to 0)
let size: number; //Page size (optional) (default to 20)

const { status, data } = await apiInstance.getRecentActivities(
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | Page number | (optional) defaults to 0|
| **size** | [**number**] | Page size | (optional) defaults to 20|


### Return type

**Array<ActivityLogDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved activity logs |  -  |
|**403** | Not authorized to access activity logs |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTopActiveUsers**
> Array<UserActivityDTO> getTopActiveUsers()

Returns the most active users with their activity statistics

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

let limit: number; //Number of users to return (optional) (default to 10)

const { status, data } = await apiInstance.getTopActiveUsers(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] | Number of users to return | (optional) defaults to 10|


### Return type

**Array<UserActivityDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved user activity statistics |  -  |
|**403** | Not authorized to access user statistics |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserActivities**
> Array<ActivityLogDTO> getUserActivities()

Returns activity logs for a specific user

### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

let userId: number; //ID of the user (default to undefined)

const { status, data } = await apiInstance.getUserActivities(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] | ID of the user | defaults to undefined|


### Return type

**Array<ActivityLogDTO>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/hal+json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully retrieved user activity logs |  -  |
|**403** | Not authorized to access user activity logs |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

