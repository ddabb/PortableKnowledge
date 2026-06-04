---
title: SQL多表连接
description: SQL多表连接是SQL核心技能，包括INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL JOIN等连接方式
category: 01_技术IT领域/数据分析师
tags:
  - 数据分析师
  - SQL
  - 多表连接
  - JOIN
  - 数据分析
---

# SQL多表连接

## 定义

SQL多表连接（JOIN）是指将两个或多个表**基于相关列**组合起来，以便进行跨表查询和分析。

对于数据分析师而言，多表连接是**最核心的SQL技能**，因为实际业务数据通常分散在多个表中。

---

## 核心概念

### 1. 常见连接方式

| 连接方式 | 说明 | 图示 |
|----------|------|------|
| **INNER JOIN（内连接）** | 只返回两个表中匹配的行 | A ∩ B |
| **LEFT JOIN（左连接）** | 返回左表所有行，右表无匹配则填充NULL | A全量 |
| **RIGHT JOIN（右连接）** | 返回右表所有行，左表无匹配则填充NULL | B全量 |
| **FULL JOIN（全连接）** | 返回两个表所有行，无匹配则填充NULL | A ∪ B |
| **CROSS JOIN（交叉连接）** | 返回两个表的笛卡尔积（所有组合） | A × B |
| **SELF JOIN（自连接）** | 将表与自身连接（需使用别名） | - |

### 2. 连接条件

- **ON**：指定连接条件（如`ON a.id = b.id`）
- **USING**：当连接列名相同时，可简化为`USING(id)`
- **NATURAL JOIN**：自动根据同名列连接（不推荐使用，易出错）

### 3. 多表连接注意事项

1. **连接条件要正确**：避免笛卡尔积（CROSS JOIN）
2. **注意NULL值**：LEFT/RIGHT/FULL JOIN会产生NULL值
3. **性能考虑**：连接多个大表时，先过滤再连接
4. **别名使用**：多表连接时建议使用别名，提高可读性

---

## 详细内容

### 一、INNER JOIN（内连接）

#### 1.1 基本语法

```sql
SELECT 
    a.column1,
    b.column2
FROM table_a a
INNER JOIN table_b b ON a.id = b.id;
```

#### 1.2 示例

**业务场景**：查询有订单的用户信息（只返回有订单的用户）

**表结构**：
- `users`表：user_id, username, city
- `orders`表：order_id, user_id, order_amount

**SQL查询**：

```sql
SELECT 
    u.user_id,
    u.username,
    u.city,
    o.order_id,
    o.order_amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id;
```

**结果**：只返回在`orders`表中有匹配记录的用户。

---

### 二、LEFT JOIN（左连接）

#### 2.1 基本语法

```sql
SELECT 
    a.column1,
    b.column2
FROM table_a a
LEFT JOIN table_b b ON a.id = b.id;
```

#### 2.2 示例

**业务场景**：查询所有用户及其订单信息（包括没有订单的用户）

**SQL查询**：

```sql
SELECT 
    u.user_id,
    u.username,
    u.city,
    o.order_id,
    o.order_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id;
```

**结果**：返回所有用户，没有订单的用户其`order_id`和`order_amount`为NULL。

#### 2.3 查找没有订单的用户

```sql
SELECT 
    u.user_id,
    u.username,
    u.city
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL;
```

---

### 三、RIGHT JOIN（右连接）

#### 3.1 基本语法

```sql
SELECT 
    a.column1,
    b.column2
FROM table_a a
RIGHT JOIN table_b b ON a.id = b.id;
```

#### 3.2 示例

**业务场景**：查询所有订单及其用户信息（包括没有用户的订单，虽然这种情况很少）

**SQL查询**：

```sql
SELECT 
    u.user_id,
    u.username,
    u.city,
    o.order_id,
    o.order_amount
FROM users u
RIGHT JOIN orders o ON u.user_id = o.user_id;
```

**结果**：返回所有订单，没有用户的订单其`user_id`、`username`、`city`为NULL。

**注意**：RIGHT JOIN不常用，通常用LEFT JOIN替代（调换表顺序）。

---

### 四、FULL JOIN（全连接）

#### 4.1 基本语法

```sql
SELECT 
    a.column1,
    b.column2
FROM table_a a
FULL JOIN table_b b ON a.id = b.id;
```

#### 4.2 示例

**业务场景**：查询所有用户和所有订单（包括没有订单的用户和没有用户的订单）

**SQL查询**：

```sql
SELECT 
    u.user_id,
    u.username,
    u.city,
    o.order_id,
    o.order_amount
FROM users u
FULL JOIN orders o ON u.user_id = o.user_id;
```

**结果**：返回所有用户和所有订单，无匹配的部分填充NULL。

**注意**：MySQL不支持FULL JOIN，需用LEFT JOIN + UNION + RIGHT JOIN替代。

