# Salary Management System — Relational Database Schema

## Overview

This document contains the baseline relational model for the Salary Management System based on the clarified MVP scope.

The model is intentionally simple, normalized, and focused on:
- employee management
- current salary management
- multi-currency salary storage
- USD-normalized compensation analytics
- approximately 10,000 seeded employees

Authentication/RBAC, payslips, payroll, salary history, and CSV imports are out of scope for the MVP.

## Tables

### 1. employees

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK | Internal employee ID |
| employee_code | VARCHAR | UNIQUE, NOT NULL | Business employee ID |
| first_name | VARCHAR | NOT NULL | First name |
| last_name | VARCHAR | NOT NULL | Last name |
| email | VARCHAR | UNIQUE, NOT NULL | Employee email |
| country_id | INTEGER | FK, NOT NULL | Employee country |
| department_id | INTEGER | FK, NOT NULL | Department |
| designation_id | INTEGER | FK, NOT NULL | Designation |
| created_at | DATETIME | NOT NULL | Creation time |
| updated_at | DATETIME | NOT NULL | Last update time |

Relationships:
- `country_id` → `countries.id`
- `department_id` → `departments.id`
- `designation_id` → `designations.id`

### 2. countries

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK |
| code | VARCHAR(10) | UNIQUE, NOT NULL |
| name | VARCHAR(100) | UNIQUE, NOT NULL |

### 3. departments

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |

### 4. designations

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |

### 5. users

Stores the application's login identity. The MVP assumes a single HR Manager
persona, so this table does not contain roles or permissions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK | User ID |
| employee_id | INTEGER | FK, UNIQUE, NOT NULL | Associated employee |
| email | VARCHAR | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR | NOT NULL | Hashed password |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether login is allowed |
| created_at | DATETIME | NOT NULL | Creation time |
| updated_at | DATETIME | NOT NULL | Last update time |

Relationship:
- `employee_id` → `employees.id`

Business rules:
- Each employee can have at most one login identity.
- Authentication/login may be implemented for the MVP, but there is no
  role-based access control or permission model.
- The application operates as a single pre-defined HR Manager persona.

### 6. employee_salaries

Stores the employee's current salary snapshot. Salary history is not required for the MVP.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK | Salary record ID |
| employee_id | INTEGER | FK, UNIQUE, NOT NULL | Employee |
| base_salary | DECIMAL | NOT NULL | Base salary in native currency |
| bonus | DECIMAL | DEFAULT 0 | Bonus in native currency |
| incentives | DECIMAL | DEFAULT 0 | Incentives in native currency |
| currency_code | VARCHAR(10) | FK, NOT NULL | Employee's native/local salary currency |
| updated_at | DATETIME | NOT NULL | Last salary update time |

Relationships:
- `employee_id` → `employees.id`
- `currency_code` → `exchange_rates.currency_code`

Business rules:
- Each employee has at most one current salary record.
- Salary values are stored in the employee's native/local currency.
- No salary history is maintained in the MVP.

### 7. exchange_rates

Seeded FX rates used to normalize compensation values to USD for organization-wide analytics.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK | Exchange-rate record ID |
| currency_code | VARCHAR(10) | UNIQUE, NOT NULL | Currency code |
| rate_to_usd | DECIMAL | NOT NULL | Value of one unit of the currency in USD |
| effective_date | DATE | NOT NULL | Rate effective date |

Example seeded currencies may include INR, USD, EUR, GBP, AUD, and JPY.

Business rules:
- USD has a rate of `1.00`.
- MVP analytics use the seeded FX rates.
- The USD-normalized salary is derived from salary data and the applicable FX rate rather than stored as duplicated employee data.

## Relationship Summary

```text
countries
    |
    +----< employees >---- departments
              |
              +----> designations
              |
              +----1 employee_salaries
                         |
                         +----> exchange_rates
```

## Initial Indexing Plan

Indexes should support the main directory lookup, filter, salary, and analytics query paths:

- `employees(employee_code)`
- `employees(email)`
- `employees(country_id)`
- `employees(department_id)`
- `employees(designation_id)`
- `users(email)`
- `users(employee_id)`
- `employee_salaries(employee_id)`
- `employee_salaries(currency_code)`
- `exchange_rates(currency_code)`

For common combined directory filters, composite indexes should be evaluated based on the actual query patterns rather than added prematurely.

Name-search indexing should be evaluated separately based on the final SQLite search/query implementation.

## Seed Data

The initial development dataset should contain approximately 10,000 employees.

The seed script should generate:
- countries
- departments
- designations
- employees
- current salary records
- supported currencies and seeded FX rates

The data should have enough variation to exercise:
- pagination
- name and employee ID search
- country/department/designation filters
- salary aggregation
- country/department analytics
- multi-currency USD normalization

Seed data should be deterministic where practical so local development and performance testing are repeatable.

## Analytics

Dashboard analytics should query the existing relational data rather than introduce separate analytics snapshot tables for the MVP.

Examples:
- total employees
- total compensation normalized to USD
- average salary normalized to USD
- employee distribution by country
- employee distribution by department
- salary/compensation distribution by department

USD normalization should be calculated using `employee_salaries` and `exchange_rates`.

## Deliberately Not Included

The following are intentionally excluded from the MVP relational model:

- roles / permissions / RBAC
- payslips
- payroll processing
- tax calculations
- deductions
- salary history
- CSV import tracking
- detailed audit logs
- separate analytics/dashboard snapshot tables
- AI conversation/message tables
- attendance
- recruitment/onboarding
- performance management

AI Q&A, if implemented as an optional stretch feature, should initially use the existing employee, salary, and FX data as its source of truth rather than introducing a separate AI data model.

## Design Principles

- Keep employee master data separate from current salary data.
- Keep login identity in a separate `users` table.
- Keep authentication simple; do not introduce roles or permissions for the MVP.
- Store salary in the employee's native/local currency.
- Keep FX rates in a dedicated seeded table.
- Derive USD-normalized analytics rather than duplicating USD salary values.
- Keep the schema simple and focused on the MVP.
- Use foreign keys, constraints, transactions, and indexes.
- Prefer database-side filtering, search, pagination, and aggregation.
- Avoid premature tables or abstractions for out-of-scope features.
- Keep the schema compatible with a future PostgreSQL migration.
