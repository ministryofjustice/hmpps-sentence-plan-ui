The About Person page at /about has quite a lot of logic powering it. This is how it works:

## Sentence information

The table of sentence info at the top is powered by data from nDelius.

The data is requested through this chain:

AboutPersonController.ts -> HTTP GET to `/info/pop` -> Sentence Plan API -> ARNSApiService.kt -> HTTP GET to `delius-api.base-url`

## Assessment information

The Assessment information is constructed from a combination of

1. the criminogenic needs in the session that were provided by OASys (the Handover service when running in local/dev environments)
2. assessment data from the SAN application (wiremock when running in the local environment using [wiremock/mappings/assessment.json](../wiremock/mappings/assessment.json))

Once it has been retrieved, these two data sets are passed to `formatAssessmentData` in `assessmentUtils.ts` which takes these steps:

1. Creates a new `AssessmentArea` for each assessment area using `getAssessmentDetailsForArea`, resulting in an array of `AssessmentArea` objects
2. Decides whether the Assessment is complete or not based on whether any of the `AssessmentArea`s is incomplete.
3. Groups the `AssessmentArea`s based on a set of defined criteria
4. Sorts each group according to its own rules

Once returned, this data in handed off to `about.njk` in the normal way and rendered. The `getAssessmentDetailsForArea` is also used for creating the data used in the `_area-assessment-summary` macro used at the top of the 'Create goal', 'Change goal' and 'Add/change steps' pages.

### getAssessmentDetailsForArea

This function uses the criminogenic needs to decide whether particular flags such as "Risk of serious harm" have been set, and then based on the value of that flag pulls the relevant data field from the SAN assessment data.

If the value of each of those flags has not been set then this function marks this AssessmentArea as not started.

The SAN assessment data directly tells us if each section is complete or not.

### Grouping AssessmentAreas

We always have three groups, displayed on the /about page in this order:

1. High scoring areas - where the risk score is above the risk threshold
2. Low scoring - where the risk score is below the risk threshold
3. No score - where the score is undefined, called `otherUnsorted`

In addition, if any of the AssessmentArea objects is incomplete then the we also create an "incomplete areas" group, which gets displayed above the others.

There is additional handling for a group called `emptyAreas` where we have received incomplete criminogenic needs data from OASys. This handling was added during development due to bugs in the data provisioning API.

### Sorting data in AssessmentArea groups

Within the high and low scoring groups the areas are sorted by the distance between the score and the threshold so that areas with scores much higher than the risk threshold appear first. Where distances between score and threshold are the same we sort alphabetically.

Within the "no score" group we sort it by areas linked to harm first, then linked to reoffending and then alphabetically.

The emptyAreas group is sorted alphabetically.

## Error handling

Error handling is dealt with at the controller level in AboutController.ts; if any of the data retrieval or processing steps listed above fail then it will either render the /about page with an error message, or the user will be redirected to the generic HTTP 500 error page.

## Testing the About page

There are unit tests covering assessmentUtils.ts and AboutController.ts which have decent coverage.

There are some cypress tests for the About page but they are minimal and a "best effort" reflection of the real application since there is no join-up with OASys.

There are a number of integration tests in https://github.com/ministryofjustice/hmpps-arns-integrations-test-playwright-poc/tree/main/tests which run against the Test environment and do test the end-end journey of making changes in SAN and then making sure they are correctly displayed in Sentence Plan. The Test environment uses a real OASys install called T2.

All other tests are manual; testing scenarios are described in the Testing area of Confluence.
