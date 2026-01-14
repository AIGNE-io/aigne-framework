import { initDatabase, sql } from "@aigne/sqlite";

/**
 * Seeds the SQLite database with Northwind sample data
 */
export async function seedDatabase(url: string) {
  const db = await initDatabase({ url, wal: url !== ":memory:" });

  // Create categories table
  await db
    .run(
      sql.raw(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `)
    )
    .execute();

  // Create suppliers table
  await db
    .run(
      sql.raw(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      contact_title TEXT,
      address TEXT,
      city TEXT,
      region TEXT,
      postal_code TEXT,
      country TEXT,
      phone TEXT,
      fax TEXT
    )
  `)
    )
    .execute();

  // Create products table
  await db
    .run(
      sql.raw(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      supplier_id INTEGER,
      category_id INTEGER,
      quantity_per_unit TEXT,
      unit_price REAL,
      units_in_stock INTEGER,
      units_on_order INTEGER,
      reorder_level INTEGER,
      discontinued INTEGER DEFAULT 0,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `)
    )
    .execute();

  // Create customers table
  await db
    .run(
      sql.raw(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      contact_title TEXT,
      address TEXT,
      city TEXT,
      region TEXT,
      postal_code TEXT,
      country TEXT,
      phone TEXT,
      fax TEXT
    )
  `)
    )
    .execute();

  // Create employees table
  await db
    .run(
      sql.raw(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      title TEXT,
      title_of_courtesy TEXT,
      birth_date TEXT,
      hire_date TEXT,
      address TEXT,
      city TEXT,
      region TEXT,
      postal_code TEXT,
      country TEXT,
      phone TEXT,
      extension TEXT,
      notes TEXT,
      reports_to INTEGER,
      FOREIGN KEY (reports_to) REFERENCES employees(id)
    )
  `)
    )
    .execute();

  // Create shippers table
  await db
    .run(
      sql.raw(`
    CREATE TABLE IF NOT EXISTS shippers (
      id INTEGER PRIMARY KEY,
      company_name TEXT NOT NULL,
      phone TEXT
    )
  `)
    )
    .execute();

  // Create orders table
  await db
    .run(
      sql.raw(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      customer_id TEXT,
      employee_id INTEGER,
      order_date TEXT,
      required_date TEXT,
      shipped_date TEXT,
      shipper_id INTEGER,
      freight REAL,
      ship_name TEXT,
      ship_address TEXT,
      ship_city TEXT,
      ship_region TEXT,
      ship_postal_code TEXT,
      ship_country TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (shipper_id) REFERENCES shippers(id)
    )
  `)
    )
    .execute();

  // Create order_details table
  await db
    .run(
      sql.raw(`
    CREATE TABLE IF NOT EXISTS order_details (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      discount REAL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)
    )
    .execute();

  // Check if already seeded
  const count = await db.all<{ count: number }>(sql.raw("SELECT COUNT(*) as count FROM categories")).execute();

  if (count[0]?.count && count[0].count > 0) {
    return db;
  }

  // Seed categories
  const categories = [
    [1, "Beverages", "Soft drinks, coffees, teas, beers, and ales"],
    [2, "Condiments", "Sweet and savory sauces, relishes, spreads, and seasonings"],
    [3, "Confections", "Desserts, candies, and sweet breads"],
    [4, "Dairy Products", "Cheeses"],
    [5, "Grains/Cereals", "Breads, crackers, pasta, and cereal"],
    [6, "Meat/Poultry", "Prepared meats"],
    [7, "Produce", "Dried fruit and bean curd"],
    [8, "Seafood", "Seaweed and fish"],
  ];

  for (const [id, name, description] of categories) {
    await db.run(sql.raw(`INSERT INTO categories VALUES (${id}, '${name}', '${description}')`)).execute();
  }

  // Seed suppliers (10 international suppliers)
  const suppliers = [
    [1, "Exotic Liquids", "Charlotte Cooper", "Purchasing Manager", "49 Gilbert St.", "London", null, "EC1 4SD", "UK", "(171) 555-2222", null],
    [2, "New Orleans Cajun Delights", "Shelley Burke", "Order Administrator", "P.O. Box 78934", "New Orleans", "LA", "70117", "USA", "(100) 555-4822", null],
    [3, "Tokyo Traders", "Yoshi Nagase", "Marketing Manager", "9-8 Sekimai Musashino-shi", "Tokyo", null, "100", "Japan", "(03) 3555-5011", null],
    [4, "Pavlova, Ltd.", "Ian Devling", "Marketing Manager", "74 Rose St. Moonie Ponds", "Melbourne", "Victoria", "3058", "Australia", "(03) 444-2343", "(03) 444-6588"],
    [5, "Specialty Biscuits, Ltd.", "Peter Wilson", "Sales Representative", "29 King''s Way", "Manchester", null, "M14 GSD", "UK", "(161) 555-4448", null],
    [6, "Grandma Kelly''s Homestead", "Regina Murphy", "Sales Representative", "707 Oxford Rd.", "Ann Arbor", "MI", "48104", "USA", "(313) 555-5735", "(313) 555-3349"],
    [7, "Ma Maison", "Jean-Guy Lauzon", "Marketing Manager", "2960 Rue St. Laurent", "Montreal", "Quebec", "H1J 1C3", "Canada", "(514) 555-9022", null],
    [8, "Formaggi Fortini s.r.l.", "Elio Rossi", "Sales Representative", "Viale Dante, 75", "Ravenna", null, "48100", "Italy", "(0544) 60323", "(0544) 60603"],
    [9, "Norske Meierier", "Beate Vileid", "Marketing Manager", "Hatlevegen 5", "Sandvika", null, "1320", "Norway", "(0)2-953010", null],
    [10, "Refrescos Americanas LTDA", "Carlos Diaz", "Marketing Manager", "Av. das Americanas 12.890", "Sao Paulo", null, "01310", "Brazil", "(11) 555-4640", null],
  ];

  for (const [id, company_name, contact_name, contact_title, address, city, region, postal_code, country, phone, fax] of suppliers) {
    const regionVal = region === null ? "NULL" : `'${region}'`;
    const faxVal = fax === null ? "NULL" : `'${fax}'`;
    await db
      .run(
        sql.raw(
          `INSERT INTO suppliers VALUES (${id}, '${company_name}', '${contact_name}', '${contact_title}', '${address}', '${city}', ${regionVal}, '${postal_code}', '${country}', '${phone}', ${faxVal})`
        )
      )
      .execute();
  }

  // Seed products (20 products)
  const products = [
    [1, "Chai", 1, 1, "10 boxes x 20 bags", 18.0, 39, 0, 10, 0],
    [2, "Chang", 1, 1, "24 - 12 oz bottles", 19.0, 17, 40, 25, 0],
    [3, "Aniseed Syrup", 1, 2, "12 - 550 ml bottles", 10.0, 13, 70, 25, 0],
    [4, "Chef Anton''s Cajun Seasoning", 2, 2, "48 - 6 oz jars", 22.0, 53, 0, 0, 0],
    [5, "Chef Anton''s Gumbo Mix", 2, 2, "36 boxes", 21.35, 0, 0, 0, 1],
    [6, "Grandma''s Boysenberry Spread", 6, 2, "12 - 8 oz jars", 25.0, 120, 0, 25, 0],
    [7, "Uncle Bob''s Organic Dried Pears", 6, 7, "12 - 1 lb pkgs.", 30.0, 15, 0, 10, 0],
    [8, "Northwoods Cranberry Sauce", 6, 2, "12 - 12 oz jars", 40.0, 6, 0, 0, 0],
    [9, "Mishi Kobe Niku", 3, 6, "18 - 500 g pkgs.", 97.0, 29, 0, 0, 1],
    [10, "Ikura", 3, 8, "12 - 200 ml jars", 31.0, 31, 0, 0, 0],
    [11, "Queso Cabrales", 8, 4, "1 kg pkg.", 21.0, 22, 30, 30, 0],
    [12, "Queso Manchego La Pastora", 8, 4, "10 - 500 g pkgs.", 38.0, 86, 0, 0, 0],
    [13, "Konbu", 3, 8, "2 kg box", 6.0, 24, 0, 5, 0],
    [14, "Tofu", 3, 7, "40 - 100 g pkgs.", 23.25, 35, 0, 0, 0],
    [15, "Genen Shouyu", 3, 2, "24 - 250 ml bottles", 15.5, 39, 0, 5, 0],
    [16, "Pavlova", 4, 3, "32 - 500 g boxes", 17.45, 29, 0, 10, 0],
    [17, "Alice Mutton", 4, 6, "20 - 1 kg tins", 39.0, 0, 0, 0, 1],
    [18, "Carnarvon Tigers", 4, 8, "16 kg pkg.", 62.5, 42, 0, 0, 0],
    [19, "Teatime Chocolate Biscuits", 5, 3, "10 boxes x 12 pieces", 9.2, 25, 0, 5, 0],
    [20, "Guarana Fantastica", 10, 1, "12 - 355 ml cans", 4.5, 20, 0, 0, 0],
  ];

  for (const [id, name, supplier_id, category_id, quantity_per_unit, unit_price, units_in_stock, units_on_order, reorder_level, discontinued] of products) {
    await db
      .run(
        sql.raw(
          `INSERT INTO products VALUES (${id}, '${name}', ${supplier_id}, ${category_id}, '${quantity_per_unit}', ${unit_price}, ${units_in_stock}, ${units_on_order}, ${reorder_level}, ${discontinued})`
        )
      )
      .execute();
  }

  // Seed customers (15 customers from different countries)
  // Includes customers referenced in orders: VINET, TOMSP, HANAR, VICTE, SUPRD, CHOPS, RICSU, WELLI, HILAA
  const customers = [
    ["CHOPS", "Chop-suey Chinese", "Yang Wang", "Owner", "Hauptstr. 29", "Bern", null, "3012", "Switzerland", "0452-076545", null],
    ["HANAR", "Hanari Carnes", "Mario Pontes", "Accounting Manager", "Rua do Paco, 67", "Rio de Janeiro", "RJ", "05454-876", "Brazil", "(21) 555-0091", "(21) 555-8765"],
    ["HILAA", "HILARION-Abastos", "Carlos Hernandez", "Sales Representative", "Carrera 22 con Ave. Carlos Soublette #8-35", "San Cristobal", "Tachira", "5022", "Venezuela", "(5) 555-1340", "(5) 555-1948"],
    ["RICSU", "Richter Supermarkt", "Michael Holz", "Sales Manager", "Grenzacherweg 237", "Geneva", null, "1203", "Switzerland", "0897-034214", null],
    ["SUPRD", "Supremes delices", "Pascale Cartrain", "Accounting Manager", "Boulevard Tirou, 255", "Charleroi", null, "B-6000", "Belgium", "(071) 23 67 22 20", "(071) 23 67 22 21"],
    ["TOMSP", "Toms Spezialitaten", "Karin Josephs", "Marketing Manager", "Luisenstr. 48", "Munster", null, "44087", "Germany", "0251-031259", "0251-035695"],
    ["VICTE", "Victuailles en stock", "Mary Saveley", "Sales Agent", "2, rue du Commerce", "Lyon", null, "69004", "France", "78.32.54.86", "78.32.54.87"],
    ["VINET", "Vins et alcools Chevalier", "Paul Henriot", "Accounting Manager", "59 rue de l''Abbaye", "Reims", null, "51100", "France", "26.47.15.10", "26.47.15.11"],
    ["WELLI", "Wellington Importadora", "Paula Parente", "Sales Manager", "Rua do Mercado, 12", "Resende", "SP", "08737-363", "Brazil", "(14) 555-8122", null],
    ["ALFKI", "Alfreds Futterkiste", "Maria Anders", "Sales Representative", "Obere Str. 57", "Berlin", null, "12209", "Germany", "030-0074321", "030-0076545"],
    ["ANATR", "Ana Trujillo Emparedados y helados", "Ana Trujillo", "Owner", "Avda. de la Constitucion 2222", "Mexico D.F.", null, "05021", "Mexico", "(5) 555-4729", "(5) 555-3745"],
    ["ANTON", "Antonio Moreno Taqueria", "Antonio Moreno", "Owner", "Mataderos 2312", "Mexico D.F.", null, "05023", "Mexico", "(5) 555-3932", null],
    ["AROUT", "Around the Horn", "Thomas Hardy", "Sales Representative", "120 Hanover Sq.", "London", null, "WA1 1DP", "UK", "(171) 555-7788", "(171) 555-6750"],
    ["BERGS", "Berglunds snabbkop", "Christina Berglund", "Order Administrator", "Berguvsvagen 8", "Lulea", null, "S-958 22", "Sweden", "0921-12 34 65", "0921-12 34 67"],
    ["BOLID", "Bolido Comidas preparadas", "Martin Sommer", "Owner", "C/ Araquil, 67", "Madrid", null, "28023", "Spain", "(91) 555 22 82", "(91) 555 91 99"],
  ];

  for (const [id, company_name, contact_name, contact_title, address, city, region, postal_code, country, phone, fax] of customers) {
    const regionVal = region === null ? "NULL" : `'${region}'`;
    const faxVal = fax === null ? "NULL" : `'${fax}'`;
    await db
      .run(
        sql.raw(
          `INSERT INTO customers VALUES ('${id}', '${company_name}', '${contact_name}', '${contact_title}', '${address}', '${city}', ${regionVal}, '${postal_code}', '${country}', '${phone}', ${faxVal})`
        )
      )
      .execute();
  }

  // Seed employees (5 employees with hierarchy)
  // Insert Andrew Fuller first (VP) since others report to him
  const employees = [
    [2, "Fuller", "Andrew", "Vice President, Sales", "Dr.", "1952-02-19", "1992-08-14", "908 W. Capital Way", "Tacoma", "WA", "98401", "USA", "(206) 555-9482", "3457", "Andrew received his BTS commercial and MBA from Columbia.", null],
    [1, "Davolio", "Nancy", "Sales Representative", "Ms.", "1948-12-08", "1992-05-01", "507 - 20th Ave. E.", "Seattle", "WA", "98122", "USA", "(206) 555-9857", "5467", "Education includes a BA in psychology from Colorado State University.", 2],
    [3, "Leverling", "Janet", "Sales Representative", "Ms.", "1963-08-30", "1992-04-01", "722 Moss Bay Blvd.", "Kirkland", "WA", "98033", "USA", "(206) 555-3412", "3355", "Janet has a BS degree in chemistry from Boston College.", 2],
    [4, "Peacock", "Margaret", "Sales Representative", "Mrs.", "1937-09-19", "1993-05-03", "4110 Old Redmond Rd.", "Redmond", "WA", "98052", "USA", "(206) 555-8122", "5176", "Margaret holds a BA in English literature from Concordia.", 2],
    [5, "Buchanan", "Steven", "Sales Manager", "Mr.", "1955-03-04", "1993-10-17", "14 Garrett Hill", "London", null, "SW1 8JR", "UK", "(71) 555-4848", "3453", "Steven has a BSc degree from London Business School.", 2],
  ];

  for (const [id, last_name, first_name, title, title_of_courtesy, birth_date, hire_date, address, city, region, postal_code, country, phone, extension, notes, reports_to] of employees) {
    const regionVal = region === null ? "NULL" : `'${region}'`;
    const reportsToVal = reports_to === null ? "NULL" : reports_to;
    await db
      .run(
        sql.raw(
          `INSERT INTO employees VALUES (${id}, '${last_name}', '${first_name}', '${title}', '${title_of_courtesy}', '${birth_date}', '${hire_date}', '${address}', '${city}', ${regionVal}, '${postal_code}', '${country}', '${phone}', '${extension}', '${notes}', ${reportsToVal})`
        )
      )
      .execute();
  }

  // Seed shippers
  const shippers = [
    [1, "Speedy Express", "(503) 555-9831"],
    [2, "United Package", "(503) 555-3199"],
    [3, "Federal Shipping", "(503) 555-9931"],
  ];

  for (const [id, company_name, phone] of shippers) {
    await db.run(sql.raw(`INSERT INTO shippers VALUES (${id}, '${company_name}', '${phone}')`)).execute();
  }

  // Seed orders (10 sample orders)
  const orders = [
    [10248, "VINET", 5, "1996-07-04", "1996-08-01", "1996-07-16", 3, 32.38, "Vins et alcools Chevalier", "59 rue de l''Abbaye", "Reims", null, "51100", "France"],
    [10249, "TOMSP", 1, "1996-07-05", "1996-08-16", "1996-07-10", 1, 11.61, "Toms Spezialitaten", "Luisenstr. 48", "Munster", null, "44087", "Germany"],
    [10250, "HANAR", 4, "1996-07-08", "1996-08-05", "1996-07-12", 2, 65.83, "Hanari Carnes", "Rua do Paco, 67", "Rio de Janeiro", "RJ", "05454-876", "Brazil"],
    [10251, "VICTE", 3, "1996-07-08", "1996-08-05", "1996-07-15", 1, 41.34, "Victuailles en stock", "2, rue du Commerce", "Lyon", null, "69004", "France"],
    [10252, "SUPRD", 4, "1996-07-09", "1996-08-06", "1996-07-11", 2, 51.3, "Supremes delices", "Boulevard Tirou, 255", "Charleroi", null, "B-6000", "Belgium"],
    [10253, "HANAR", 3, "1996-07-10", "1996-07-24", "1996-07-16", 2, 58.17, "Hanari Carnes", "Rua do Paco, 67", "Rio de Janeiro", "RJ", "05454-876", "Brazil"],
    [10254, "CHOPS", 5, "1996-07-11", "1996-08-08", "1996-07-23", 2, 22.98, "Chop-suey Chinese", "Hauptstr. 31", "Bern", null, "3012", "Switzerland"],
    [10255, "RICSU", 4, "1996-07-12", "1996-08-09", "1996-07-15", 3, 148.33, "Richter Supermarkt", "Starenweg 5", "Geneva", null, "1204", "Switzerland"],
    [10256, "WELLI", 3, "1996-07-15", "1996-08-12", "1996-07-17", 2, 13.97, "Wellington Importadora", "Rua do Mercado, 12", "Resende", "SP", "08737-363", "Brazil"],
    [10257, "HILAA", 4, "1996-07-16", "1996-08-13", "1996-07-22", 3, 81.91, "HILARI0N-Abastos", "Carrera 22 con Ave.", "San Cristobal", "Tachira", "5022", "Venezuela"],
  ];

  for (const [id, customer_id, employee_id, order_date, required_date, shipped_date, shipper_id, freight, ship_name, ship_address, ship_city, ship_region, ship_postal_code, ship_country] of orders) {
    const regionVal = ship_region === null ? "NULL" : `'${ship_region}'`;
    await db
      .run(
        sql.raw(
          `INSERT INTO orders VALUES (${id}, '${customer_id}', ${employee_id}, '${order_date}', '${required_date}', '${shipped_date}', ${shipper_id}, ${freight}, '${ship_name}', '${ship_address}', '${ship_city}', ${regionVal}, '${ship_postal_code}', '${ship_country}')`
        )
      )
      .execute();
  }

  // Seed order_details (25 sample line items)
  // Using valid product IDs (1-20)
  const orderDetails = [
    [1, 10248, 11, 14.0, 12, 0],
    [2, 10248, 2, 9.8, 10, 0],
    [3, 10248, 12, 34.8, 5, 0],
    [4, 10249, 14, 18.6, 9, 0],
    [5, 10249, 1, 18.0, 40, 0],
    [6, 10250, 11, 7.7, 10, 0],
    [7, 10250, 1, 18.0, 35, 0.15],
    [8, 10250, 5, 21.35, 15, 0.15],
    [9, 10251, 12, 38.0, 6, 0.05],
    [10, 10251, 7, 30.0, 15, 0.05],
    [11, 10251, 15, 15.5, 20, 0],
    [12, 10252, 20, 4.5, 40, 0.05],
    [13, 10252, 13, 6.0, 25, 0.05],
    [14, 10252, 10, 31.0, 40, 0],
    [15, 10253, 11, 21.0, 20, 0],
    [16, 10253, 9, 97.0, 42, 0],
    [17, 10253, 19, 9.2, 40, 0],
    [18, 10254, 4, 22.0, 15, 0.15],
    [19, 10254, 5, 21.35, 21, 0.15],
    [20, 10254, 14, 23.25, 21, 0],
    [21, 10255, 2, 19.0, 20, 0],
    [22, 10255, 16, 17.45, 35, 0],
    [23, 10255, 6, 25.0, 25, 0],
    [24, 10255, 9, 97.0, 30, 0],
    [25, 10256, 3, 10.0, 15, 0],
  ];

  for (const [id, order_id, product_id, unit_price, quantity, discount] of orderDetails) {
    await db.run(sql.raw(`INSERT INTO order_details VALUES (${id}, ${order_id}, ${product_id}, ${unit_price}, ${quantity}, ${discount})`)).execute();
  }

  return db;
}
