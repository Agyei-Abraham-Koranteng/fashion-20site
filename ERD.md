# Entity Relationship Diagram

This diagram represents the database structure based on the `shared/schema.ts` file.

![Entity Relationship Diagram](./ERD.png)

```mermaid
erDiagram
    profiles ||--o{ orders : "places"
    profiles ||--o{ reviews : "writes"
    categories ||--o{ products : "contains"
    products ||--o{ order_items : "included_in"
    orders ||--o{ order_items : "contains"
    products ||--o{ reviews : "has"

    profiles {
        uuid id PK
        string username
        string full_name
        string avatar_url
        boolean is_admin
        timestamp updated_at
    }

    products {
        bigint id PK
        string name
        string description
        numeric price
        string image
        string image_url
        uuid category_id FK
        integer stock
        jsonb sizes
        jsonb colors
        timestamp created_at
        timestamp updated_at
    }

    categories {
        uuid id PK
        string name
        string slug
        string description
        string image_url
        timestamp created_at
    }

    orders {
        bigint id PK
        uuid user_id FK
        string status
        numeric total_price
        jsonb shipping_address
        jsonb billing_address
        text notes
        timestamp created_at
        timestamp updated_at
    }

    order_items {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        integer quantity
        numeric price
    }

    reviews {
        bigint id PK
        bigint product_id FK
        uuid user_id FK
        integer rating
        string title
        text comment
        integer helpful_count
        timestamp created_at
        timestamp updated_at
    }

    cms_content {
        bigint id PK
        string key
        jsonb content
        timestamp updated_at
        string updated_by
    }

    contact_messages {
        bigint id PK
        string name
        string email
        string subject
        text message
        string status
        timestamp created_at
        timestamp updated_at
    }
```

## Tables Overview

- **profiles**: User profiles, likely linked to Supabase Auth.
- **products**: Items available for sale.
- **categories**: Product categories.
- **orders**: Customer orders.
- **order_items**: Individual items within an order (Pivot table between Orders and Products).
- **reviews**: Product reviews left by users.
- **cms_content**: Dynamic content for the CMS (Content Management System).
- **contact_messages**: Messages submitted via the contact form.
