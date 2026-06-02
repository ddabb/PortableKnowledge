---
title: SQL基础查询
description: SQL基础查询是数据分析师操作数据库的核心技能，包括SELECT、FROM、WHERE、GROUP BY、HAVING、ORDER BY等关键字的使用
category: 数据分析师/SQL数据库
tags:
  - 数据分析师
  - SQL数据库
  - SQL基础查询
  - SELECT
  - 数据分析
---

# SQL基础查询

## 定义

SQL（Structured Query Language）是用于管理关系型数据库的标准语言。SQL基础查询是**数据分析师从数据库中提取、过滤、聚合数据**的核心技能。

对于数据分析师而言，SQL是**获取数据**的主要手段，大多数分析任务都始于SQL查询。

---

## 核心概念

### 1. SQL查询的基本结构

```sql
SELECT 列1, 列2, ...
FROM 表名
WHERE 条件
GROUP BY 列1, 列2, ...
HAVING 条件
ORDER BY 列1, 列2, ...
LIMIT 数量;
```

**执行顺序**（逻辑顺序，不是书写顺序）：
1. FROM
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT
6. ORDER BY
7. LIMIT

### 2. 常用关键字

| 关键字 | 说明 | 示例 |
|--------|------|------|
| **SELECT** | 选择要查询的列 | `SELECT name, age` |
| **FROM** | 指定要查询的表 | `FROM users` |
| **WHERE** | 过滤行（分组前） | `WHERE age > 18` |
| **GROUP BY** | 分组聚合 | `GROUP BY gender` |
| **HAVING** | 过滤分组（分组后） | `HAVING COUNT(*) > 10` |
| **ORDER BY** | 排序 | `ORDER BY age DESC` |
| **LIMIT** | 限制返回行数 | `LIMIT 10` |

### 3. 常用聚合函数

| 函数 | 说明 | 示例 |
|------|------|------|
| **COUNT()** | 计数 | `COUNT(*)` |
| **SUM()** | 求和 | `SUM(sales)` |
| **AVG()** | 平均值 | `AVG(price)` |
| **MIN()** | 最小值 | `MIN(age)` |
| **MAX()** | 最大值 | `MAX(salary)` |

### 4. 常用运算符

| 类型 | 运算符 | 说明 |
|------|--------|------|
| **比较运算符** | `=`, `!=`, `>`, `<`, `>=`, `<=` | 比较大小 |
| **逻辑运算符** | `AND`, `OR`, `NOT` | 组合条件 |
| **模糊匹配** | `LIKE`, `NOT LIKE` | 模糊匹配（`%`匹配任意字符，`_`匹配单个字符） |
| **范围匹配** | `BETWEEN...AND...` | 在某个范围内 |
| **列表匹配** | `IN`, `NOT IN` | 在列表中 |
| **空值判断** | `IS NULL`, `IS NOT NULL` | 判断是否为空 |

---

## 详细内容

### 一、基础查询（SELECT...FROM...）

#### 1.1 查询所有列

```sql
SELECT * FROM users;
```

#### 1.2 查询指定列

```sql
SELECT name, age, email FROM users;
```

#### 1.3 使用别名（AS）

```sql
SELECT name AS 姓名, age AS 年龄 FROM users;
```

---

### 二、过滤查询（WHERE）

#### 2.1 比较运算符

```sql
-- 查询年龄大于18的用户
SELECT * FROM users WHERE age > 18;

-- 查询年龄等于25的用户
SELECT * FROM users WHERE age = 25;

-- 查询年龄不等于30的用户
SELECT * FROM users WHERE age != 30;
```

#### 2.2 逻辑运算符

```sql
-- 查询年龄大于18且性别为男的用户
SELECT * FROM users WHERE age > 18 AND gender = '男';

-- 查询年龄小于18或大于60的用户
SELECT * FROM users WHERE age < 18 OR age > 60;

-- 查询年龄不在18到30之间的用户
SELECT * FROM users WHERE NOT (age >= 18 AND age <= 30);
```

#### 2.3 模糊匹配（LIKE）

