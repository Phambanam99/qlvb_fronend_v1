# CustomRoleDTO

Role details

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**systemRole** | **boolean** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**updatedAt** | **string** |  | [optional] [default to undefined]
**createdById** | **number** |  | [optional] [default to undefined]
**createdByName** | **string** |  | [optional] [default to undefined]
**permissions** | [**Set&lt;PermissionDTO&gt;**](PermissionDTO.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CustomRoleDTO } from './api';

const instance: CustomRoleDTO = {
    id,
    name,
    description,
    systemRole,
    createdAt,
    updatedAt,
    createdById,
    createdByName,
    permissions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
