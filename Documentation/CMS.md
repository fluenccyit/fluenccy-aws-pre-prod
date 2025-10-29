# Dashboard

Table showing MAX and MIN rows - values are populated from the response's data.cmsEntitlements.orgEntitlementItems which is an array with fields max and min. The table's columns are dynamic and mapped to the number of array elements in the array. The title of the column is the field "name" + Month(s)

### /api/orgEntitlement/get-cms-entitlements

##### REQUEST:
```
{
  "orgId": "org_3beffec3-cc2b-4397-ad65-53ea71bc8634",
  "mode": null
}
```

##### RESPONSE:
```
{
    "status": "SUCCESS",
    "statusCode": 200,
    "message": "",
    "data": {
        "cmsEntitlements": [
            {
                "id": 10,
                "currencyCode": "USD",
                "orgId": "org_3beffec3-cc2b-4397-ad65-53ea71bc8634",
                "createdBy": null,
                "updatedBy": null,
                "created_at": "2024-06-24T19:12:32.702Z",
                "updated_at": "2024-06-24T19:12:32.702Z",
                "pricingOption1Label": null,
                "pricingOption2Label": null,
                "pricingOption3Label": null,
                "orgEntitlementItems": [
                    {
                        "id": 83,
                        "name": "1",
                        "max": "90.00000",
                        "min": "80.00000",
                        "crm_entitlements_id": 10,
                        "text": null
                    },
                    {
                        "id": 84,
                        "name": "2",
                        "max": "80.00000",
                        "min": "70.00000",
                        "crm_entitlements_id": 10,
                        "text": null
                    },
                    {
                        "id": 85,
                        "name": "3",
                        "max": "70.00000",
                        "min": "65.00000",
                        "crm_entitlements_id": 10,
                        "text": null
                    }
                ]
            }
        ]
    }
}
```

---

Another table is populated based on the response from the following API:

## /api/cms/get-entries
##### REQUEST:
```
{
  "orgId": "org_3beffec3-cc2b-4397-ad65-53ea71bc8634",
  "currencyCode": "USD",
  "orgCurrency": "AUD",
  "type": "unmanaged"
}
```

##### RESPONSE:
```
{
    "status": "SUCCESS",
    "statusCode": 200,
    "message": "",
    "data": {
        "entries": [
            {
                "id": 538,
                "crm_import_log_id": "log_00941562-7ec3-40f7-89a1-3d374bd316bf",
                "orgId": "org_3beffec3-cc2b-4397-ad65-53ea71bc8634",
                "month": "JULY",
                "year": "2026",
                "forecaseAmount": "30000.00",
                "budgetRate": "0.65000",
                "currencyCode": "USD",
                "reservedMin": null,
                "reservedMax": null,
                "reservedAmount": null,
                "isManaged": false,
                "manage_type": null,
                "isApproved": false,
                "reservedRate": null,
                "currentRate": null,
                "createdBy": "usr_06323fee-1c7f-11ed-861d-0242ac120002",
                "updatedBy": "usr_06323fee-1c7f-11ed-861d-0242ac120002",
                "created_at": "2025-10-20T09:39:16.412Z",
                "updated_at": "2025-10-20T09:39:16.412Z",
                "totalReservedAmount": "0.00",
                "mode": null,
                "feedbacks": []
            },
            {
                "id": 467,
                "crm_import_log_id": "log_361ffc2f-f6ac-4402-ad01-2d55beefda96",
                "orgId": "org_3beffec3-cc2b-4397-ad65-53ea71bc8634",
                "month": "JUNE",
                "year": "2026",
                "forecaseAmount": "500000.00",
                "budgetRate": "0.65000",
                "currencyCode": "USD",
                "reservedMin": null,
                "reservedMax": null,
                "reservedAmount": null,
                "isManaged": false,
                "manage_type": null,
                "isApproved": false,
                "reservedRate": null,
                "currentRate": null,
                "createdBy": "usr_06323fee-1c7f-11ed-861d-0242ac120002",
                "updatedBy": "usr_06323fee-1c7f-11ed-861d-0242ac120002",
                "created_at": "2025-08-29T05:12:07.022Z",
                "updated_at": "2025-08-29T05:12:07.022Z",
                "totalReservedAmount": "0.00",
                "mode": null,
                "feedbacks": []
            }
        ],
        "marginPercentage": [
            {
                "forwardMarginPercentage": "0.10",
                "limitOrderMarginPercentage": "0.10",
                "spotMarginPercentage": "0.10",
                "orderProbability": "70.00",
                "minimumProbability": "60.00",
                "maximumProbability": "80.00",
                "marginPercentage": "0.10",
                "setOptimised": true
            }
        ],
        "forwardPoints": []
    }
}
```

Table's column to response data mapping:

Forecast Amount
Reserved
Reserve Rate
Reserve Max
Reserve Min
Budget Rate
Current Rate
Amount to Max
Gain/loss
Amount to Min
Gain/loss
Actions

---

## Import

Clicking the Upload your files calls the following API:

#### /api/import/file

REQUEST:
```
{
  "tenantId": "dd53ee5c-ba53-42ee-b543-b9ddbaa69c03",
  "orgId": "org_3beffec3-cc2b-4397-ad65-53ea71bc8634",
  "isInCMS": true,
  "isHedging": false,
  "file": binary-data
}
```

RESPONSE:

```
{"status":"SUCCESS","statusCode":200,"message":"","data":[]}
```

Import Data Logs table is populated with the following API call:

#### /api/import/logs

REQUEST:
```
{
  "tenantId": "dd53ee5c-ba53-42ee-b543-b9ddbaa69c03",
  "orgId": "org_3beffec3-cc2b-4397-ad65-53ea71bc8634",
  "isInCMS": true,
  "isHedging": false,
  "mode": ""
}
```

RESPONSE:
```
{
    "status": "SUCCESS",
    "statusCode": 200,
    "message": "",
    "data": [
        {
            "id": "log_5616ec78-845d-46c1-aec5-10ef448cc0cc",
            "fileType": "CSV",
            "filename": "currency manager.csv",
            "review_status": "Uploaded",
            "createdBy": "usr_06323fee-1c7f-11ed-861d-0242ac120002",
            "updatedBy": "usr_06323fee-1c7f-11ed-861d-0242ac120002",
            "created_at": "2025-10-27T06:44:43.475Z",
            "updated_at": "2025-10-27T06:44:43.475Z"
        },
        {
            "id": "log_00941562-7ec3-40f7-89a1-3d374bd316bf",
            "fileType": "CSV",
            "filename": "currency manager.csv",
            "review_status": "Imported",
            "createdBy": "usr_06323fee-1c7f-11ed-861d-0242ac120002",
            "updatedBy": "usr_06323fee-1c7f-11ed-861d-0242ac120002",
            "created_at": "2025-10-20T09:29:14.065Z",
            "updated_at": "2025-10-20T09:39:16.414Z"
        }
    ]
}
```
