# Salary Management System --- Relational Database Schema

## Overview

This document contains the agreed baseline relational model for the
Salary Management System. It is intentionally focused on the MVP and
keeps the model simple, normalized, and extensible.

The system needs to support employee management, salary management and
history, RBAC, payslips, CSV imports, and approximately 10,000
employees.

## Tables

### 1. employees

  Column           Type       Constraints        Description
  ---------------- ---------- ------------------ ----------------------
  id               INTEGER    PK                 Internal employee ID
  employee_code    VARCHAR    UNIQUE, NOT NULL   Business employee ID
  first_name       VARCHAR    NOT NULL           First name
  last_name        VARCHAR    NOT NULL           Last name
  email            VARCHAR    UNIQUE, NOT NULL   Employee email
  country_id       INTEGER    FK, NOT NULL       Employee country
  department_id    INTEGER    FK, NOT NULL       Department
  designation_id   INTEGER    FK, NOT NULL       Designation
  created_at       DATETIME   NOT NULL           Creation time
  updated_at       DATETIME   NOT NULL           Last update time

Relationships: - country_id -\> countries.id - department_id -\>
departments.id - designation_id -\> designations.id

### 2. countries

  Column   Type           Constraints
  -------- -------------- ------------------
  id       INTEGER        PK
  code     VARCHAR(10)    UNIQUE, NOT NULL
  name     VARCHAR(100)   UNIQUE, NOT NULL

### 3. departments

  Column   Type           Constraints
  -------- -------------- ------------------
  id       INTEGER        PK
  name     VARCHAR(100)   UNIQUE, NOT NULL

### 4. designations

  Column   Type           Constraints
  -------- -------------- ------------------
  id       INTEGER        PK
  name     VARCHAR(100)   UNIQUE, NOT NULL

### 5. salary_records

Salary changes create a new record. Existing salary records are retained
as history.

  Column           Type       Constraints    Description
  ---------------- ---------- -------------- --------------------
  id               INTEGER    PK             Salary record ID
  employee_id      INTEGER    FK, NOT NULL   Employee
  base_salary      DECIMAL    NOT NULL       Base salary in INR
  bonus            DECIMAL    DEFAULT 0      Bonus in INR
  incentives       DECIMAL    DEFAULT 0      Incentives in INR
  effective_from   DATE       NOT NULL       Start of validity
  effective_to     DATE       NULL           End of validity
  created_at       DATETIME   NOT NULL       Creation time
  updated_at       DATETIME   NOT NULL       Last update time

Relationship: - employee_id -\> employees.id

Business rule: - Salary periods for the same employee must not
overlap. - effective_to = NULL represents the current salary record.

### 6. users

Application authentication identity. Kept separate from employee master
data.

  Column          Type       Constraints
  --------------- ---------- ------------------------
  id              INTEGER    PK
  employee_id     INTEGER    FK, UNIQUE, NOT NULL
  email           VARCHAR    UNIQUE, NOT NULL
  password_hash   VARCHAR    NOT NULL
  is_active       BOOLEAN    NOT NULL, DEFAULT TRUE
  created_at      DATETIME   NOT NULL
  updated_at      DATETIME   NOT NULL

Relationship: - employee_id -\> employees.id

### 7. roles

  Column   Type          Constraints
  -------- ------------- ------------------
  id       INTEGER       PK
  name     VARCHAR(50)   UNIQUE, NOT NULL

Initial roles: - HR_MANAGER - EMPLOYEE

### 8. user_roles

Many-to-many relationship between users and roles.

  Column    Type      Constraints
  --------- --------- -------------
  user_id   INTEGER   PK, FK
  role_id   INTEGER   PK, FK

Primary key: - (user_id, role_id)

Relationships: - user_id -\> users.id - role_id -\> roles.id

### 9. permissions

Explicit application permissions.

  Column   Type           Constraints
  -------- -------------- ------------------
  id       INTEGER        PK
  name     VARCHAR(100)   UNIQUE, NOT NULL

