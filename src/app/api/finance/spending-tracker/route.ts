import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const requiredColumns = ["tipo", "data", "valor", "descricao"] as const;
const maxPageSize = 100;
const createManyChunkSize = 1000;
const sourceTypes = ["extrato", "fatura"] as const;

type AccountSpendSourceType = (typeof sourceTypes)[number];

type ParsedSpendRow = {
  amount: number;
  date: Date;
  description: string;
  month: string;
  type: string;
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseCsvLine(line: string, delimiter: "," | ";") {
  const fields: string[] = [];
  let current = "";
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && isQuoted && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (char === delimiter && !isQuoted) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());

  return fields;
}

function parseMoney(value: string) {
  const compactValue = value
    .replace(/\s/g, "")
    .replace(/[R$]/gi, "");
  const lastCommaIndex = compactValue.lastIndexOf(",");
  const lastDotIndex = compactValue.lastIndexOf(".");
  const decimalSeparator =
    lastCommaIndex > lastDotIndex
      ? ","
      : lastDotIndex > -1
        ? "."
        : undefined;
  const normalizedValue = decimalSeparator
    ? compactValue
        .replace(new RegExp(`\\${decimalSeparator === "," ? "." : ","}`, "g"), "")
        .replace(decimalSeparator, ".")
    : compactValue;
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function parseDate(value: string) {
  const trimmedValue = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);
  const brMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedValue);
  const ofxMatch = /^(\d{4})(\d{2})(\d{2})/.exec(trimmedValue);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (brMatch) {
    const [, day, month, year] = brMatch;
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (ofxMatch) {
    const [, year, month, day] = ofxMatch;
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function getMonthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function normalizeSpendType(value: string, amount?: number) {
  const normalizedValue = normalizeHeader(value);

  if (
    normalizedValue.includes("credit") ||
    normalizedValue.includes("credito") ||
    normalizedValue.includes("income") ||
    normalizedValue.includes("entrada") ||
    normalizedValue.includes("receita") ||
    (amount !== undefined && amount > 0 && !normalizedValue)
  ) {
    return "income";
  }

  return "expense";
}

function normalizeSourceType(value: FormDataEntryValue | string | null) {
  return sourceTypes.includes(value as AccountSpendSourceType)
    ? (value as AccountSpendSourceType)
    : "extrato";
}

function parseSpendCsv(csvText: string) {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { error: "CSV must include a header and at least one row." };
  }

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeHeader);
  const columnIndexes = Object.fromEntries(
    requiredColumns.map((column) => [column, headers.indexOf(column)])
  ) as Record<(typeof requiredColumns)[number], number>;
  const missingColumn = requiredColumns.find(
    (column) => columnIndexes[column] === -1
  );

  if (missingColumn) {
    return {
      error:
        "CSV must include the columns tipo, Data, valor, descricao. Keep these exact meanings in the header.",
    };
  }

  const rows: ParsedSpendRow[] = [];
  const months = new Set<string>();

  for (let index = 1; index < lines.length; index += 1) {
    const fields = parseCsvLine(lines[index], delimiter);
    const date = parseDate(fields[columnIndexes.data] ?? "");
    const amount = parseMoney(fields[columnIndexes.valor] ?? "");
    const description = (fields[columnIndexes.descricao] ?? "").trim();
    const rawType = (fields[columnIndexes.tipo] ?? "").trim();
    const type = normalizeSpendType(rawType);

    if (!date || amount === null || !description || !rawType) {
      return {
        error: `Invalid CSV row ${index + 1}. tipo, Data, valor, and descricao are required.`,
      };
    }

    const month = getMonthKey(date);
    months.add(month);
    rows.push({ amount, date, description, month, type });
  }

  return { month: rows[0]?.month, rows };
}

function getOfxTag(block: string, tagName: string) {
  const match = new RegExp(`<${tagName}>([^<\\r\\n]+)`, "i").exec(block);

  return match?.[1]?.trim() ?? "";
}