```sql
-- 查询邮箱以'gmail.com'结尾的用户
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- 查询名字以'张'开头的用户
SELECT * FROM users WHERE name LIKE '张%';

-- 查询名字包含'三'的用户
SELECT * FROM users WHERE name LIKE '%三%';
```

#### 2.4 范围匹配（BETWEEN...AND...）

```sql
-- 查询年龄在18到30之间的用户
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
```

#### 2.5 列表匹配（IN）

```sql
-- 查询年龄是18、25、30的用户
SELECT * FROM users WHERE age IN (18, 25, 30);
```

#### 2.6 空值判断（IS NULL / IS NOT NULL）

```sql
-- 查询邮箱为空的用户
SELECT * FROM users WHERE email IS NULL;

-- 查询邮箱不为空的用户
SELECT * FROM users WHERE email IS NOT NULL;
```

---

### 三、聚合查询（GROUP BY...HAVING...）

#### 3.1 聚合函数

```sql
-- 统计用户总数
SELECT COUNT(*) AS 用户总数 FROM users;

-- 统计男性用户的平均年龄
SELECT AVG(age) AS 平均年龄 FROM users WHERE gender = '男';

-- 统计最大年龄和最小年龄
SELECT MAX(age) AS 最大年龄, MIN(age) AS 最小年龄 FROM users;
```

#### 3.2 分组聚合（GROUP BY）

```sql
-- 按性别分组，统计每组的人数
SELECT gender, COUNT(*) AS 人数 FROM users GROUP BY gender;

-- 按性别和年龄段分组，统计每组的人数
SELECT gender, 
       CASE WHEN age < 18 THEN '未成年'
            WHEN age >= 18 AND age < 60 THEN '成年'
            ELSE '老年' END AS 年龄段,
       COUNT(*) AS 人数
FROM users
GROUP BY gender, 
         CASE WHEN age < 18 THEN '未成年'
              WHEN age >= 18 AND age < 60 THEN '成年'
              ELSE '老年' END;
```

#### 3.3 过滤分组（HAVING）

```sql
-- 按性别分组，统计每组的人数，并筛选出人数大于50的组
SELECT gender, COUNT(*) AS 人数 
FROM users 
GROUP BY gender 
HAVING COUNT(*) > 50;
```

**注意**：WHERE和HAVING的区别
- WHERE：过滤**行**（分组前）
- HAVING：过滤**分组**（分组后）

---

### 四、排序和限制（ORDER BY...LIMIT...）

#### 4.1 排序（ORDER BY）

```sql
-- 按年龄升序排序
SELECT * FROM users ORDER BY age ASC;

-- 按年龄降序排序
SELECT * FROM users ORDER BY age DESC;

-- 先按性别升序排序，再按年龄降序排序
SELECT * FROM users ORDER BY gender ASC, age DESC;
```

#### 4.2 限制返回行数（LIMIT）

```sql
-- 查询年龄最大的前10个用户
SELECT * FROM users ORDER BY age DESC LIMIT 10;
```

---

## 示例/应用场景

### 示例1：电商用户分析

**业务问题**：查询2023年每月的新增用户数。

**分析**：

```sql
-- 假设users表有注册时间字段：register_time（datetime类型）
SELECT 
    DATE_FORMAT(register_time, '%Y-%m') AS 月份,
    COUNT(*) AS 新增用户数
FROM users
WHERE register_time >= '2023-01-01' AND register_time < '2024-01-01'
GROUP BY DATE_FORMAT(register_time, '%Y-%m')
ORDER BY 月份;
```

**洞察与建议**：
- 可以识别用户增长的季节性规律
- 可以根据增长趋势调整拉新策略

### 示例2：电商销售分析

**业务问题**：查询2023年每月的销售额和订单数。

**分析**：

```sql
-- 假设orders表有下单时间字段：order_time（datetime类型），金额字段：amount（decimal类型）
SELECT 
    DATE_FORMAT(order_time, '%Y-%m') AS 月份,
    COUNT(*) AS 订单数,
    SUM(amount) AS 销售额
FROM orders
WHERE order_time >= '2023-01-01' AND order_time < '2024-01-01'
GROUP BY DATE_FORMAT(order_time, '%Y-%m')
ORDER BY 月份;
```

**洞察与建议**：
- 可以识别销售季节性规律
- 可以根据销售趋势调整库存和营销策略

