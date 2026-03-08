import { sql } from "drizzle-orm";
import { integer, text, real, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("staff"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const medicines = sqliteTable("medicines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  generic: text("generic"),
  company: text("company"),
  batch: text("batch"),
  expiry: text("expiry"),
  mrp: real("mrp").notNull(),
  purchasePrice: real("purchase_price"),
  stock: integer("stock").default(0),
  unit: text("unit").default("strip"),
  rack: text("rack"),
  hsn: text("hsn"),
  gst: real("gst").default(12),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  age: integer("age"),
  gender: text("gender"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  gstNo: text("gst_no"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  billNo: text("bill_no").notNull(),
  patientId: integer("patient_id"),
  patientName: text("patient_name"),
  patientPhone: text("patient_phone"),
  subtotal: real("subtotal").notNull(),
  discount: real("discount").default(0),
  gstAmount: real("gst_amount").default(0),
  netAmount: real("net_amount").notNull(),
  paymentType: text("payment_type").default("cash"),
  paidAmount: real("paid_amount").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const saleItems = sqliteTable("sale_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saleId: integer("sale_id").notNull(),
  medicineId: integer("medicine_id"),
  medicineName: text("medicine_name").notNull(),
  batch: text("batch"),
  expiry: text("expiry"),
  qty: integer("qty").notNull(),
  mrp: real("mrp").notNull(),
  discount: real("discount").default(0),
  gst: real("gst").default(0),
  amount: real("amount").notNull(),
});

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  supplierId: integer("supplier_id"),
  supplierName: text("supplier_name"),
  invoiceNo: text("invoice_no"),
  totalAmount: real("total_amount").notNull(),
  paidAmount: real("paid_amount").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const purchaseItems = sqliteTable("purchase_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  purchaseId: integer("purchase_id").notNull(),
  medicineId: integer("medicine_id"),
  medicineName: text("medicine_name").notNull(),
  batch: text("batch"),
  expiry: text("expiry"),
  qty: integer("qty").notNull(),
  purchasePrice: real("purchase_price").notNull(),
  mrp: real("mrp").notNull(),
  gst: real("gst").default(12),
  amount: real("amount").notNull(),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saleId: integer("sale_id").notNull(),
  patientName: text("patient_name"),
  amount: real("amount").notNull(),
  mode: text("mode").default("cash"),
  note: text("note"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});
