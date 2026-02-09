import { BaseRepository } from './BaseRepository.js';
import Payment from '../models/Payment.js';

export class PaymentRepository extends BaseRepository<Payment> {
    constructor() {
        super(Payment);
    }
}

export default new PaymentRepository();