### 示例3：电商用户价值分析（RFM模型）

**业务问题**：基于用户最近购买时间（Recency）、购买频率（Frequency）、购买金额（Monetary）对用户进行价值分层。

**分析**：

```sql
-- 假设orders表有用户ID字段：user_id，下单时间字段：order_time，金额字段：amount
-- 步骤1：计算每个用户的R、F、M值
WITH rfm AS (
    SELECT 
        user_id,
        DATEDIFF(CURDATE(), MAX(order_time)) AS R,  -- 最近购买距今天数
        COUNT(*) AS F,  -- 购买频率
        SUM(amount) AS M  -- 购买金额
    FROM orders
    GROUP BY user_id
)
-- 步骤2：对R、F、M值进行分层（例如，使用NTILE函数分为5层）
SELECT 
    user_id,
    R,
    F,
    M,
    NTILE(5) OVER (ORDER BY R ASC) AS R_layer,  -- R越小越好，所以升序
    NTILE(5) OVER (ORDER BY F DESC) AS F_layer,  -- F越大越好，所以降序
    NTILE(5) OVER (ORDER BY M DESC) AS M_layer   -- M越大越好，所以降序
FROM rfm;
```

**洞察与建议**：
- 可以识别高价值用户（R、F、M都高），进行精准营销
- 可以识别流失风险用户（R高、F低、M低），进行唤醒营销

---

## 数据分析师考点

### SQL基础查询常见考点

1. **SQL查询的基本结构**：SELECT...FROM...WHERE...GROUP BY...HAVING...ORDER BY...LIMIT...
2. **SQL查询的执行顺序**：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
3. **常用关键字**：SELECT、FROM、WHERE、GROUP BY、HAVING、ORDER BY、LIMIT
4. **常用聚合函数**：COUNT()、SUM()、AVG()、MIN()、MAX()
5. **常用运算符**：比较运算符、逻辑运算符、模糊匹配、范围匹配、列表匹配、空值判断
6. **WHERE和HAVING的区别**：WHERE过滤行（分组前），HAVING过滤分组（分组后）
7. **GROUP BY的使用**：分组聚合
8. **ORDER BY的使用**：排序（ASC升序，DESC降序）
9. **LIMIT的使用**：限制返回行数

### 实战考点

1. **电商用户分析**：
   - 如何查询新增用户数（按日、按周、按月）
   - 如何查询用户活跃度（如最近登录时间、登录次数等）
   - 如何查询用户留存率（需要复杂查询或子查询）
2. **电商销售分析**：
   - 如何查询销售额（按日、按周、按月）
   - 如何查询客单价（销售额/订单数）
   - 如何查询热门商品（按销量、按销售额排序）
3. **电商用户价值分析（RFM模型）**：
   - 如何计算R、F、M值
   - 如何对R、F、M值进行分层
   - 如何基于RFM模型进行用户分层

---

## 最佳实践

### 1. 使用明确的列名，避免使用SELECT *

**不推荐**（使用SELECT *）：

```sql
SELECT * FROM users;
```

**推荐**（使用明确的列名）：

```sql
SELECT id, name, age, gender, email FROM users;
```

**理由**：
- 提高查询性能（减少数据传输量）
- 提高代码可读性（明确需要哪些列）
- 避免表结构变更带来的影响

### 2. 使用注释，提高代码可读性

**不推荐**（没有注释）：

```sql
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_amount
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 10;
```

**推荐**（添加注释）：

```sql
-- 查询订单数大于10的用户及其订单数和总金额
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_amount
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 10;
```

### 3. 使用合适的索引，提高查询性能

**不推荐**（没有索引，导致全表扫描）：

```sql
-- 假设users表有100万行，且没有在age列上创建索引
SELECT * FROM users WHERE age > 18;
```

**推荐**（在age列上创建索引）：

```sql
-- 创建索引
CREATE INDEX idx_age ON users(age);

-- 再次查询
SELECT * FROM users WHERE age > 18;
```

### 4. 使用EXPLAIN分析查询执行计划，优化查询性能

**不推荐**（不分析查询执行计划，直接执行查询）：

```sql
SELECT * FROM users WHERE age > 18;
```

