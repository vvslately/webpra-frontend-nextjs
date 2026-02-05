"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Table, Key, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Column = {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  comment?: string;
  key?: string;
};

type ForeignKey = {
  column: string;
  references: string;
  onDelete?: string;
  onUpdate?: string;
};

type TableInfo = {
  name: string;
  engine?: string;
  charset?: string;
  columns: Column[];
  primaryKeys: string[];
  foreignKeys: ForeignKey[];
  indexes: string[];
};

const databaseSchema: TableInfo[] = [
  {
    name: "about",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "image_url",
        type: "varchar(500)",
        nullable: true,
        comment: "URL รูปภาพ",
      },
      {
        name: "content",
        type: "text",
        nullable: true,
        comment: "ข้อความเกี่ยวกับเรา",
      },
      {
        name: "updated_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [],
    indexes: [],
  },
  {
    name: "contacts",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "name",
        type: "varchar(100)",
        nullable: false,
        comment: "ชื่อ",
      },
      {
        name: "phone",
        type: "varchar(20)",
        nullable: true,
        comment: "โทรศัพท์",
      },
      {
        name: "email",
        type: "varchar(150)",
        nullable: true,
        comment: "อีเมล",
      },
      {
        name: "message",
        type: "text",
        nullable: false,
        comment: "ข้อความ",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [],
    indexes: ["created_at"],
  },
  {
    name: "order_items",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "order_id",
        type: "int",
        nullable: false,
      },
      {
        name: "product_id",
        type: "int",
        nullable: false,
      },
      {
        name: "product_name",
        type: "varchar(255)",
        nullable: false,
      },
      {
        name: "product_image",
        type: "varchar(500)",
        nullable: true,
      },
      {
        name: "price",
        type: "decimal(10,2)",
        nullable: false,
      },
      {
        name: "qty",
        type: "int",
        nullable: false,
        default: "1",
      },
      {
        name: "selected_options",
        type: "json",
        nullable: true,
        comment: 'JSON เก็บ options ที่เลือก เช่น {"สี": "แดง", "ขนาด": "L"}',
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [
      {
        column: "order_id",
        references: "orders(id)",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      {
        column: "product_id",
        references: "products(id)",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
    ],
    indexes: ["order_id", "product_id"],
  },
  {
    name: "orders",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "user_id",
        type: "int",
        nullable: true,
        comment: "ผู้ซื้อ (null = ลูกค้าทั่วไป)",
      },
      {
        name: "first_name",
        type: "varchar(100)",
        nullable: false,
        comment: "ชื่อจริง",
      },
      {
        name: "last_name",
        type: "varchar(100)",
        nullable: false,
        comment: "นามสกุล",
      },
      {
        name: "phone",
        type: "varchar(20)",
        nullable: false,
        comment: "เบอร์ติดต่อ",
      },
      {
        name: "address",
        type: "text",
        nullable: false,
        comment: "ที่อยู่จัดส่ง",
      },
      {
        name: "total",
        type: "decimal(10,2)",
        nullable: false,
        default: "0.00",
      },
      {
        name: "status",
        type: "varchar(20)",
        nullable: false,
        default: "pending",
        comment: "pending, paid, shipped, cancelled",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
      {
        name: "updated_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [
      {
        column: "user_id",
        references: "users(id)",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
    ],
    indexes: ["user_id", "status", "created_at"],
  },
  {
    name: "product_option_combinations",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "product_id",
        type: "int",
        nullable: false,
      },
      {
        name: "combination",
        type: "json",
        nullable: false,
        comment: 'JSON เก็บ combination เช่น {"สี": ["แดง"], "ขนาด": ["L"]}',
      },
      {
        name: "price_adjustment",
        type: "decimal(10,2)",
        nullable: true,
        default: "0.00",
        comment: "การปรับราคา (บวก/ลบ)",
      },
      {
        name: "display_order",
        type: "int",
        nullable: false,
        default: "0",
        comment: "ลำดับการแสดง",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [
      {
        column: "product_id",
        references: "products(id)",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    ],
    indexes: ["product_id"],
  },
  {
    name: "product_option_values",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "option_id",
        type: "int",
        nullable: false,
      },
      {
        name: "value",
        type: "varchar(100)",
        nullable: false,
        comment: "ค่าของ option เช่น แดง, S",
      },
      {
        name: "description",
        type: "text",
        nullable: true,
        comment: "คำบรรยายค่าของ option",
      },
      {
        name: "price_adjustment",
        type: "decimal(10,2)",
        nullable: true,
        default: "0.00",
        comment: "การปรับราคา (บวก/ลบ)",
      },
      {
        name: "image_url",
        type: "varchar(500)",
        nullable: true,
        comment: "URL รูปภาพของ option นี้",
      },
      {
        name: "display_order",
        type: "int",
        nullable: false,
        default: "0",
        comment: "ลำดับการแสดง",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [
      {
        column: "option_id",
        references: "product_options(id)",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    ],
    indexes: ["option_id"],
  },
  {
    name: "product_options",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "product_id",
        type: "int",
        nullable: false,
      },
      {
        name: "name",
        type: "varchar(100)",
        nullable: false,
        comment: "ชื่อ option เช่น สี, ขนาด",
      },
      {
        name: "description",
        type: "text",
        nullable: true,
        comment: "คำบรรยาย option",
      },
      {
        name: "display_order",
        type: "int",
        nullable: false,
        default: "0",
        comment: "ลำดับการแสดง",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [
      {
        column: "product_id",
        references: "products(id)",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    ],
    indexes: ["product_id"],
  },
  {
    name: "products",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "name",
        type: "varchar(255)",
        nullable: false,
      },
      {
        name: "subtitle",
        type: "varchar(500)",
        nullable: true,
      },
      {
        name: "image",
        type: "varchar(500)",
        nullable: true,
      },
      {
        name: "price",
        type: "decimal(10,2)",
        nullable: true,
        default: "0.00",
      },
      {
        name: "delivery_method",
        type: "varchar(100)",
        nullable: true,
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
      {
        name: "updated_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [],
    indexes: ["name"],
  },
  {
    name: "reviews",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "author_name",
        type: "varchar(100)",
        nullable: false,
      },
      {
        name: "content",
        type: "text",
        nullable: false,
      },
      {
        name: "rating",
        type: "tinyint unsigned",
        nullable: true,
        comment: "1-5",
      },
      {
        name: "product_id",
        type: "int",
        nullable: true,
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [
      {
        column: "product_id",
        references: "products(id)",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
    ],
    indexes: ["product_id", "created_at"],
  },
  {
    name: "users",
    engine: "InnoDB",
    charset: "utf8mb4_unicode_ci",
    columns: [
      {
        name: "id",
        type: "int",
        nullable: false,
        key: "PRIMARY",
      },
      {
        name: "username",
        type: "varchar(50)",
        nullable: false,
      },
      {
        name: "email",
        type: "varchar(100)",
        nullable: false,
      },
      {
        name: "password",
        type: "varchar(255)",
        nullable: false,
      },
      {
        name: "role",
        type: "enum('admin','user')",
        nullable: false,
        default: "user",
      },
      {
        name: "balance",
        type: "decimal(10,2)",
        nullable: false,
        default: "0.00",
        comment: "เงินที่ user เก็บได้",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP",
      },
      {
        name: "updated_at",
        type: "timestamp",
        nullable: true,
        default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    ],
    primaryKeys: ["id"],
    foreignKeys: [],
    indexes: ["username", "email"],
  },
];

export default function DataDictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTables = databaseSchema.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.columns.some((col) =>
      col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Database className="h-10 w-10" />
              Data Dictionary
            </h1>
            <p className="text-muted-foreground mt-2">
              เอกสารอธิบายโครงสร้างฐานข้อมูลทั้งหมด
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ค้นหาตารางหรือคอลัมน์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tables */}
        <div className="space-y-6">
          {filteredTables.map((table) => (
            <Card key={table.name} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Table className="h-6 w-6" />
                    <CardTitle className="text-2xl">{table.name}</CardTitle>
                  </div>
                  <div className="text-sm text-muted-foreground space-x-4">
                    {table.engine && <span>Engine: {table.engine}</span>}
                    {table.charset && <span>Charset: {table.charset}</span>}
                  </div>
                </div>
                <CardDescription>
                  {table.columns.length} คอลัมน์ • {table.foreignKeys.length} Foreign Keys •{" "}
                  {table.indexes.length} Indexes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Columns Table */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Columns</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-semibold">Column Name</th>
                          <th className="text-left p-2 font-semibold">Data Type</th>
                          <th className="text-left p-2 font-semibold">Nullable</th>
                          <th className="text-left p-2 font-semibold">Default</th>
                          <th className="text-left p-2 font-semibold">Key</th>
                          <th className="text-left p-2 font-semibold">Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((column) => (
                          <tr key={column.name} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono text-sm">
                              {column.name}
                              {table.primaryKeys.includes(column.name) && (
                                <Key className="inline-block h-3 w-3 ml-1 text-primary" />
                              )}
                            </td>
                            <td className="p-2 font-mono text-sm text-muted-foreground">
                              {column.type}
                            </td>
                            <td className="p-2">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  column.nullable
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                }`}
                              >
                                {column.nullable ? "NULL" : "NOT NULL"}
                              </span>
                            </td>
                            <td className="p-2 font-mono text-xs text-muted-foreground">
                              {column.default || "-"}
                            </td>
                            <td className="p-2">
                              {column.key && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                  {column.key}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {column.comment || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Primary Keys */}
                {table.primaryKeys.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Primary Keys
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {table.primaryKeys.map((pk) => (
                        <span
                          key={pk}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-mono"
                        >
                          {pk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Foreign Keys */}
                {table.foreignKeys.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Foreign Keys</h3>
                    <div className="space-y-2">
                      {table.foreignKeys.map((fk, idx) => (
                        <div
                          key={idx}
                          className="p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold">{fk.column}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-mono text-sm">{fk.references}</span>
                          </div>
                          {(fk.onDelete || fk.onUpdate) && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {fk.onDelete && <span>ON DELETE: {fk.onDelete}</span>}
                              {fk.onDelete && fk.onUpdate && <span> • </span>}
                              {fk.onUpdate && <span>ON UPDATE: {fk.onUpdate}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indexes */}
                {table.indexes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Indexes</h3>
                    <div className="flex flex-wrap gap-2">
                      {table.indexes.map((idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-mono"
                        >
                          {idx}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-2xl font-bold">{databaseSchema.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Columns</p>
                <p className="text-2xl font-bold">
                  {databaseSchema.reduce((sum, table) => sum + table.columns.length, 0)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Foreign Keys</p>
                <p className="text-2xl font-bold">
                  {databaseSchema.reduce((sum, table) => sum + table.foreignKeys.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
