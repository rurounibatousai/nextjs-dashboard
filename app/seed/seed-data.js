// 独立的seed脚本，直接包含所有数据和逻辑
const bcrypt = require('bcrypt');
const postgres = require('postgres');

// 直接定义所有需要的数据
const users = [
  {
    id: 'f79e82e8-c34a-42d8-9ddc-4d9f6e6ffc1a',
    name: 'User',
    email: 'user@example.com',
    password: 'password123',
  },
];

const customers = [
  {
    id: '901261b2-237b-4567-b2f4-8822c3454bc9',
    name: 'Delba de Oliveira',
    email: 'delba@example.com',
    image_url: '/customers/delba-de-oliveira.png',
  },
  {
    id: 'b6c2bd99-3680-45c9-9a9b-4b7754665d9a',
    name: 'Lee Robinson',
    email: 'lee@example.com',
    image_url: '/customers/lee-robinson.png',
  },
];

const invoices = [
  {
    id: '27b3730c-e70e-4541-b61a-6c916e690a2d',
    customer_id: '901261b2-237b-4567-b2f4-8822c3454bc9',
    amount: 15795,
    status: 'pending',
    date: '2023-12-06',
  },
];

const revenue = [
  {
    month: 'Jan',
    revenue: 1800,
  },
  {
    month: 'Feb',
    revenue: 2700,
  },
];

// 主函数
async function seedDatabase() {
  try {
    console.log('开始执行数据库种子脚本...');
    
    // 连接到数据库
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      throw new Error('POSTGRES_URL 环境变量未设置');
    }
    
    const sql = postgres(postgresUrl, { ssl: 'require' });
    
    // 创建用户表并插入数据
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    console.log('正在创建/更新用户...');
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (email) DO UPDATE SET 
            name = EXCLUDED.name,
            password = EXCLUDED.password;
        `;
      }),
    );
    console.log(`已处理 ${insertedUsers.length} 个用户`);

    // 创建客户表并插入数据
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        image_url TEXT
      );
    `;

    console.log('正在创建/更新客户...');
    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => sql`
          INSERT INTO customers (id, name, email, image_url)
          VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
          ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            image_url = EXCLUDED.image_url;
        `,
      ),
    );
    console.log(`已处理 ${insertedCustomers.length} 个客户`);

    // 创建发票表并插入数据
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL
      );
    `;

    console.log('正在创建发票...');
    // 对于发票，我们使用DO NOTHING因为发票ID是UUID
    const insertedInvoices = await Promise.all(
      invoices.map(
        (invoice) => sql`
          INSERT INTO invoices (id, customer_id, amount, status, date)
          VALUES (${invoice.id}, ${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
          ON CONFLICT (id) DO NOTHING;
        `,
      ),
    );
    console.log(`已处理 ${insertedInvoices.length} 个发票`);

    // 创建收入表并插入数据
    await sql`
      CREATE TABLE IF NOT EXISTS revenue (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;

    console.log('正在创建/更新收入记录...');
    const insertedRevenue = await Promise.all(
      revenue.map(
        (item) => sql`
          INSERT INTO revenue (month, revenue)
          VALUES (${item.month}, ${item.revenue})
          ON CONFLICT (month) DO UPDATE SET 
            revenue = EXCLUDED.revenue;
        `,
      ),
    );
    console.log(`已处理 ${insertedRevenue.length} 条收入记录`);

    // 关闭数据库连接
    await sql.end();
    console.log('数据库种子脚本执行完成！');
  } catch (error) {
    console.error('执行种子脚本时出错:', error);
    process.exit(1);
  }
}

// 执行脚本
seedDatabase();