function parseSpendOfx(ofxText: string) {
  const transactionBlocks = ofxText.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|<\/CREDITCARDMSGSRSV1>|$)/gi);

  if (!transactionBlocks?.length) {
    return { error: "OFX must include at least one STMTTRN transaction." };
  }

  const rows: ParsedSpendRow[] = [];
  const months = new Set<string>();

  for (let index = 0; index < transactionBlocks.length; index += 1) {
    const block = transactionBlocks[index];
    const rawAmount = getOfxTag(block, "TRNAMT");
    const parsedAmount = Number(rawAmount.replace(",", "."));
    const date = parseDate(getOfxTag(block, "DTPOSTED"));
    const description =
      getOfxTag(block, "MEMO") ||
      getOfxTag(block, "NAME") ||
      getOfxTag(block, "CHECKNUM") ||
      "OFX transaction";
    const type = normalizeSpendType(getOfxTag(block, "TRNTYPE"), parsedAmount);

    if (!date || !Number.isFinite(parsedAmount) || !description || !type) {
      return {
        error: `Invalid OFX transaction ${index + 1}. tipo, Data, valor, and descricao are required.`,
      };
    }

    const month = getMonthKey(date);
    months.add(month);
    rows.push({
      amount: parsedAmount,
      date,
      description,
      month,
      type,
    });
  }

  return { month: rows[0]?.month, rows };
}

function parseSpendFile(fileName: string, fileText: string) {
  const lowerFileName = fileName.toLowerCase();

  if (lowerFileName.endsWith(".ofx") || fileText.toUpperCase().includes("<OFX")) {
    return parseSpendOfx(fileText);
  }

  return parseSpendCsv(fileText);
}

function normalizeSpendImport(importRecord: {
  createdAt: Date;
  id: string;
  month: string;
  name: string;
  rowCount: number;
  sourceType: string;
}) {
  return {
    createdAt: importRecord.createdAt,
    id: importRecord.id,
    month: importRecord.month,
    name: importRecord.name,
    rowCount: importRecord.rowCount,
    sourceType: importRecord.sourceType as AccountSpendSourceType,
  };
}

function getLatestMonth(rows: ParsedSpendRow[]) {
  return rows.reduce(
    (latestMonth, row) => (row.month > latestMonth ? row.month : latestMonth),
    rows[0]?.month ?? ""
  );
}

