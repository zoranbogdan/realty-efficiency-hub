# Internal Linking Scheme

This table defines the current internal-linking pattern for blog articles.

| Article Path | Content Type | Primary Hub Link | Same-Cluster Links (Examples) | Cross-Pillar Bridge |
| --- | --- | --- | --- | --- |
| `/blog/real-estate-listing-description-prompts` | Prompt Guide | `/ai-prompts` | `real-estate-email-prompts`, `social-media-prompts-realtors`, `open-house-follow-up-prompts`, `property-tour-script-prompts` | `cold-outreach-prompts-realtors` |
| `/blog/real-estate-email-prompts` | Prompt Guide | `/ai-prompts` | `real-estate-listing-description-prompts`, `open-house-follow-up-prompts`, `social-media-prompts-realtors` | `realtor-email-automation` |
| `/blog/open-house-follow-up-prompts` | Prompt Guide | `/ai-prompts` | `real-estate-listing-description-prompts`, `real-estate-email-prompts` | `open-house-lead-automation` |
| `/blog/open-house-marketing-prompts` | Prompt Guide | `/ai-prompts` | `open-house-follow-up-prompts`, `real-estate-email-prompts`, `real-estate-marketing-prompts` | `open-house-lead-automation` |
| `/blog/real-estate-marketing-prompts` | Prompt Guide | `/ai-prompts` | `social-media-prompts-realtors`, `real-estate-email-prompts`, `real-estate-listing-description-prompts` | `realtor-email-automation` |
| `/blog/social-media-prompts-realtors` | Prompt Guide | `/ai-prompts` | `real-estate-listing-description-prompts`, `real-estate-email-prompts`, `real-estate-marketing-prompts` | `cold-outreach-prompts-realtors` |
| `/blog/real-estate-follow-up-text-prompts` | Prompt Guide | `/ai-prompts` | `real-estate-listing-description-prompts`, `open-house-marketing-prompts`, `open-house-follow-up-prompts` | `real-estate-lead-follow-up-automation` |
| `/blog/cold-outreach-prompts-realtors` | Prompt Guide | `/ai-prompts` | `real-estate-email-prompts`, `real-estate-follow-up-text-prompts`, `social-media-prompts-realtors` | `real-estate-lead-follow-up-automation` |
| `/blog/real-estate-buyer-qualification-prompts` | Prompt Guide | `/ai-prompts` | `real-estate-follow-up-text-prompts`, `real-estate-email-prompts`, `cold-outreach-prompts-realtors` | `real-estate-lead-qualification-automation` |
| `/blog/property-tour-script-prompts` | Prompt Guide | `/ai-prompts` | `real-estate-buyer-qualification-prompts`, `real-estate-follow-up-text-prompts`, `cold-outreach-prompts-realtors` | `open-house-lead-automation` |
| `/blog/real-estate-lead-follow-up-automation` | Workflow Guide | `/automation-workflows` | `realtor-email-automation`, `real-estate-lead-qualification-automation` | `real-estate-follow-up-text-prompts`, `cold-outreach-prompts-realtors` |
| `/blog/realtor-email-automation` | Workflow Guide | `/automation-workflows` | `real-estate-lead-follow-up-automation`, `real-estate-lead-qualification-automation` | `real-estate-email-prompts`, `real-estate-follow-up-text-prompts` |
| `/blog/real-estate-lead-qualification-automation` | Workflow Guide | `/automation-workflows` | `real-estate-lead-follow-up-automation`, `realtor-email-automation` | `real-estate-buyer-qualification-prompts`, `real-estate-follow-up-text-prompts` |
| `/blog/open-house-lead-automation` | Workflow Guide | `/automation-workflows` | `real-estate-lead-follow-up-automation`, `real-estate-lead-qualification-automation`, `realtor-email-automation` | `open-house-follow-up-prompts` |

## Pattern Rules

- Every article links to its pillar hub (`/ai-prompts` or `/automation-workflows`).
- Every article links to at least 2 same-cluster related articles.
- Every article links to at least 1 cross-pillar bridge article when relevant.
- Related links are placed near the end of each article for consistent UX.
