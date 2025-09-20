import { Order } from "../../entities/Order.entity";

export function applyDeliveryToOrder(order: Order, delivery: any) {
  order.delivery_id = delivery.id;
  order.delivery_fee = delivery.delivery_fee || 0;
  order.delivery_address = delivery.delivery_address;
  order.delivery_location = delivery.delivery_location;

  return order;
}