---

### 五、CROSS JOIN（交叉连接）

#### 5.1 基本语法

```sql
SELECT 
    a.column1,
    b.column2
FROM table_a a
CROSS JOIN table_b b;
```

#### 5.2 示例

**业务场景**：生成所有用户和所有产品的组合（用于生成候选集）

**SQL查询**：

```sql
SELECT 
    u.user_id,
    u.username,
    p.product_id,
    p.product_name
FROM users u
CROSS JOIN products p;
```

**结果**：返回用户表和产品表的笛卡尔积（每个用户和每个产品的组合）。

**注意**：CROSS JOIN会产生大量数据，慎用！

---

### 六、SELF JOIN（自连接）

#### 6.1 基本语法

```sql
SELECT 
    a.column1,
    b.column2
FROM table_name a, table_name b
WHERE a.column = b.column;
```

#### 6.2 示例

**业务场景**：查询员工及其经理的信息（员工表和经理表是同一个表）

**表结构**：
- `employees`表：employee_id, employee_name, manager_id

**SQL查询**：

```sql
SELECT 
    e.employee_name AS employee,
    m.employee_name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;
```

**结果**：返回每个员工及其经理的姓名。

---

## 示例/应用场景

### 示例1：电商数据分析

**业务问题**：查询2024年1月每个用户的订单金额，包括没有订单的用户。

**表结构**：
- `users`表：user_id, username, register_date
- `orders`表：order_id, user_id, order_date, order_amount

**SQL查询**：

```sql
SELECT 
    u.user_id,
    u.username,
    SUM(o.order_amount) AS total_order_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
    AND o.order_date >= '2024-01-01'
    AND o.order_date < '2024-02-01'
GROUP BY u.user_id, u.username;
```

**洞察**：
- 如果`total_order_amount`为NULL，说明该用户2024年1月没有订单
- 可用于分析用户活跃度、转化率等

### 示例2：用户留存分析

**业务问题**：查询2024年1月注册的用户，在2月的留存情况。

**表结构**：
- `users`表：user_id, register_date
- `user_login`表：user_id, login_date

**SQL查询**：

```sql
SELECT 
    DATE(u.register_date) AS reg_date,
    COUNT(DISTINCT u.user_id) AS reg_users,
    COUNT(DISTINCT l.user_id) AS retained_users
FROM users u
LEFT JOIN user_login l ON u.user_id = l.user_id
    AND DATE(l.login_date) >= '2024-02-01'
    AND DATE(l.login_date) < '2024-03-01'
WHERE DATE(u.register_date) >= '2024-01-01'
    AND DATE(u.register_date) < '2024-02-01'
GROUP BY DATE(u.register_date);
```

**洞察**：
- `retained_users`表示在2月登录过的1月注册用户数
- 留存率 = `retained_users` / `reg_users`

### 示例3：商品销售分析

**业务问题**：查询每个商品的销售数量，包括没有销售记录的商品。

**表结构**：
- `products`表：product_id, product_name, category
- `order_items`表：product_id, quantity

**SQL查询**：

```sql
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    SUM(oi.quantity) AS total_sold
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.product_name, p.category;
```

**洞察**：
- 如果`total_sold`为NULL，说明该商品没有销售记录
- 可用于识别滞销商品

---

## 数据分析师考点

### SQL多表连接常见考点

1. **常见连接方式**：INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL JOIN、CROSS JOIN、SELF JOIN
2. **连接条件**：ON、USING、NATURAL JOIN
3. **多表连接注意事项**：连接条件要正确、注意NULL值、性能考虑、别名使用
4. **INNER JOIN**：只返回两个表中匹配的行
5. **LEFT JOIN**：返回左表所有行，右表无匹配则填充NULL
6. **RIGHT JOIN**：返回右表所有行，左表无匹配则填充NULL
7. **FULL JOIN**：返回两个表所有行，无匹配则填充NULL
8. **CROSS JOIN**：返回两个表的笛卡尔积（所有组合）
9. **SELF JOIN**：将表与自身连接（需使用别名）

### 实战考点

1. **电商数据分析**：
   - 查询有订单的用户信息（INNER JOIN）
   - 查询所有用户及其订单信息（LEFT JOIN）
   - 查询没有订单的用户（LEFT JOIN + WHERE IS NULL）
2. **用户留存分析**：
   - 查询某月注册的用户在后续月份的留存情况（LEFT JOIN）
3. **商品销售分析**：
   - 查询每个商品的销售数量，包括没有销售记录的商品（LEFT JOIN）
4. **员工管理分析**：
   - 查询员工及其经理的信息（SELF JOIN）

---

## 最佳实践

### 1. 避免笛卡尔积（CROSS JOIN）

**不推荐**（忘记写连接条件，导致笛卡尔积）：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u, orders o;  -- 笛卡尔积！
```

**推荐**（明确指定连接条件）：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id;
```