function normalizeDailyChartRow(row: {
  day: Date | string;
  expense: number | string;
  income: number | string;
}) {
  return {
    day:
      row.day instanceof Date
        ? row.day.toISOString().slice(0, 10)
        : String(row.day).slice(0, 10),
    expense: Number(row.expense),
    income: Number(row.income),
  };
}

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const searchParams = req.nextUrl.searchParams;
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const requestedPageSize = Number(searchParams.get("pageSize") ?? "25");
  const selectedMonth = searchParams.get("month") || undefined;
  const sourceType = normalizeSourceType(searchParams.get("sourceType"));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize =
    Number.isInteger(requestedPageSize) && requestedPageSize > 0
      ? Math.min(requestedPageSize, maxPageSize)
      : 25;

  const availableMonths = await prisma.accountSpendEntry.findMany({
    distinct: ["month"],
    orderBy: { month: "desc" },
    select: { month: true },
    where: { sourceType, userId },
  });
  const month = selectedMonth ?? availableMonths[0]?.month;

  if (!month) {
    return NextResponse.json({
      entries: [],
      imports: [],
      months: [],
      pagination: {
        page: 1,
        pageSize,
        totalItems: 0,
        totalPages: 1,
      },
      summary: {
        daily: [],
        importCount: 0,
        month: null,
        netTotal: 0,
        rowCount: 0,
        totalExpense: 0,
        totalIncome: 0,
      },
    });
  }

  const where = { month, sourceType, userId };
  const [entries, imports, totalItems, dailyTotals] = await Promise.all([
    prisma.accountSpendEntry.findMany({
      include: { import: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
    }),
    prisma.accountSpendImport.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        sourceType,
        userId,
        entries: {
          some: where,
        },
      },
    }),
    prisma.accountSpendEntry.count({ where }),
    prisma.$queryRaw<
      Array<{ day: Date; expense: number; income: number }>
    >`
      SELECT
        DATE("date") AS day,
        COALESCE(SUM(CASE WHEN "amount" > 0 THEN "amount" ELSE 0 END), 0)::float AS income,
        ABS(COALESCE(SUM(CASE WHEN "amount" < 0 THEN "amount" ELSE 0 END), 0))::float AS expense
      FROM "AccountSpendEntry"
      WHERE "userId" = ${userId}
        AND "sourceType" = ${sourceType}
        AND "month" = ${month}
      GROUP BY DATE("date")
      ORDER BY day ASC
    `,
  ]);
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const daily = dailyTotals.map(normalizeDailyChartRow);
  const totalIncome = daily.reduce((total, item) => total + item.income, 0);
  const totalExpense = daily.reduce((total, item) => total + item.expense, 0);
  const netTotal = totalIncome - totalExpense;

  return NextResponse.json({
    entries: entries.map((entry) => ({
      amount: Number(entry.amount),
      date: entry.date,
      description: entry.description,
      id: entry.id,
      import: normalizeSpendImport(entry.import),
      importId: entry.importId,
      sourceType: entry.sourceType as AccountSpendSourceType,
      type: entry.type,
    })),
    imports: imports.map(normalizeSpendImport),
    months: availableMonths.map((item) => item.month),
    pagination: {
      page: Math.min(page, totalPages),
      pageSize,
      totalItems,
      totalPages,
    },
    summary: {
      daily,
      importCount: imports.length,
      month,
      netTotal,
      rowCount: totalItems,
      totalExpense,
      totalIncome,
    },
  });
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const formData = await req.formData();
    const name = String(formData.get("name") ?? "").trim();
    const file = formData.get("file");
    const sourceType = normalizeSourceType(formData.get("sourceType"));

    if (!name || !(file instanceof File)) {
      return NextResponse.json(
        { message: "Tracker name and CSV or OFX file are required." },
        { status: 400 }
      );
    }

    const parsedCsv = parseSpendFile(file.name, await file.text());

    if ("error" in parsedCsv) {
      return NextResponse.json({ message: parsedCsv.error }, { status: 400 });
    }

    const { rows } = parsedCsv;
    const month = getLatestMonth(rows);

    if (!month || rows.length === 0) {
      return NextResponse.json(
        { message: "File must include at least one valid spending row." },
        { status: 400 }
      );
    }

    const importRecord = await prisma.$transaction(async (transaction) => {
      const createdImport = await transaction.accountSpendImport.create({
        data: {
          month,
          name,
          rowCount: rows.length,
          sourceType,
          userId,
        },
      });

      for (let index = 0; index < rows.length; index += createManyChunkSize) {
        const chunk = rows.slice(index, index + createManyChunkSize);

        await transaction.accountSpendEntry.createMany({
          data: chunk.map((row) => ({
            amount: row.amount,
            date: row.date,
            description: row.description,
            importId: createdImport.id,
            month: row.month,
            sourceType,
            type: row.type,
            userId,
          })),
        });
      }

      return createdImport;
    });

    return NextResponse.json(
      {
        import: normalizeSpendImport(importRecord),
        insertedRows: rows.length,
        month,
        sourceType,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to import spending CSV." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const importId = req.nextUrl.searchParams.get("importId");

  if (!importId) {
    return NextResponse.json(
      { message: "Import id is required." },
      { status: 400 }
    );
  }

  try {
    const deletedImport = await prisma.accountSpendImport.deleteMany({
      where: {
        id: importId,
        userId,
      },
    });

    if (deletedImport.count === 0) {
      return NextResponse.json(
        { message: "Import not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete import." },
      { status: 500 }
    );
  }
}
