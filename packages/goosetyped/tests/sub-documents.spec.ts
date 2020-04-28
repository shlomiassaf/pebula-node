import { initMongoConnection, checkDocumentAfterCreate, checkSubDocumentAfterCreate } from './utils';
import {
  Order,
  OrderStatusType,
  CreditCardPaymentMethod,
  CreditCardPaymentMethodExpire,
  Customer,
  CustomerGenderType,
  PhoneComm,
  EmailComm,
  ResidenceComm,
} from './domain';

describe('E2E Tests', () => {
  initMongoConnection();

  describe('SubDocument support', () => {

    it('mongoose generated sub document class should reflect the declared class', async () => {
      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired: new CreditCardPaymentMethodExpire({ month: 12, year: 2025 }),
      };

      const payment = new CreditCardPaymentMethod(ccPaymentData);
      checkDocumentAfterCreate(payment, ccPaymentData);

      const { expired } = payment;
      expect(ccPaymentData.expired.constructor).toBe(CreditCardPaymentMethodExpire);
      expect(expired.constructor).not.toBe(CreditCardPaymentMethodExpire);

      expect(expired).toBeInstanceOf(CreditCardPaymentMethodExpire);
      expect(ccPaymentData.expired).toBeInstanceOf(CreditCardPaymentMethodExpire);
    });

    it('class constructor should run when mongoose is used to init embedded types from a POJO', async () => {
      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired: { month: 12, year: 2025 },
      };

      const payment = new CreditCardPaymentMethod(ccPaymentData);
      const { expired } = payment;
      expect(expired.token).toBeTruthy();
      checkSubDocumentAfterCreate(expired, ccPaymentData.expired);
    });

    it('local class members should reflect in embedded documents when set from parent constructor', async () => {
      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired: new CreditCardPaymentMethodExpire({ month: 12, year: 2025 }),
      };

      const payment = new CreditCardPaymentMethod(ccPaymentData);
      const { expired } = payment;
      expect(expired.token).toBeTruthy();
      checkSubDocumentAfterCreate(expired, ccPaymentData.expired);
    });

    it('local class members should reflect in embedded documents when set from create()', async () => {
      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired: new CreditCardPaymentMethodExpire({ month: 12, year: 2025 }),
      };

      const payment = await CreditCardPaymentMethod.create(ccPaymentData);
      const { expired } = payment;
      expect(expired.token).toBeTruthy();
      checkSubDocumentAfterCreate(expired, ccPaymentData.expired);
    });

    it('local class members should reflect in embedded documents when set from ancestor constructor', async () => {
      const ccPaymentData: Partial<CreditCardPaymentMethod> = {
        kind: 'CreditCardPaymentMethod',
        holderName: 'Testing Joe',
        ccNumber: '1234-5534-4323-4343',
        expired: { month: 12, year: 2025 },
      };

      const orderData: Partial<Order> = {
        status: OrderStatusType.Pending,
        payment: ccPaymentData as any,
      };

      let order = new Order(orderData);
      order = await order.save();
      checkDocumentAfterCreate(order, orderData);
    });

    it('discriminator should automatically have their key populated', async () => {
      const phoneCommData: Partial<PhoneComm> = { phone: '999-999-9999' };

      const phoneComm = new PhoneComm(phoneCommData);

      const customerData: Partial<Customer> = {
        name: 'Test User',
        age: 99,
        gender: CustomerGenderType.Male,
        communication: [ phoneComm ] as any,
      };

      const customer = new Customer(customerData);

      const phone = customer.communication[0];
      expect(phone.token).toBe(phoneComm.token);
      phoneComm.token = 'abcd';
      expect(phone.token).toBe(phoneComm.token);
      phone.token = '123';
      expect(phoneComm.token).toBe(phone.token);
    });
  });
});