### 2. 使用别名提高可读性

**不推荐**（不使用别名，可读性差）：

```sql
SELECT 
    users.username,
    orders.order_amount
FROM users
INNER JOIN orders ON users.user_id = orders.user_id;
```

**推荐**（使用别名，提高可读性）：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id;
```

### 3. 先过滤再连接（性能优化）

**不推荐**（先连接再过滤，性能差）：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
WHERE o.order_date >= '2024-01-01';
```

**推荐**（先过滤再连接，性能好）：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u
INNER JOIN (
    SELECT * FROM orders
    WHERE order_date >= '2024-01-01'
) o ON u.user_id = o.user_id;
```

### 4. 注意NULL值处理

**不推荐**（忽略NULL值，可能导致错误结果）：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_amount > 100;  -- 会过滤掉NULL值！
```

**推荐**（注意NULL值处理）：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE (o.order_amount > 100 OR o.order_amount IS NULL);
```

---

## 常见错误

### 1. 忘记写连接条件，导致笛卡尔积

**错误示例**：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u, orders o;  -- 笛卡尔积！
```

**正确做法**：

```sql
SELECT 
    u.username,
    o.order_amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id;
```

### 2. 混淆INNER JOIN和LEFT JOIN

**错误示例**：

```sql
-- 想查询所有用户及其订单信息，却用了INNER JOIN（只返回有订单的用户）
SELECT 
    u.username,
    o.order_amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id;
```

**正确做法**：

```sql
-- 使用LEFT JOIN（返回所有用户，包括没有订单的用户）
SELECT 
    u.username,
    o.order_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id;
```

### 3. 忽略NULL值处理

**错误示例**：

```sql
-- 想查询所有用户及其订单金额，却用了WHERE子句过滤掉NULL值
SELECT 
    u.username,
    o.order_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_amount > 100;  -- 会过滤掉NULL值！
```

**正确做法**：

```sql
-- 注意NULL值处理
SELECT 
    u.username,
    o.order_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE (o.order_amount > 100 OR o.order_amount IS NULL);
```

### 4. 使用RIGHT JOIN而不使用LEFT JOIN

**错误示例**：

```sql
-- 使用RIGHT JOIN，可读性差
SELECT 
    u.username,
    o.order_amount
FROM users u
RIGHT JOIN orders o ON u.user_id = o.user_id;
```

**正确做法**：

```sql
-- 使用LEFT JOIN，调换表顺序，可读性好
SELECT 
    u.username,
    o.order_amount
FROM orders o
LEFT JOIN users u ON u.user_id = o.user_id;
```

### 5. 多表连接时混淆连接条件

**错误示例**：

```sql
-- 多表连接时，混淆连接条件
SELECT 
    u.username,
    o.order_amount,
    p.product_name
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
INNER JOIN products p ON u.user_id = p.product_id;  -- 错误！应该是o.product_id = p.product_id
```

**正确做法**：

```sql
-- 多表连接时，明确指定连接条件
SELECT 
    u.username,
    o.order_amount,
    p.product_name
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
INNER JOIN products p ON o.product_id = p.product_id;
```

---

## 总结

SQL多表连接是数据分析师的核心技能，关键要点包括：

1. **掌握常见连接方式**：INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL JOIN、CROSS JOIN、SELF JOIN
2. **熟练编写多表连接查询**：根据业务需求选择合适的连接方式
3. **注意多表连接注意事项**：连接条件要正确、注意NULL值、性能考虑、别名使用
4. **注意最佳实践**：避免笛卡尔积、使用别名提高可读性、先过滤再连接、注意NULL值处理
5. **避免常见错误**：忘记写连接条件、混淆INNER JOIN和LEFT JOIN、忽略NULL值处理、使用RIGHT JOIN而不使用LEFT JOIN、多表连接时混淆连接条件

SQL多表连接是数据分析师的必备技能，需要在实践中不断积累经验。

---

## 扩展阅读

### 高级主题

1. **多表连接性能优化**：如何优化多表连接的性能（索引、连接顺序等）
2. **复杂连接条件**：如何编写复杂的连接条件（如多列连接、范围连接等）
3. **连接与子查询的选择**：何时使用连接，何时使用子查询
4. **窗口函数与连接的结合**：如何使用窗口函数替代某些连接操作

### 实战案例

1. **电商数据分析**：用户订单分析、商品销售分析、用户留存分析
2. **金融数据分析**：交易数据分析、用户行为分析
3. **用户行为分析**：用户路径分析、用户转化分析
4. **日志分析**：Web日志分析、应用日志分析

---

**注**：本文件内容适用于所有支持SQL的数据库（MySQL、PostgreSQL、SQL Server、Oracle等），是数据分析师的必备基础知识。

---
