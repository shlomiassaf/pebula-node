import { initMongoConnection, checkDocumentAfterCreate, checkSubDocumentAfterCreate } from './utils';
import {
  Order,
  OrderStatusType,
  CreditCardPaymentMethod,
  CreditCardPaymentMethodExpire,
  Customer,
  CustomerGenderType,
  BaseComm,
  PhoneComm,
  EmailComm,
  ResidenceComm,
  BasePaymentMethod,
  OrderItem,
} from './domain';

describe('E2E Tests', () => {
  initMongoConnection();

  describe('Discriminators support', () => {

    it('discriminator should automatically have their key populated', async () => {
      const phoneCommData: Partial<PhoneComm> = { phone: '999-999-9999' };
      const emailCommData: Partial<EmailComm> = { email: 'test@testing.teset' };
      const residenceCommData: Partial<ResidenceComm> = {
        street: 'Testing Street',
        city: 'Testville',
        zip: 'TEST900',
        country: 'Testland',
      };

      const phoneComm = new PhoneComm(phoneCommData);
      const emailComm = new EmailComm(emailCommData);
      const residenceComm = new ResidenceComm(residenceCommData);

      expect(phoneComm.type).toBe(PhoneComm.name);
      expect(emailComm.type).toBe(EmailComm.name);
      expect(residenceComm.type).toBe(ResidenceComm.name);

      const customerData: Partial<Customer> = {
        name: 'Test User',
        age: 99,
        gender: CustomerGenderType.Male,
        communication: [
          phoneComm,
          emailComm,
          residenceComm,
          { type: 'PhoneComm', ...phoneCommData },
          { type: 'EmailComm', ...emailCommData },
          { type: 'ResidenceComm', ...residenceCommData },
        ] as any,
      };

      const customer = new Customer(customerData);

      expect(customer.communication[3].token).toBeTruthy();
      expect(customer.communication[3].type).toBe(PhoneComm.name);
      expect(customer.communication[4].type).toBe(EmailComm.name);
      expect(customer.communication[5].type).toBe(ResidenceComm.name);
    });

    it('mongoose generated discriminators class should reflect the declared class', async () => {
      const orderData: Partial<Order> = { status: OrderStatusType.Pending };
      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired: new CreditCardPaymentMethodExpire({ month: 12, year: 2025 }),
      };

      const order = new Order(orderData);
      const payment = new CreditCardPaymentMethod(ccPaymentData);
      order.payment = payment;

      expect(payment.constructor).toBe(CreditCardPaymentMethod);
      expect(order.payment.constructor).not.toBe(CreditCardPaymentMethod);

      expect(payment).toBeInstanceOf(CreditCardPaymentMethod);
      expect(payment).toBeInstanceOf(BasePaymentMethod);
      expect(order.payment).toBeInstanceOf(CreditCardPaymentMethod);
      expect(order.payment).toBeInstanceOf(BasePaymentMethod);

      order.items.push({});
      const orderItem = order.items[0];
      expect(orderItem).toBeInstanceOf(OrderItem);
    });

    it('Support single embedded discriminator', async () => {
      const orderData: Partial<Order> = { status: OrderStatusType.Pending };
      let order = new Order(orderData);
      order = await order.save();
      checkDocumentAfterCreate(order, orderData);

      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired: new CreditCardPaymentMethodExpire({ month: 12, year: 2025 }),
      };
      order.payment = new CreditCardPaymentMethod(ccPaymentData);
      order = await order.save();

      checkDocumentAfterCreate(order.payment, ccPaymentData);
    });

    it('Support embedded discriminators in arrays', async () => {
      const customerData: Partial<Customer> = { name: 'Test User', age: 99, gender: CustomerGenderType.Male };
      const phoneCommData: Partial<PhoneComm> = { phone: '999-999-9999' };
      const emailCommData: Partial<EmailComm> = { email: 'test@testing.teset' };
      const residenceCommData: Partial<ResidenceComm> = {
        street: 'Testing Street',
        city: 'Testville',
        zip: 'TEST900',
        country: 'Testland',
      };
      const phoneCommDataRaw = { type: 'PhoneComm', ...phoneCommData };
      const emailCommDataRaw = { type: 'EmailComm', ...emailCommData };
      const residenceCommDataRaw = { type: 'ResidenceComm', ...residenceCommData };

      let customer = new Customer(customerData);
      customer = await customer.save();

      checkDocumentAfterCreate(customer, customerData);

      customer.communication.push(
        new PhoneComm(phoneCommData),
        new EmailComm(emailCommData),
        new ResidenceComm(residenceCommData),
        phoneCommDataRaw as BaseComm,
        emailCommDataRaw as BaseComm,
        residenceCommDataRaw as BaseComm,
      );

      customer = await customer.save();

      for (const comm of customer.communication) {
        expect(comm.token).toBeTruthy();
      }

      checkSubDocumentAfterCreate(customer.communication[0], phoneCommData);
      checkSubDocumentAfterCreate(customer.communication[1], emailCommData);
      checkSubDocumentAfterCreate(customer.communication[2], residenceCommData);
      checkSubDocumentAfterCreate(customer.communication[3], phoneCommDataRaw);
      checkSubDocumentAfterCreate(customer.communication[4], emailCommDataRaw);
      checkSubDocumentAfterCreate(customer.communication[5], residenceCommDataRaw);
    });

    it('mongoose generated discriminators class in array should reflect the declared class', async () => {
      const customerData: Partial<Customer> = { name: 'Test User', age: 99, gender: CustomerGenderType.Male };
      const phoneCommData: Partial<PhoneComm> = { phone: '999-999-9999' };
      const emailCommData: Partial<EmailComm> = { email: 'test@testing.teset' };
      const residenceCommData: Partial<ResidenceComm> = {
        street: 'Testing Street',
        city: 'Testville',
        zip: 'TEST900',
        country: 'Testland',
      };
      const phoneCommDataRaw = { type: 'PhoneComm', ...phoneCommData };
      const emailCommDataRaw = { type: 'EmailComm', ...emailCommData };
      const residenceCommDataRaw = { type: 'ResidenceComm', ...residenceCommData };

      let customer = new Customer(customerData);
      customer = await customer.save();

      customer.communication.push(
        new PhoneComm(phoneCommData),
        new EmailComm(emailCommData),
        new ResidenceComm(residenceCommData),
        phoneCommDataRaw as BaseComm,
        emailCommDataRaw as BaseComm,
        residenceCommDataRaw as BaseComm,
      );

      customer = await customer.save();

      const [phoneComm, emailComm, residenceComm, phoneCommRaw, emailCommRaw, residenceCommRaw] = customer.communication;
      expect(phoneComm).toBeInstanceOf(PhoneComm);
      expect(emailComm).toBeInstanceOf(EmailComm);
      expect(residenceComm).toBeInstanceOf(ResidenceComm);
      expect(phoneCommRaw).toBeInstanceOf(PhoneComm);
      expect(emailCommRaw).toBeInstanceOf(EmailComm);
      expect(residenceCommRaw).toBeInstanceOf(ResidenceComm);
    });

  });
});
