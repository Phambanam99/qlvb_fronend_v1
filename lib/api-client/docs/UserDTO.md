# UserDTO

User registration details

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uid** | **number** |  | [optional] [default to undefined]
**username** | **string** |  | [optional] [default to undefined]
**pass** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**mail** | **string** |  | [optional] [default to undefined]
**status** | **number** |  | [optional] [default to undefined]
**userStatus** | **string** |  | [optional] [default to undefined]
**created** | **string** |  | [optional] [default to undefined]
**lastAccess** | **string** |  | [optional] [default to undefined]
**lastLogin** | **string** |  | [optional] [default to undefined]
**roles** | **Set&lt;string&gt;** |  | [optional] [default to undefined]
**userRoles** | **Set&lt;string&gt;** |  | [optional] [default to undefined]
**statusDisplayName** | **string** |  | [optional] [default to undefined]
**roleDisplayNames** | **Set&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { UserDTO } from './api';

const instance: UserDTO = {
    uid,
    username,
    pass,
    name,
    email,
    mail,
    status,
    userStatus,
    created,
    lastAccess,
    lastLogin,
    roles,
    userRoles,
    statusDisplayName,
    roleDisplayNames,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
