import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  OrderStatus,
  MedicineOrderStatus,
} from '@prisma/client';


const prisma = new PrismaClient();

@Injectable()
export class OrderService {

  async getReceivedOrdersHistory(shopId: number) {
  const rows = await prisma.orderReceived.findMany({
    where: {
      shop_id: shopId,
      status: OrderStatus.RECEIVED,
      received_date: { not: null },
    },
    orderBy: { received_date: 'desc' },
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
          category: true,
          stock: true,
          reorder: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
        },
      },
    },
  });

  return rows.map((r) => ({
    order_id: r.id,
    quantity: r.quantity,
    order_date: r.order_date,
    received_date: r.received_date,
    medicine: r.medicine,
    supplier: r.supplier,
  }));
}

async receiveOrders(shopId: number, orders: { order_id: number }[]) {
  console.log('Received orders:', orders);
  console.log('Shop ID:', shopId);

  try {
    return await prisma.$transaction(async (tx) => {
      let receivedCount = 0;

      for (const o of orders) {
        // 1) Fetch order (only what we need)
        const order = await tx.orderReceived.findUnique({
          where: { id: o.order_id },
          select: { id: true, medicine_id: true, shop_id: true, status: true },
        });

        if (!order) {
          console.warn(`Order ID ${o.order_id} not found, skipping`);
          continue;
        }

        // ✅ Ensure the order belongs to this shop
        if (order.shop_id !== shopId) {
          console.warn(`Order ID ${o.order_id} does not belong to shop ${shopId}, skipping`);
          continue;
        }

        // Optional: skip if already received
        if (order.status === OrderStatus.RECEIVED) {
          continue;
        }

        // 2) Update order to RECEIVED
        await tx.orderReceived.update({
          where: { id: o.order_id },
          data: {
            status: OrderStatus.RECEIVED,
            received_date: new Date(),
          },
        });

        // 3) Update medicine order_status (belongs to shop)
        // If medicine id is unique, updateMany is not needed.
        await tx.medicine.updateMany({
          where: {
            id: order.medicine_id,
            shop_id: shopId,
          },
          data: {
            order_status: MedicineOrderStatus.NOT_ORDERED,
          },
        });

        receivedCount++;
      }

      return {
        success: true,
        message: 'Orders received successfully',
        received_count: receivedCount, // ✅ real count
      };
    });
  } catch (error) {
    console.error('Receive orders error:', error);
    throw new Error('Failed to receive orders');
  }
}


async getOrderedMedicines(shopId: number) {
  const orders = await prisma.orderReceived.findMany({
    where: {
      shop_id: shopId,
      status: 'ORDERED',
    },
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
          category: true,
          stock: true,
          reorder: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  return orders.map(o => ({
    order_id: o.id,
    order_date: o.order_date,
    quantity: o.quantity,
    medicine: {
      id: o.medicine.id,
      name: o.medicine.name,
      category: o.medicine.category,
      current_stock: o.medicine.stock,   // ✅ now guaranteed
      reorder_level: o.medicine.reorder, // ✅ now guaranteed
    },
    supplier: {
      id: o.supplier.id,
      name: o.supplier.name,
      phone: o.supplier.phone,
      email: o.supplier.email,
    },
  }));
}

async getSupplierWiseOrdered(shopId: number) {
  const orders = await prisma.orderReceived.findMany({
    where: {
      shop_id: shopId,
      status: 'ORDERED',
    },
    include: {
      medicine: true,
      supplier: true,
    },
  });

  const grouped: Record<number, any> = {};

  for (const o of orders) {
    const s = o.supplier;

    if (!grouped[s.id]) {
      grouped[s.id] = {
        supplier: {
          id: s.id,
          name: s.name,
          phone: s.phone,
        },
        medicines: [],
      };
    }

    grouped[s.id].medicines.push({
      medicine_id: o.medicine.id,
      medicine_name: o.medicine.name,
      category: o.medicine.category,
      current_stock: o.medicine.stock,   // ✅ now guaranteed
      reorder_level: o.medicine.reorder, // ✅ now guaranteed
      ordered_qty: o.quantity,
      order_date: o.order_date,
    });
  }

  return Object.values(grouped);
}

}