**推荐**（使用EXPLAIN分析查询执行计划）：

```sql
EXPLAIN SELECT * FROM users WHERE age > 18;
```

---

## 常见错误

### 1. 混淆WHERE和HAVING

**错误示例**：

```sql
-- 错误：在WHERE中使用聚合函数
SELECT gender, COUNT(*) AS 人数 
FROM users 
WHERE COUNT(*) > 50 
GROUP BY gender;
```

**正确做法**：

```sql
-- 正确：在HAVING中使用聚合函数
SELECT gender, COUNT(*) AS 人数 
FROM users 
GROUP BY gender 
HAVING COUNT(*) > 50;
```

### 2. 忘记GROUP BY中包含SELECT中的所有非聚合列

**错误示例**：

```sql
-- 错误：SELECT中的name没有包含在GROUP BY中
SELECT name, gender, COUNT(*) AS 人数 
FROM users 
GROUP BY gender;
```

**正确做法**：

```sql
-- 正确：SELECT中的name包含在GROUP BY中
SELECT name, gender, COUNT(*) AS 人数 
FROM users 
GROUP BY name, gender;
```

### 3. 使用SELECT *，导致查询性能低下

**错误示例**：

```sql
SELECT * FROM users;
```

**正确做法**：

```sql
SELECT id, name, age, gender, email FROM users;
```

### 4. 不进行数据类型转换，导致查询结果错误

**错误示例**：

```sql
-- 错误：age是INT类型，'18'是字符串类型，比较时可能出错
SELECT * FROM users WHERE age > '18';
```

**正确做法**：

```sql
-- 正确：进行数据类型转换
SELECT * FROM users WHERE age > CAST('18' AS UNSIGNED);
```

### 5. 不使用索引，导致查询性能低下

**错误示例**：

```sql
-- 假设users表有100万行，且没有在age列上创建索引
SELECT * FROM users WHERE age > 18;
```

**正确做法**：

```sql
-- 创建索引
CREATE INDEX idx_age ON users(age);

-- 再次查询
SELECT * FROM users WHERE age > 18;
```

---

## 总结

SQL基础查询是数据分析师的核心技能，关键要点包括：

1. **掌握SQL查询的基本结构**：SELECT...FROM...WHERE...GROUP BY...HAVING...ORDER BY...LIMIT...
2. **理解SQL查询的执行顺序**：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
3. **熟练使用常用关键字**：SELECT、FROM、WHERE、GROUP BY、HAVING、ORDER BY、LIMIT
4. **熟练使用常用聚合函数**：COUNT()、SUM()、AVG()、MIN()、MAX()
5. **熟练使用常用运算符**：比较运算符、逻辑运算符、模糊匹配、范围匹配、列表匹配、空值判断
6. **理解WHERE和HAVING的区别**：WHERE过滤行（分组前），HAVING过滤分组（分组后）
7. **注意最佳实践**：使用明确的列名避免使用SELECT *、使用注释提高代码可读性、使用合适的索引提高查询性能、使用EXPLAIN分析查询执行计划优化查询性能
8. **避免常见错误**：混淆WHERE和HAVING、忘记GROUP BY中包含SELECT中的所有非聚合列、使用SELECT *导致查询性能低下、不进行数据类型转换导致查询结果错误、不使用索引导致查询性能低下

SQL基础查询是数据分析师的必备技能，需要在实践中不断积累经验。

---

## 扩展阅读

### 高级主题

1. **子查询（Subquery）**：嵌套在另一个查询中的查询
2. **多表连接（JOIN）**：连接多个表进行查询
3. **窗口函数（Window Function）**：在保留明细数据的同时进行聚合计算
4. **Common Table Expression（CTE）**：使用WITH语句创建临时结果集

### 实战案例

1. **电商用户分析**：新增用户数、用户活跃度、用户留存率
2. **电商销售分析**：销售额、客单价、热门商品
3. **电商用户价值分析（RFM模型）**：计算R、F、M值，进行用户分层
4. **电商商品分析**：商品销量、商品销售额、商品转化率

---

**注**：本文件内容适用于所有需要操作关系型数据库的分析场景，是数据分析师的必备基础知识。

---
