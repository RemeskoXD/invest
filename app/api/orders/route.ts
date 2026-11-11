import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { orderSchema, OrderRecord } from '@/lib/validations';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

// In-memory sliding-window rate limiter for OWASP compliance
const ipSubmissions = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minut
const MAX_ORDERS_PER_WINDOW = 6;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipSubmissions.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_ORDERS_PER_WINDOW) {
    return true;
  }
  timestamps.push(now);
  ipSubmissions.set(ip, timestamps);
  return false;
}

// Ensure data folder and file exist
function getOrders(): OrderRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

function saveOrders(orders: OrderRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving orders file:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization header or query param if needed
    const orders = getOrders();
    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Byl překročen bezpečnostní limit pro odesílání formulářů. Zkuste to prosím za několik minut.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate body structure with Zod
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatná data objednávky', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const orderRecord: OrderRecord = {
      ...parsed.data,
      id: typeof body.id === 'string' ? body.id : `ord_${Date.now()}`,
      timestamp: typeof body.timestamp === 'string' ? body.timestamp : new Date().toISOString(),
      vs: typeof body.vs === 'string' ? body.vs : `${Date.now()}`.slice(-10),
      rate: typeof body.rate === 'number' ? body.rate : 0.045,
      status: 'pending',
    };

    const currentOrders = getOrders();
    currentOrders.unshift(orderRecord);
    saveOrders(currentOrders);

    return NextResponse.json({ success: true, order: orderRecord }, { status: 201 });
  } catch (err) {
    console.error('API Orders POST error:', err);
    return NextResponse.json({ error: 'Chyba při ukládání objednávky' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    if (!id || !['pending', 'paid', 'sent'].includes(status)) {
      return NextResponse.json({ error: 'Neplatný požadavek' }, { status: 400 });
    }

    const currentOrders = getOrders();
    const idx = currentOrders.findIndex((o) => o.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Objednávka nenalezena' }, { status: 404 });
    }

    currentOrders[idx].status = status;
    saveOrders(currentOrders);

    return NextResponse.json({ success: true, order: currentOrders[idx] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Chyba aktualizace objednávky' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (id === 'all') {
      saveOrders([]);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const currentOrders = getOrders();
    const filtered = currentOrders.filter((o) => o.id !== id);
    saveOrders(filtered);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Chyba při mazání objednávky' }, { status: 500 });
  }
}