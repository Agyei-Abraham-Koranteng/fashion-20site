# System Design Diagrams

This document contains the system design diagrams for the project, matching the structure of the provided sketch.

## 1. Entity Relationship Diagram (Conceptual)
A simplified view of the core entities and their relationships.

![Conceptual ERD](./conceptual_erd.png)

```mermaid
classDiagram
    direction TB
    class User {
        +UUID id
        +String username
        +String full_name
        +String email
        +String address
    }
    class Order {
        +BigInt id
        +UUID user_id
        +Numeric total_price
        +String status
        +Timestamp created_at
    }
    class Product {
        +BigInt id
        +String name
        +Numeric price
        +Integer stock
        +String description
    }
    class Payment {
        +String transaction_id
        +Numeric amount
        +String payment_method
        +String status
        +Timestamp processed_at
    }

    User "1" --> "*" Order : places
    Order "1" --> "1" Payment : generates
    User "1" --> "*" Payment : makes
    Product "*" -- "*" Order : included_in
```

## 2. Use Case Diagram
Illustrates the interactions between actors (Customer, Admin) and the system.

![Use Case Diagram](./use_case.png)

```mermaid
usecaseDiagram
    actor Customer
    actor Admin

    package "Fashion Store System" {
        usecase "Browse Products" as UC1
        usecase "Add to Cart" as UC2
        usecase "Checkout" as UC3
        usecase "View Order History" as UC4
        
        usecase "Manage Products" as UC5
        usecase "Manage Orders" as UC6
        usecase "View Dashboard" as UC7
    }

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4

    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
```

## 3. Sequence Diagram (Checkout Flow)
Shows the chronological sequence of messages during the checkout process.

![Sequence Diagram](./sequence_diagram.png)

```mermaid
sequenceDiagram
    actor Consumer
    participant System
    participant PaymentGateway

    Consumer->>System: Add Item to Cart
    System-->>Consumer: Cart Updated
    Consumer->>System: Proceed to Checkout
    System-->>Consumer: Request Payment Details
    Consumer->>System: Submit Payment & Order
    System->>PaymentGateway: Process Transaction
    PaymentGateway-->>System: Transaction Successful
    System-->>Consumer: Order Confirmed
    System->>System: Send Confirmation Email
```

## 4. Customer Journey Flow (UI Map)
Represents the user's navigation flow through the application interface.

![Customer Journey](./customer_journey.png)

```mermaid
graph TD
    Start((Start)) --> Home[Homepage]
    Home --> Products[Product Listing]
    Products --> Detail[Product Detail]
    Detail --> Cart[Shopping Cart]
    Cart --> Checkout[Checkout Page]
    Checkout --> Payment[Payment Processing]
    Payment --> Success{Success?}
    Success -- Yes --> Confirmation[Order Confirmation]
    Success -- No --> Checkout
    Confirmation --> Dashboard[User Dashboard]
```