Examples: - employee:read - salary:read - salary:create -
salary:update - payslip:read - payslip:create - employee:import

### 10. role_permissions

Many-to-many relationship between roles and permissions.

  Column          Type      Constraints
  --------------- --------- -------------
  role_id         INTEGER   PK, FK
  permission_id   INTEGER   PK, FK

Primary key: - (role_id, permission_id)

Relationships: - role_id -\> roles.id - permission_id -\> permissions.id

### 11. payslips

A payslip stores a snapshot of salary values used when it was generated.

  Column             Type       Constraints
  ------------------ ---------- --------------
  id                 INTEGER    PK
  employee_id        INTEGER    FK, NOT NULL
  salary_record_id   INTEGER    FK, NOT NULL
  pay_period_start   DATE       NOT NULL
  pay_period_end     DATE       NOT NULL
  base_salary        DECIMAL    NOT NULL
  bonus              DECIMAL    DEFAULT 0
  incentives         DECIMAL    DEFAULT 0
  total_amount       DECIMAL    NOT NULL
  generated_at       DATETIME   NOT NULL

Relationships: - employee_id -\> employees.id - salary_record_id -\>
salary_records.id

### 12. import_jobs

Tracks CSV import execution.

  Column            Type       Constraints
  ----------------- ---------- -------------
  id                INTEGER    PK
  file_name         VARCHAR    NOT NULL
  status            VARCHAR    NOT NULL
  total_rows        INTEGER    NOT NULL
  successful_rows   INTEGER    DEFAULT 0
  failed_rows       INTEGER    DEFAULT 0
  started_at        DATETIME   NOT NULL
  completed_at      DATETIME   NULL

Suggested statuses: - PENDING - PROCESSING - COMPLETED - FAILED -
PARTIAL

### 13. import_errors

Stores row-level CSV validation failures.

  Column          Type      Constraints
  --------------- --------- --------------
  id              INTEGER   PK
  import_job_id   INTEGER   FK, NOT NULL
  row_number      INTEGER   NOT NULL
  field           VARCHAR   NULL
  error_message   TEXT      NOT NULL

Relationship: - import_job_id -\> import_jobs.id

## Relationship Summary

``` text
countries
    |
    +----< employees >---- departments
              |
              +----> designations
              |
              +----< salary_records
              |          |
              |          +----< payslips
              |
              +----< payslips
              |
              +---- users
                     |
                     +----< user_roles >---- roles
                                                |
                                                +----< role_permissions >---- permissions

import_jobs
    |
    +----< import_errors
```

## Initial Indexing Plan

Indexes should be added for the main lookup/filter paths:

-   employees(employee_code)
-   employees(email)
-   employees(country_id)
-   employees(department_id)
-   employees(designation_id)
-   salary_records(employee_id)
-   salary_records(employee_id, effective_from)
-   users(email)
-   user_roles(user_id)
-   role_permissions(role_id)
-   payslips(employee_id)
-   payslips(pay_period_start, pay_period_end)

Name-search indexing should be evaluated separately based on the final
SQLite search/query implementation.

## Deliberately Not Included

The following are not part of this initial relational model:

-   detailed audit logs
-   analytics/dashboard snapshot tables
-   AI conversation/message tables
-   attendance
-   recruitment/onboarding
-   performance management

The AI Q&A should initially use the existing employee and salary data as
its source of truth rather than introducing a separate AI data model.

## Design Principles

-   Keep employee master data separate from authentication.
-   Keep salary history immutable from a business perspective; salary
    changes create new records.
-   Treat payslips as historical snapshots.
-   Keep RBAC explicit and extensible.
-   Keep CSV import tracking separate from employee/salary domain data.
-   Use foreign keys, constraints, transactions, and indexes.
-   Keep the schema simple enough for SQLite while avoiding decisions
    that would make a future PostgreSQL migration unnecessarily
    difficult.
