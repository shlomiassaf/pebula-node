// tslint:disable: variable-name
import { GtDocument, GtColumn, GtInitHook } from '../decorators';
import { GtModel } from './mixin';

import {
  initMongoConnection,

  Order,
  OrderStatusType,
  CreditCardPaymentMethod,
  CreditCardPaymentMethodExpire,
  Customer,
  OrderItem,
  PickupSupplierInfo,
  SupplierInfoSubDocument,
} from '../../tests';

describe('goosetyped', () => {
  initMongoConnection();

  describe('Single Non Embedded Models', () => {

    beforeEach(() => {
      Order.INSTANCE_COUNTER = 1;
      Customer.INSTANCE_COUNTER = 1;
    });

    it('should create a model instance from a plain object and run the constructor', async () => {
      const order1 = await Order.create({});
      // if it didn't run the ctor, order id will not be set.
      const order2 = await Order.create({ status: OrderStatusType.Closed });

      expect(order1.instanceId).toBe(1);
      expect(order1.localProp).toBeTruthy();
      expect(order2.instanceId).toBe(2);
      expect(order2.localProp).toBeTruthy();
      expect(order2.status).toBe(OrderStatusType.Closed);
    });

    it('should pass-through model instances instead of creating new ones (expect for embedded models)', async () => {
      const order = new Order({ status: OrderStatusType.Closed });
      const order1 = await Order.create(order);
      // if it ran twice, instanceId should be 3 in the 2nd create...
      const order2 = await Order.create({});

      expect(order).toBe(order1);
      expect(order1.instanceId).toBe(1);
      expect(order2.instanceId).toBe(2);
      expect(order1.status).toBe(OrderStatusType.Closed);
    });

    it('should reflect proper class types (simple, not embedded)', async () => {
      const order = new Order();
      const order1 = await Order.create(order);
      const order2 = await Order.create({});

      expect(order).toBeInstanceOf(Order);
      expect(order1).toBeInstanceOf(Order);
      expect(order2).toBeInstanceOf(Order);

      expect(order.constructor).toBe(Order);
      expect(order1.constructor).toBe(Order);
      expect(order2.constructor).toBe(Order);
    });
  });

  describe('Single Embedded Models', () => {

    beforeEach(() => {
      Order.INSTANCE_COUNTER = 1;
      Customer.INSTANCE_COUNTER = 1;
    });

    it('should create a wrapped model instance from an indirect plain object and run the constructor', async () => {
      const order1 = await Order.create({
        customer: {
          name: 'Testing Joe',
        },
      });
      const order2 = await Order.create({
        customer: {
          name: 'Testing Moe',
        },
      });

      expect(order1.customer.instanceId).toBe(1);
      expect(order1.customer.name).toBe('Testing Joe');
      expect(order2.customer.instanceId).toBe(2);
      expect(order2.customer.name).toBe('Testing Moe');

      expect(order1.customer).toBeInstanceOf(Customer);
      expect(order2.customer).toBeInstanceOf(Customer);
      expect(order1.customer.constructor).not.toBe(Customer);
      expect(order2.customer.constructor).not.toBe(Customer);
    });

    it('should create a wrapped model instance from a direct instance', async () => {
      const customer1 = new Customer({ name: 'Testing Joe' });
      const customer2 = new Customer({ name: 'Testing Moe' });

      const order = new Order({ customer: customer1 });
      const order1 = await Order.create(order);
      const order2 = await Order.create({ customer: customer2 });

      expect(order1.customer.instanceId).toBe(1);
      expect(order1.customer.name).toBe('Testing Joe');
      expect(order2.customer.instanceId).toBe(2);
      expect(order2.customer.name).toBe('Testing Moe');

      expect(order1.customer).toBeInstanceOf(Customer);
      expect(order2.customer).toBeInstanceOf(Customer);
      expect(order1.customer.constructor).not.toBe(Customer);
      expect(order2.customer.constructor).not.toBe(Customer);
    });

    it('should keep binding between wrapped and direct model instances as embedded documents', async () => {
      const customer1 = new Customer({ name: 'Testing Joe' });
      const customer2 = new Customer({ name: 'Testing Moe' });
      const customer3: Partial<Customer> = { name: 'Testing Boe' };

      const order = new Order({ customer: customer1 });
      const order1 = await Order.create(order);
      const order2 = await Order.create({ customer: customer2 });
      const order3 = await Order.create({ customer: customer3 });

      const paris: Array<[Partial<Customer>, Order]> = [
        [customer1, order1],
        [customer2, order2],
        [customer3, order3],
      ];

      for (const [c, o] of paris) {
        expect(o.customer).toBeInstanceOf(Customer);
        expect(o.customer.name).toBe(c.name);
        expect(o.customer.localProp).toBeTruthy();
      }

      customer1.localProp = 'localProp';
      expect(customer1.localProp).toBe('localProp');
      expect(order1.customer.localProp).toBe('localProp');

      customer1.name = 'Nothing';
      expect(customer1.name).toBe('Nothing');
      expect(order1.customer.name).toBe('Nothing');

      order2.customer.name = 'Something';
      expect(customer2.name).toBe('Something');
      expect(order2.customer.name).toBe('Something');

      let desc = Object.getOwnPropertyDescriptor(customer1, 'name');
      expect(desc.get()).toBe(order1.customer.name);
      desc.set('123');
      expect(customer1.name).toBe('123');
      expect(order1.customer.name).toBe('123');

      desc = Object.getOwnPropertyDescriptor(customer1, 'localProp');
      expect(desc.get()).toBe(order1.customer.localProp);
      desc.set('123');
      expect(customer1.localProp).toBe('123');
      expect(order1.customer.localProp).toBe('123');
    });

    it('should keep binding between wrapped and direct model instances as embedded documents - Nested->D1', async () => {
      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        kind: 'CreditCardPaymentMethod',
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired: { month: 12, year: 2025 },
      };
      const payment = new CreditCardPaymentMethod(ccPaymentData);
      expect(payment.expired).toBeInstanceOf(CreditCardPaymentMethodExpire);
      expect(payment.expired.constructor).not.toBe(CreditCardPaymentMethodExpire);
      expect(payment.expired.token).toBeTruthy();

      const orderData: Partial<Order> = { status: OrderStatusType.Pending, payment };
      const order = new Order(orderData);

      const oPayment: CreditCardPaymentMethod = order.payment as any;
      expect(oPayment).not.toBe(payment);
      expect(oPayment).toBeInstanceOf(CreditCardPaymentMethod);
      expect(oPayment.constructor).not.toBe(CreditCardPaymentMethod);

      expect(oPayment.expired).toBe(payment.expired);
      expect(oPayment.expired).toBeInstanceOf(CreditCardPaymentMethodExpire);
      expect(oPayment.expired.constructor).not.toBe(CreditCardPaymentMethodExpire);
      expect(payment.expired.token).toBeTruthy();

      payment.expired.token = '!';
      expect(payment.expired.token).toBe('!');
      expect(oPayment.expired.token).toBe(payment.expired.token);

      expect(payment.ccNumber).toBe(ccPaymentData.ccNumber);
      expect(oPayment.ccNumber).toBe(ccPaymentData.ccNumber);
      payment.ccNumber = '!';
      expect(payment.ccNumber).not.toBe(ccPaymentData.ccNumber);
      expect(payment.ccNumber).toBe('!');
      expect(oPayment.ccNumber).toBe(payment.ccNumber);
    });

    it('should keep binding between wrapped and direct model instances as embedded documents - Nested->D2', async () => {
      const expired = new CreditCardPaymentMethodExpire({ month: 12, year: 2025 });
      expect(expired.token).toBeTruthy();

      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        kind: 'CreditCardPaymentMethod',
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired, // single nested document (embedded)
      };
      const payment = new CreditCardPaymentMethod(ccPaymentData);

      expired.token = 'token';
      expect(expired.token).toBe('token');
      expect(payment.expired.token).toBe(expired.token);

      const orderData: Partial<Order> = { status: OrderStatusType.Pending, payment };
      const order = new Order(orderData);

      expect(expired).toBeInstanceOf(CreditCardPaymentMethodExpire);
      expect(payment.expired).toBeInstanceOf(CreditCardPaymentMethodExpire);
      expect((order.payment as any).expired).toBeInstanceOf(CreditCardPaymentMethodExpire);
      expect(expired.constructor).toBe(CreditCardPaymentMethodExpire);
      expect(payment.expired.constructor).not.toBe(CreditCardPaymentMethodExpire);
      expect((order.payment as any).expired.constructor).not.toBe(CreditCardPaymentMethodExpire);

      expect(expired.token).toBeTruthy();
      expect((order.payment as any).expired.token).toBe(expired.token);
      expect(payment.expired.token).toBe(expired.token);

      payment.expired.token = '!';
      expect(payment.expired.token).toBe('!');
      expect(payment.expired.token).toBe(expired.token);
      expect((order.payment as any).expired.token).toBe(expired.token);

      expired.token = '!!';
      expect(expired.token).toBe('!!');
      expect(payment.expired.token).toBe(expired.token);
      expect((order.payment as any).expired.token).toBe(expired.token);

      expect(payment.ccNumber).toBe(ccPaymentData.ccNumber);
      expect((order.payment as any).ccNumber).toBe(ccPaymentData.ccNumber);
      payment.ccNumber = '!';
      expect(payment.ccNumber).not.toBe(ccPaymentData.ccNumber);
      expect(payment.ccNumber).toBe('!');
      expect((order.payment as any).ccNumber).toBe(payment.ccNumber);
    });

  });

  describe('Embedded Models In Arrays', () => {

    beforeEach(() => {
      Order.INSTANCE_COUNTER = 1;
      Customer.INSTANCE_COUNTER = 1;
      OrderItem.INSTANCE_COUNTER = 1;
    });

    it('should create a wrapped model instance - Arrays', async () => {
      const item = new OrderItem({ sku: 'A4', quantity: 4 });
      const order1 = await Order.create({
        items: [ { sku: 'A1', quantity: 1 }, { sku: 'A7', quantity: 7 } ],
      });
      const order2 = await Order.create({
        items: [ { sku: 'A2', quantity: 2 } ],
      });
      const order3 = await Order.create({ items: [ item ] });

      expect(order1.items.length).toBe(2);
      expect(order2.items.length).toBe(1);
      expect(order3.items.length).toBe(1);
      const [ item1_1, item1_2 ] = order1.items;
      const [ item2_1 ] = order2.items;
      const [ item3_1 ] = order3.items;

      expect(item1_1.instanceId).toBe(2);
      expect(item1_2.instanceId).toBe(3);
      expect(item2_1.instanceId).toBe(4);
      expect(item3_1.instanceId).toBe(1);

      expect(item1_1.sku).toBe('A1');
      expect(item1_2.sku).toBe('A7');
      expect(item2_1.sku).toBe('A2');
      expect(item1_1.quantity).toBe(1);
      expect(item1_2.quantity).toBe(7);
      expect(item2_1.quantity).toBe(2);

      expect(item1_1).toBeInstanceOf(OrderItem);
      expect(item1_2).toBeInstanceOf(OrderItem);
      expect(item2_1).toBeInstanceOf(OrderItem);
      expect(item3_1).toBeInstanceOf(OrderItem);
      expect(item).toBeInstanceOf(OrderItem);
      expect(item1_1.constructor).not.toBe(OrderItem);
      expect(item1_1.constructor).not.toBe(OrderItem);
      expect(item1_2.constructor).not.toBe(OrderItem);
      expect(item2_1.constructor).not.toBe(OrderItem);
      expect(item3_1.constructor).not.toBe(OrderItem);
      expect(item.constructor).toBe(OrderItem);
    });

    it('should keep binding between wrapped and direct model instances as embedded documents in Arrays', async () => {
      const createItems = () => {
        const item1 = new OrderItem({ sku: 'A1', quantity: 1 });
        const item2 = { sku: 'A2', quantity: 2 } as OrderItem;
        return [ item1, item2 ];
      };

      const items1 = createItems();
      const items2 = createItems();

      const order1 = new Order({ items: items1 as any });
      const order2 = await Order.create({ items: items2 });

      const [ item1_1, item1_2 ] = order1.items;

      expect(order1.items).toBeInstanceOf(Array);
      for (const item of [...order1.items, ...order2.items]) {
        expect(item).toBeInstanceOf(OrderItem);
        expect(item.constructor).not.toBe(OrderItem);
      }

      expect(items1[1].localProp).toBeFalsy();
      expect(item1_2.localProp).toBeTruthy();
      expect(item1_2.instanceId).toBeTruthy();

      expect(item1_1.localProp).toBeTruthy();
      expect(item1_1.localProp).toBe(items1[0].localProp);
      items1[0].localProp = 'localProp';
      expect(item1_1.localProp).toBe('localProp');
      expect(order1.items[0].localProp).toBe('localProp');

      expect(item1_1.sku).toBeTruthy();
      expect(item1_1.sku).toBe(items1[0].sku);
      items1[0].sku = 'Nothing';
      expect(item1_1.sku).toBe('Nothing');
      expect(order1.items[0].sku).toBe('Nothing');

      let desc = Object.getOwnPropertyDescriptor(items1[0], 'sku');
      expect(desc.get()).toBe(item1_1.sku);
      desc.set('123');
      expect(items1[0].sku).toBe('123');
      expect(item1_1.sku).toBe('123');

      desc = Object.getOwnPropertyDescriptor(items1[0], 'localProp');
      expect(desc.get()).toBe(item1_1.localProp);
      desc.set('123');
      expect(items1[0].localProp).toBe('123');
      expect(item1_1.localProp).toBe('123');

      desc = Object.getOwnPropertyDescriptor(items1[1], 'localProp');
      expect(desc).toBeUndefined();

      expect(item1_2.localProp).toBeTruthy();
      expect(items1[1].localProp).toBeFalsy();
      items1[1].localProp = 'localProp';
      expect(item1_2.localProp).not.toBe('localProp');

    });

    it('should keep binding between wrapped and direct model instances as embedded documents in Arrays - Nested->D1', async () => {

      const supplierData: Partial<PickupSupplierInfo> = {
        kind: 'PickupSupplierInfo',
        supplyDate: new Date(),
        subDocument: {
          someValue: 'test',
        },
      };

      const item = new OrderItem({ sku: 'A1', quantity: 1, supplier: supplierData as any });

      expect(item.supplier).toBeInstanceOf(PickupSupplierInfo);
      expect(item.supplier.constructor).not.toBe(PickupSupplierInfo);
      expect(item.supplier.token).toBeTruthy();
      expect(item.supplier.subDocument).toBeInstanceOf(SupplierInfoSubDocument);
      expect(item.supplier.subDocument.constructor).not.toBe(SupplierInfoSubDocument);
      expect(item.supplier.subDocument.token).toBeTruthy();

      const order = new Order({ items: [ item ] as any });
      const [ item1 ] = order.items;

      expect(item).not.toBe(item1);
      expect(item1.supplier).toBeInstanceOf(PickupSupplierInfo);
      expect(item1.supplier.constructor).not.toBe(PickupSupplierInfo);
      expect(item1.supplier.token).toBeTruthy();
      expect(item1.supplier.subDocument).toBeInstanceOf(SupplierInfoSubDocument);
      expect(item1.supplier.subDocument.constructor).not.toBe(SupplierInfoSubDocument);
      expect(item1.supplier.subDocument.token).toBe(item.supplier.subDocument.token);

      item.supplier.subDocument.token = '!';
      expect(item.supplier.subDocument.token).toBe('!');
      expect(item1.supplier.subDocument.token).toBe('!');

      expect(item.supplier.supplyDate).toBe(supplierData.supplyDate);
      expect(item1.supplier.supplyDate).toBe(supplierData.supplyDate);
      const newSupplyDate = new Date(Date.now() + 5000);
      item.supplier.supplyDate = newSupplyDate;
      expect(item.supplier.supplyDate).not.toBe(supplierData.supplyDate);
      expect(item.supplier.supplyDate).toBe(newSupplyDate);
      expect(item1.supplier.supplyDate).toBe(item.supplier.supplyDate);
    });

    it('should keep binding between wrapped and direct model instances as embedded documents in Arrays - Nested->D2', async () => {
      const subDocument = new SupplierInfoSubDocument({ someValue: 'test' });
      expect(subDocument).toBeInstanceOf(SupplierInfoSubDocument);
      expect(subDocument.constructor).toBe(SupplierInfoSubDocument);
      expect(subDocument.token).toBeTruthy();

      const supplierData: Partial<PickupSupplierInfo> = {
        kind: 'PickupSupplierInfo',
        supplyDate: new Date(),
        subDocument,
      };
      const item = new OrderItem({ sku: 'A1', quantity: 1, supplier: supplierData as any });

      expect(item.supplier.token).toBeTruthy();
      expect(item.supplier.subDocument).toBeInstanceOf(SupplierInfoSubDocument);
      expect(item.supplier.constructor).not.toBe(SupplierInfoSubDocument);
      expect(item.supplier.subDocument).not.toBe(subDocument);
      expect(item.supplier.subDocument.token).toBe(subDocument.token);

      const order = new Order({ items: [ item ] as any });
      const [ item1 ] = order.items;

      expect(item).not.toBe(item1);
      expect(item1.supplier.token).toBeTruthy();
      expect(item1.supplier.subDocument).toBeInstanceOf(SupplierInfoSubDocument);
      expect(item1.supplier.constructor).not.toBe(SupplierInfoSubDocument);
      expect(item1.supplier.subDocument.token).toBe(subDocument.token);

      subDocument.token = '!';
      expect(subDocument.token).toBe('!');
      expect(item.supplier.subDocument.token).toBe(subDocument.token);
      expect(item1.supplier.subDocument.token).toBe(subDocument.token);

      item.supplier.subDocument.token = '!!';
      expect(item.supplier.subDocument.token).toBe('!!');
      expect(item.supplier.subDocument.token).toBe(subDocument.token);
      expect(item1.supplier.subDocument.token).toBe(subDocument.token);

      item.supplier.token = '!!!';
      expect(item.supplier.token).toBe('!!!');
      expect(item1.supplier.token).toBe('!!!');
    });

  });
});
